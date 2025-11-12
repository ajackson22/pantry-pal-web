import { supabase } from '../supabase';
import { ShoppingListItem } from '../types/database';

export class ShoppingService {
  async getItems(userId: string, completed?: boolean): Promise<ShoppingListItem[]> {
    let query = supabase
      .from('shopping_list_items')
      .select('*')
      .eq('user_id', userId);

    if (completed !== undefined) {
      query = query.eq('completed', completed);
    }

    query = query
      .order('completed', { ascending: true })
      .order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) throw new Error(error.message);
    return data || [];
  }

  async getItem(userId: string, itemId: string): Promise<ShoppingListItem | null> {
    const { data, error } = await supabase
      .from('shopping_list_items')
      .select('*')
      .eq('id', itemId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data;
  }

  async createItem(userId: string, item: Partial<ShoppingListItem>): Promise<ShoppingListItem> {
    const { data, error } = await supabase
      .from('shopping_list_items')
      .insert({ ...item, user_id: userId })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async updateItem(
    userId: string,
    itemId: string,
    updates: Partial<ShoppingListItem>
  ): Promise<ShoppingListItem> {
    const { data, error } = await supabase
      .from('shopping_list_items')
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
      .from('shopping_list_items')
      .delete()
      .eq('id', itemId)
      .eq('user_id', userId);

    if (error) throw new Error(error.message);
  }

  async clearCompleted(userId: string): Promise<void> {
    const { error } = await supabase
      .from('shopping_list_items')
      .delete()
      .eq('user_id', userId)
      .eq('completed', true);

    if (error) throw new Error(error.message);
  }
}

export const shoppingService = new ShoppingService();
