import { NextRequest } from 'next/server';
import { recipeService } from '@/lib/services/recipe.service';
import { createErrorResponse, createSuccessResponse, getUserIdFromRequest } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return createErrorResponse('Unauthorized', 401);
    }

    const recipes = await recipeService.getRecipes(userId);
    return createSuccessResponse({ recipes });
  } catch (error: any) {
    return createErrorResponse(error.message || 'Failed to fetch recipes', 400);
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return createErrorResponse('Unauthorized', 401);
    }

    const body = await request.json();
    const recipe = await recipeService.createRecipe(userId, body);
    return createSuccessResponse({ recipe }, 201);
  } catch (error: any) {
    return createErrorResponse(error.message || 'Failed to create recipe', 400);
  }
}
