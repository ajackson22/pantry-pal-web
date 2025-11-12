import { supabase } from '../supabase';
import { Recipe, UserRecipeData, PantryItem } from '../types/database';

export interface RecipeSearchFilters {
  genres?: string[];
  dietary?: string[];
  maxCookingTime?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  servings?: number;
  limit?: number;
}

export interface RecipeGenerationParams {
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

export class RecipeService {
  async getRecipes(userId: string): Promise<Recipe[]> {
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  }

  async getRecipe(recipeId: string): Promise<Recipe | null> {
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('id', recipeId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data;
  }

  async createRecipe(userId: string, recipe: Partial<Recipe>): Promise<Recipe> {
    const { data, error } = await supabase
      .from('recipes')
      .insert({ ...recipe, user_id: userId })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async updateRecipe(userId: string, recipeId: string, updates: Partial<Recipe>): Promise<Recipe> {
    const { data, error } = await supabase
      .from('recipes')
      .update(updates)
      .eq('id', recipeId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async deleteRecipe(userId: string, recipeId: string): Promise<void> {
    const { error } = await supabase
      .from('recipes')
      .delete()
      .eq('id', recipeId)
      .eq('user_id', userId);

    if (error) throw new Error(error.message);
  }

  async getUserRecipeData(userId: string, recipeId: string): Promise<UserRecipeData | null> {
    const { data, error } = await supabase
      .from('user_recipe_data')
      .select('*')
      .eq('user_id', userId)
      .eq('recipe_id', recipeId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data;
  }

  async updateUserRecipeData(
    userId: string,
    recipeId: string,
    updates: Partial<UserRecipeData>
  ): Promise<UserRecipeData> {
    const { data, error } = await supabase
      .from('user_recipe_data')
      .upsert({
        user_id: userId,
        recipe_id: recipeId,
        ...updates,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async getFavorites(userId: string): Promise<Recipe[]> {
    const { data, error } = await supabase
      .from('user_recipe_data')
      .select('recipe_id, recipes(*)')
      .eq('user_id', userId)
      .eq('is_favorite', true);

    if (error) throw new Error(error.message);
    return data?.map((item: any) => item.recipes) || [];
  }

  async searchRecipes(filters: RecipeSearchFilters): Promise<Recipe[]> {
    let query = supabase
      .from('recipes')
      .select('*');

    if (filters.genres && filters.genres.length > 0) {
      query = query.in('genre', filters.genres);
    }

    if (filters.dietary && filters.dietary.length > 0) {
      query = query.contains('dietary_restrictions', filters.dietary);
    }

    if (filters.maxCookingTime) {
      query = query.lte('cooking_time', filters.maxCookingTime);
    }

    if (filters.difficulty) {
      query = query.eq('difficulty', filters.difficulty);
    }

    if (filters.servings) {
      query = query.eq('servings', filters.servings);
    }

    query = query.order('created_at', { ascending: false });

    if (filters.limit) {
      query = query.limit(filters.limit);
    } else {
      query = query.limit(10);
    }

    const { data, error } = await query;

    if (error) throw new Error(error.message);
    return data || [];
  }

  async saveRecipe(userId: string, recipeId: string): Promise<void> {
    const { error } = await supabase
      .from('user_recipe_data')
      .upsert({
        user_id: userId,
        recipe_id: recipeId,
        is_favorite: true,
      });

    if (error) throw new Error(error.message);
  }

  async unsaveRecipe(userId: string, recipeId: string): Promise<void> {
    const { error } = await supabase
      .from('user_recipe_data')
      .delete()
      .eq('user_id', userId)
      .eq('recipe_id', recipeId);

    if (error) throw new Error(error.message);
  }

  async bulkCreateRecipes(userId: string, recipes: Array<Partial<Recipe>>): Promise<Recipe[]> {
    const recipesWithUserId = recipes.map(recipe => ({ ...recipe, user_id: userId }));

    const { data, error } = await supabase
      .from('recipes')
      .insert(recipesWithUserId)
      .select();

    if (error) throw new Error(error.message);
    return data || [];
  }
}

export const recipeService = new RecipeService();
