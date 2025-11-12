import { NextRequest } from 'next/server';
import { settingsService } from '@/lib/services/settings.service';
import { createErrorResponse, createSuccessResponse, getUserIdFromRequest } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return createErrorResponse('Unauthorized', 401);
    }

    const settings = await settingsService.getSettings(userId);
    return createSuccessResponse({ settings });
  } catch (error: any) {
    return createErrorResponse(error.message || 'Failed to fetch settings', 400);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return createErrorResponse('Unauthorized', 401);
    }

    const body = await request.json();
    const settings = await settingsService.updateSettings(userId, body);
    return createSuccessResponse({ settings });
  } catch (error: any) {
    return createErrorResponse(error.message || 'Failed to update settings', 400);
  }
}
