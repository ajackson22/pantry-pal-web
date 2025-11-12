export interface PantryItem {
  id: string;
  user_id: string;
  name: string;
  quantity: number;
  unit: string;
  category?: string;
  location: 'fridge' | 'freezer' | 'pantry';
  expiry_date?: string;
  created_at: string;
  updated_at: string;
}

export interface Recipe {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  cooking_time?: number;
  servings?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  ingredients: any[];
  instructions: any[];
  dietary_restrictions?: any[];
  genre?: string;
  image_url?: string;
  child_friendly: boolean;
  suited_for_meal_types?: any[];
  created_at: string;
  updated_at: string;
}

export interface MealPlan {
  id: string;
  user_id: string;
  date: string;
  meal_type: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  recipe_id: string;
  calendar_event_id?: string;
  sync_with_calendar: boolean;
  created_at: string;
  updated_at: string;
}

export interface ShoppingListItem {
  id: string;
  user_id: string;
  name: string;
  quantity?: number;
  unit?: string;
  category?: string;
  completed: boolean;
  recipe_ids?: string[];
  recipe_names?: string[];
  created_at: string;
  updated_at: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  meal_times: {
    breakfast: string;
    lunch: string;
    dinner: string;
    snacks: string;
  };
  sync_with_calendar: boolean;
  recipe_preferences: any;
  pantrypal_calendar_id?: string;
  calendar_sync_ids?: any[];
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface SDKConfig {
  baseURL: string;
  token?: string;
}
