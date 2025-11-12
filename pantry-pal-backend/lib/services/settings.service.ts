import { supabase } from '../supabase';
import { UserSettings } from '../types/database';

export class SettingsService {
  async getSettings(userId: string): Promise<UserSettings | null> {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data;
  }

  async updateSettings(userId: string, updates: Partial<UserSettings>): Promise<UserSettings> {
    const { data: existing } = await supabase
      .from('user_settings')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (existing) {
      const { data, error } = await supabase
        .from('user_settings')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    } else {
      const { data, error } = await supabase
        .from('user_settings')
        .insert({ ...updates, user_id: userId })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    }
  }
}

export const settingsService = new SettingsService();
