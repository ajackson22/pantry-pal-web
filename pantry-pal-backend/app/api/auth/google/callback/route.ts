import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createErrorResponse, createSuccessResponse, generateToken } from '@/lib/utils';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

interface GoogleTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

interface GoogleUserInfo {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
}

async function exchangeCodeForTokens(code: string): Promise<GoogleTokenResponse> {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID!,
      client_secret: GOOGLE_CLIENT_SECRET!,
      redirect_uri: GOOGLE_REDIRECT_URI!,
      grant_type: 'authorization_code',
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to exchange code: ${error.error_description || error.error}`);
  }

  return response.json();
}

async function getUserInfo(accessToken: string): Promise<GoogleUserInfo> {
  const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user info');
  }

  return response.json();
}

export async function GET(request: NextRequest) {
  try {
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI) {
      return createErrorResponse('Google OAuth not configured', 503);
    }

    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      return createErrorResponse(`OAuth error: ${error}`, 400);
    }

    if (!code) {
      return createErrorResponse('Authorization code is required', 400);
    }

    const tokens = await exchangeCodeForTokens(code);
    const userInfo = await getUserInfo(tokens.access_token);

    const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
      email: userInfo.email,
      password: userInfo.id,
    });

    let userId: string;

    if (signInError) {
      const { data: newUser, error: signUpError } = await supabase.auth.signUp({
        email: userInfo.email,
        password: userInfo.id,
        options: {
          data: {
            full_name: userInfo.name,
            avatar_url: userInfo.picture,
            provider: 'google',
          },
        },
      });

      if (signUpError || !newUser.user) {
        throw new Error('Failed to create user account');
      }

      userId = newUser.user.id;

      await supabase.from('user_settings').insert({
        user_id: userId,
      });
    } else {
      if (!authData.user) {
        throw new Error('Sign in failed');
      }
      userId = authData.user.id;
    }

    if (tokens.refresh_token) {
      await supabase.from('user_settings').upsert({
        user_id: userId,
        calendar_sync_ids: {
          google_refresh_token: tokens.refresh_token,
          google_access_token: tokens.access_token,
          google_token_expires: Date.now() + tokens.expires_in * 1000,
        },
      });
    }

    const jwtToken = generateToken({
      userId,
      email: userInfo.email,
    });

    return createSuccessResponse({
      user: {
        id: userId,
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
      },
      accessToken: jwtToken,
      refreshToken: tokens.refresh_token,
      googleAccessToken: tokens.access_token,
    });
  } catch (error: any) {
    console.error('Google OAuth callback error:', error);
    return createErrorResponse(error.message || 'OAuth callback failed', 400);
  }
}
