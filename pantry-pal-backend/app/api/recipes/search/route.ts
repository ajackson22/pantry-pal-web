import { NextRequest } from 'next/server';
import { recipeService, RecipeSearchFilters } from '@/lib/services/recipe.service';
import { createErrorResponse, createSuccessResponse, getUserIdFromRequest } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return createErrorResponse('Unauthorized', 401);
    }

    const { searchParams } = new URL(request.url);

    const filters: RecipeSearchFilters = {};

    const genresParam = searchParams.get('genres');
    if (genresParam) {
      filters.genres = genresParam.split(',').map(g => g.trim());
    }

    const dietaryParam = searchParams.get('dietary');
    if (dietaryParam) {
      filters.dietary = dietaryParam.split(',').map(d => d.trim());
    }

    const maxCookingTime = searchParams.get('maxCookingTime');
    if (maxCookingTime) {
      filters.maxCookingTime = parseInt(maxCookingTime);
    }

    const difficulty = searchParams.get('difficulty');
    if (difficulty && ['easy', 'medium', 'hard'].includes(difficulty)) {
      filters.difficulty = difficulty as 'easy' | 'medium' | 'hard';
    }

    const servings = searchParams.get('servings');
    if (servings) {
      filters.servings = parseInt(servings);
    }

    const limit = searchParams.get('limit');
    if (limit) {
      filters.limit = parseInt(limit);
    }

    const recipes = await recipeService.searchRecipes(filters);
    return createSuccessResponse({ data: recipes });
  } catch (error: any) {
    return createErrorResponse(error.message || 'Failed to search recipes', 400);
  }
}
