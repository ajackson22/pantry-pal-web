import { NextRequest } from 'next/server';
import { mealPlanService } from '@/lib/services/mealplan.service';
import { createErrorResponse, createSuccessResponse, getUserIdFromRequest } from '@/lib/utils';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return createErrorResponse('Unauthorized', 401);
    }

    const mealPlan = await mealPlanService.getMealPlan(userId, params.id);
    if (!mealPlan) {
      return createErrorResponse('Meal plan not found', 404);
    }

    return createSuccessResponse({ mealPlan });
  } catch (error: any) {
    return createErrorResponse(error.message || 'Failed to fetch meal plan', 400);
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return createErrorResponse('Unauthorized', 401);
    }

    const body = await request.json();
    const mealPlan = await mealPlanService.updateMealPlan(userId, params.id, body);
    return createSuccessResponse({ mealPlan });
  } catch (error: any) {
    return createErrorResponse(error.message || 'Failed to update meal plan', 400);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return createErrorResponse('Unauthorized', 401);
    }

    await mealPlanService.deleteMealPlan(userId, params.id);
    return createSuccessResponse({ message: 'Meal plan deleted successfully' });
  } catch (error: any) {
    return createErrorResponse(error.message || 'Failed to delete meal plan', 400);
  }
}
