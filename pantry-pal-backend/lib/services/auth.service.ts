import { supabase } from '../supabase';
import { generateToken } from '../utils';

export interface SignUpData {
  email: string;
  password: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export class AuthService {
  async signUp(data: SignUpData) {
    const { email, password } = data;

    const { data: authData, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!authData.user) {
      throw new Error('User creation failed');
    }

    const token = generateToken({
      userId: authData.user.id,
      email: authData.user.email!,
    });

    await supabase.from('user_settings').insert({
      user_id: authData.user.id,
    });

    return {
      user: {
        id: authData.user.id,
        email: authData.user.email,
      },
      token,
    };
  }

  async signIn(data: SignInData) {
    const { email, password } = data;

    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!authData.user) {
      throw new Error('Sign in failed');
    }

    const token = generateToken({
      userId: authData.user.id,
      email: authData.user.email!,
    });

    return {
      user: {
        id: authData.user.id,
        email: authData.user.email,
      },
      token,
    };
  }

  async signOut(token: string) {
    await supabase.auth.signOut();
    return { success: true };
  }

  async getCurrentUser(userId: string) {
    const { data, error } = await supabase.auth.admin.getUserById(userId);

    if (error) {
      throw new Error(error.message);
    }

    return {
      id: data.user.id,
      email: data.user.email,
    };
  }

  async signInWithGoogle(accessToken: string) {
    const { data, error } = await supabase.auth.getUser(accessToken);

    if (error) {
      throw new Error(error.message);
    }

    const token = generateToken({
      userId: data.user.id,
      email: data.user.email!,
    });

    const { data: existingSettings } = await supabase
      .from('user_settings')
      .select('id')
      .eq('user_id', data.user.id)
      .maybeSingle();

    if (!existingSettings) {
      await supabase.from('user_settings').insert({
        user_id: data.user.id,
      });
    }

    return {
      user: {
        id: data.user.id,
        email: data.user.email,
      },
      token,
    };
  }
}

export const authService = new AuthService();
