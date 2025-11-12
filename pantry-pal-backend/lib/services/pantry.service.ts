import { supabase } from '../supabase';
import { PantryItem } from '../types/database';

export interface PantryFilters {
  location?: 'fridge' | 'freezer' | 'pantry';
  category?: string;
  search?: string;
  expiring?: number;
}

export class PantryService {
  async getItems(userId: string, filters?: PantryFilters): Promise<PantryItem[]> {
    let query = supabase
      .from('pantry_items')
      .select('*')
      .eq('user_id', userId);

    if (filters?.location) {
      query = query.eq('location', filters.location);
    }

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }

    if (filters?.search) {
      query = query.ilike('name', `%${filters.search}%`);
    }

    if (filters?.expiring) {
      const expiringDate = new Date();
      expiringDate.setDate(expiringDate.getDate() + filters.expiring);
      query = query
        .not('expiry_date', 'is', null)
        .lte('expiry_date', expiringDate.toISOString());
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) throw new Error(error.message);
    return data || [];
  }

  async getItem(userId: string, itemId: string): Promise<PantryItem | null> {
    const { data, error } = await supabase
      .from('pantry_items')
      .select('*')
      .eq('id', itemId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data;
  }

  async createItem(userId: string, item: Partial<PantryItem>): Promise<PantryItem> {
    const { data, error } = await supabase
      .from('pantry_items')
      .insert({ ...item, user_id: userId })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async updateItem(userId: string, itemId: string, updates: Partial<PantryItem>): Promise<PantryItem> {
    const { data, error } = await supabase
      .from('pantry_items')
      .update(updates)
      .eq('id', itemId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async deleteItem(userId: string, itemId: string): Promise<void> {
    const { error } = await supabase
      .from('pantry_items')
      .delete()
      .eq('id', itemId)
      .eq('user_id', userId);

    if (error) throw new Error(error.message);
  }

  async bulkUpdate(userId: string, updates: Array<{ id: string; updates: Partial<PantryItem> }>): Promise<PantryItem[]> {
    const updatedItems: PantryItem[] = [];

    for (const update of updates) {
      const item = await this.updateItem(userId, update.id, update.updates);
      updatedItems.push(item);
    }

    return updatedItems;
  }

  async bulkDelete(userId: string, ids: string[]): Promise<void> {
    const { error } = await supabase
      .from('pantry_items')
      .delete()
      .eq('user_id', userId)
      .in('id', ids);

    if (error) throw new Error(error.message);
  }

  async bulkCreate(userId: string, items: Array<Partial<PantryItem>>): Promise<PantryItem[]> {
    const itemsWithUserId = items.map(item => ({ ...item, user_id: userId }));

    const { data, error } = await supabase
      .from('pantry_items')
      .insert(itemsWithUserId)
      .select();

    if (error) throw new Error(error.message);
    return data || [];
  }
}

export const pantryService = new PantryService();
