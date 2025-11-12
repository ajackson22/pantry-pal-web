import { NextRequest } from 'next/server';
import { settingsService } from '@/lib/services/settings.service';
import { calendarService } from '@/lib/services/calendar.service';
import { createErrorResponse, createSuccessResponse, getUserIdFromRequest } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return createErrorResponse('Unauthorized', 401);
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start');
    const endDate = searchParams.get('end');

    const settings = await settingsService.getSettings(userId);

    let calendarEvents: any[] = [];

    if (settings?.sync_with_calendar && startDate && endDate) {
      try {
        calendarEvents = await calendarService.getCalendarEvents(userId, startDate, endDate);
      } catch (error) {
        console.error('Failed to fetch calendar events:', error);
      }
    }

    return createSuccessResponse({
      data: {
        calendarEvents,
        settings,
      },
    });
  } catch (error: any) {
    return createErrorResponse(error.message || 'Failed to fetch meal plan context', 400);
  }
}
