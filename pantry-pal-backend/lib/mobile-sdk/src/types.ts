export interface PantryPalConfig {
  baseUrl: string;
  apiKey?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  code?: string;
}

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

export interface PantryItemInput {
  name: string;
  quantity: number;
  unit: string;
  category?: string;
  location: 'fridge' | 'freezer' | 'pantry';
  expiry_date?: string;
}

export interface PantryFilters {
  location?: 'fridge' | 'freezer' | 'pantry';
  category?: string;
  search?: string;
  expiring?: number;
}

export interface Recipe {
  id: string;
  user_id: string;
  title: string;
  description: string;
  cooking_time: number;
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  ingredients: Array<{
    name: string;
    quantity: number;
    unit: string;
  }>;
  instructions: string[];
  dietary_restrictions?: string[];
  genre?: string;
  child_friendly?: boolean;
  suited_for_meal_types?: string[];
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface RecipeSearchCriteria {
  genres?: string[];
  dietaryRestrictions?: string[];
  maxCookingTime?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  servings?: number;
  limit?: number;
}

export interface RecipeGenerateInput {
  numOfRecipesToGenerate: number;
  isRandom?: boolean;
  selectedGenres?: string[];
  selectedDietary?: string[];
  maxCookingTime?: number;
  difficulty?: string;
  childFriendly?: boolean;
  servings?: number;
  userPrompt?: string;
  usePantryIngredients?: boolean;
}

export interface MealPlan {
  id: string;
  user_id: string;
  recipe_id: string;
  date: string;
  meal_type: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  calendar_event_id?: string;
  sync_with_calendar?: boolean;
  created_at: string;
  updated_at: string;
  recipe?: Recipe;
}

export interface MealPlanInput {
  scheduled_meals: Array<{
    recipe_id: string;
    date: string;
    meal_type: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  }>;
  syncWithCalendar?: boolean;
}

export interface MealPlanContext {
  calendarEvents: any[];
  settings: UserSettings;
}

export interface ShoppingListItem {
  id: string;
  user_id: string;
  name: string;
  quantity?: number;
  unit?: string;
  category?: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface ShoppingListItemInput {
  name: string;
  quantity?: number;
  unit?: string;
  category?: string;
  completed?: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  provider?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfileInput {
  fullName?: string;
  avatarUrl?: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  meal_times?: {
    breakfast?: string;
    lunch?: string;
    dinner?: string;
    snacks?: string;
  };
  sync_with_calendar?: boolean;
  recipe_preferences?: {
    dietary_restrictions?: string[];
    favorite_genres?: string[];
    cooking_skill?: string;
  };
  pantrypal_calendar_id?: string;
  calendar_sync_ids?: any;
  created_at: string;
  updated_at: string;
}

export interface UserSettingsInput {
  meal_times?: {
    breakfast?: string;
    lunch?: string;
    dinner?: string;
    snacks?: string;
  };
  sync_with_calendar?: boolean;
  recipe_preferences?: {
    dietary_restrictions?: string[];
    favorite_genres?: string[];
    cooking_skill?: string;
  };
  pantrypal_calendar_id?: string;
  calendar_sync_ids?: any;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  message: string;
  conversationHistory?: ChatMessage[];
}

export interface ChatResponse {
  response: string;
  functionCalled?: string;
  functionResults?: any;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}
