import { NextRequest } from 'next/server';
import { authService } from '@/lib/services/auth.service';
import { createErrorResponse, createSuccessResponse } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return createErrorResponse('Email and password are required', 400);
    }

    const result = await authService.signIn({ email, password });
    return createSuccessResponse(result);
  } catch (error: any) {
    return createErrorResponse(error.message || 'Sign in failed', 401);
  }
}
