import { NextRequest } from 'next/server';
import { authService } from '@/lib/services/auth.service';
import { createErrorResponse, createSuccessResponse } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accessToken } = body;

    if (!accessToken) {
      return createErrorResponse('Access token is required', 400);
    }

    const result = await authService.signInWithGoogle(accessToken);
    return createSuccessResponse(result);
  } catch (error: any) {
    return createErrorResponse(error.message || 'Google sign in failed', 401);
  }
}
