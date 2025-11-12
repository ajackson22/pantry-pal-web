import { NextRequest } from 'next/server';
import { authService } from '@/lib/services/auth.service';
import { createErrorResponse, createSuccessResponse, extractToken } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const token = extractToken(request);
    if (!token) {
      return createErrorResponse('Unauthorized', 401);
    }

    await authService.signOut(token);
    return createSuccessResponse({ message: 'Signed out successfully' });
  } catch (error: any) {
    return createErrorResponse(error.message || 'Sign out failed', 400);
  }
}
