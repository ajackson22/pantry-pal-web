import { NextRequest } from 'next/server';
import { authService } from '@/lib/services/auth.service';
import { createErrorResponse, createSuccessResponse, getUserIdFromRequest } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return createErrorResponse('Unauthorized', 401);
    }

    const user = await authService.getCurrentUser(userId);
    return createSuccessResponse({ user });
  } catch (error: any) {
    return createErrorResponse(error.message || 'Failed to get user', 400);
  }
}
