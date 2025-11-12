import { NextRequest } from 'next/server';
import { recipeService } from '@/lib/services/recipe.service';
import { createErrorResponse, createSuccessResponse, getUserIdFromRequest } from '@/lib/utils';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return createErrorResponse('Unauthorized', 401);
    }

    const recipe = await recipeService.getRecipe(params.id);
    if (!recipe) {
      return createErrorResponse('Recipe not found', 404);
    }

    return createSuccessResponse({ recipe });
  } catch (error: any) {
    return createErrorResponse(error.message || 'Failed to fetch recipe', 400);
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return createErrorResponse('Unauthorized', 401);
    }

    const body = await request.json();
    const recipe = await recipeService.updateRecipe(userId, params.id, body);
    return createSuccessResponse({ recipe });
  } catch (error: any) {
    return createErrorResponse(error.message || 'Failed to update recipe', 400);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return createErrorResponse('Unauthorized', 401);
    }

    await recipeService.deleteRecipe(userId, params.id);
    return createSuccessResponse({ message: 'Recipe deleted successfully' });
  } catch (error: any) {
    return createErrorResponse(error.message || 'Failed to delete recipe', 400);
  }
}
