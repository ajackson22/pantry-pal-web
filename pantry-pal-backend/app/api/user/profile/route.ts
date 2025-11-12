import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createErrorResponse, createSuccessResponse, getUserIdFromRequest } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return createErrorResponse('Unauthorized', 401);
    }

    const { data: user, error } = await supabase.auth.admin.getUserById(userId);

    if (error || !user) {
      return createErrorResponse('User not found', 404);
    }

    const profile = {
      id: user.user.id,
      email: user.user.email,
      fullName: user.user.user_metadata?.full_name,
      avatarUrl: user.user.user_metadata?.avatar_url,
      provider: user.user.user_metadata?.provider,
      createdAt: user.user.created_at,
      updatedAt: user.user.updated_at,
    };

    return createSuccessResponse({ data: profile });
  } catch (error: any) {
    return createErrorResponse(error.message || 'Failed to fetch user profile', 400);
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
    if (body.fullName !== undefined) {
      updates.full_name = body.fullName;
    }
    if (body.avatarUrl !== undefined) {
      updates.avatar_url = body.avatarUrl;
    }

    if (Object.keys(updates).length === 0) {
      return createErrorResponse('No valid fields to update', 400);
    }

    const { data, error } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: updates,
    });

    if (error) {
      throw new Error(error.message);
    }

    const profile = {
      id: data.user.id,
      email: data.user.email,
      fullName: data.user.user_metadata?.full_name,
      avatarUrl: data.user.user_metadata?.avatar_url,
      provider: data.user.user_metadata?.provider,
      createdAt: data.user.created_at,
      updatedAt: data.user.updated_at,
    };

    return createSuccessResponse({ data: profile });
  } catch (error: any) {
    return createErrorResponse(error.message || 'Failed to update user profile', 400);
  }
}
