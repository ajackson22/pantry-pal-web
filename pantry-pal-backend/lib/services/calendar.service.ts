import { supabase } from '../supabase';
import { UserSettings } from '../types/database';

interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone?: string;
  };
  end: {
    dateTime: string;
    timeZone?: string;
  };
}

interface GoogleTokens {
  google_refresh_token?: string;
  google_access_token?: string;
  google_token_expires?: number;
}

export class CalendarService {
  private async getAccessToken(userId: string): Promise<string> {
    const { data: settings, error } = await supabase
      .from('user_settings')
      .select('calendar_sync_ids')
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !settings) {
      throw new Error('User settings not found');
    }

    const tokens = settings.calendar_sync_ids as unknown as GoogleTokens;

    if (!tokens?.google_refresh_token) {
      throw new Error('Google Calendar not connected. Please sign in with Google.');
    }

    if (tokens.google_access_token && tokens.google_token_expires) {
      if (Date.now() < tokens.google_token_expires) {
        return tokens.google_access_token;
      }
    }

    const newAccessToken = await this.refreshAccessToken(tokens.google_refresh_token);

    await supabase
      .from('user_settings')
      .update({
        calendar_sync_ids: {
          ...tokens,
          google_access_token: newAccessToken.access_token,
          google_token_expires: Date.now() + newAccessToken.expires_in * 1000,
        },
      })
      .eq('user_id', userId);

    return newAccessToken.access_token;
  }

  private async refreshAccessToken(refreshToken: string): Promise<{ access_token: string; expires_in: number }> {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh Google access token');
    }

    return response.json();
  }

  async findOrCreatePantryPalCalendar(userId: string): Promise<string> {
    const { data: settings } = await supabase
      .from('user_settings')
      .select('pantrypal_calendar_id')
      .eq('user_id', userId)
      .maybeSingle();

    if (settings?.pantrypal_calendar_id) {
      return settings.pantrypal_calendar_id;
    }

    const accessToken = await this.getAccessToken(userId);

    const response = await fetch('https://www.googleapis.com/calendar/v3/calendars', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        summary: 'PantryPal Meals',
        description: 'Meal plans created by PantryPal',
        timeZone: 'America/New_York',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to create calendar: ${error.error?.message || 'Unknown error'}`);
    }

    const calendar = await response.json();

    await supabase
      .from('user_settings')
      .update({ pantrypal_calendar_id: calendar.id })
      .eq('user_id', userId);

    return calendar.id;
  }

  async createCalendarEvent(
    userId: string,
    event: {
      summary: string;
      description?: string;
      date: string;
      mealTime: string;
    }
  ): Promise<string> {
    const accessToken = await this.getAccessToken(userId);
    const calendarId = await this.findOrCreatePantryPalCalendar(userId);

    const eventDate = new Date(event.date);
    const [hours, minutes] = event.mealTime.split(':').map(Number);

    const startDateTime = new Date(eventDate);
    startDateTime.setHours(hours, minutes, 0, 0);

    const endDateTime = new Date(startDateTime);
    endDateTime.setHours(hours + 1, minutes, 0, 0);

    const calendarEvent: CalendarEvent = {
      id: '',
      summary: event.summary,
      description: event.description,
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: 'America/New_York',
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: 'America/New_York',
      },
    };

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(calendarEvent),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to create calendar event: ${error.error?.message || 'Unknown error'}`);
    }

    const createdEvent = await response.json();
    return createdEvent.id;
  }

  async deleteCalendarEvent(userId: string, eventId: string): Promise<void> {
    const accessToken = await this.getAccessToken(userId);
    const calendarId = await this.findOrCreatePantryPalCalendar(userId);

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok && response.status !== 404) {
      const error = await response.json();
      throw new Error(`Failed to delete calendar event: ${error.error?.message || 'Unknown error'}`);
    }
  }

  async getCalendarEvents(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<CalendarEvent[]> {
    try {
      const accessToken = await this.getAccessToken(userId);
      const calendarId = await this.findOrCreatePantryPalCalendar(userId);

      const params = new URLSearchParams({
        timeMin: new Date(startDate).toISOString(),
        timeMax: new Date(endDate).toISOString(),
        singleEvents: 'true',
        orderBy: 'startTime',
      });

      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        console.error('Failed to fetch calendar events');
        return [];
      }

      const data = await response.json();
      return data.items || [];
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      return [];
    }
  }
}

export const calendarService = new CalendarService();
