import { NextRequest } from 'next/server';
import { settingsService } from '@/lib/services/settings.service';
import { createErrorResponse, createSuccessResponse, getUserIdFromRequest } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return createErrorResponse('Unauthorized', 401);
    }

    let settings = await settingsService.getSettings(userId);

    if (!settings) {
      settings = await settingsService.updateSettings(userId, {});
    }

    return createSuccessResponse({ data: settings });
  } catch (error: any) {
    return createErrorResponse(error.message || 'Failed to fetch user settings', 400);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return createErrorResponse('Unauthorized', 401);
    }

    const body = await request.json();

    const updates: any = {};

    if (body.meal_times !== undefined) {
      updates.meal_times = body.meal_times;
    }
    if (body.sync_with_calendar !== undefined) {
      updates.sync_with_calendar = body.sync_with_calendar;
    }
    if (body.recipe_preferences !== undefined) {
      updates.recipe_preferences = body.recipe_preferences;
    }
    if (body.pantrypal_calendar_id !== undefined) {
      updates.pantrypal_calendar_id = body.pantrypal_calendar_id;
    }
    if (body.calendar_sync_ids !== undefined) {
      updates.calendar_sync_ids = body.calendar_sync_ids;
    }

    if (Object.keys(updates).length === 0) {
      return createErrorResponse('No valid fields to update', 400);
    }

    const settings = await settingsService.updateSettings(userId, updates);
    return createSuccessResponse({ data: settings });
  } catch (error: any) {
    return createErrorResponse(error.message || 'Failed to update user settings', 400);
  }
}
