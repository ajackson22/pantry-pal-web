import { NextRequest } from 'next/server';
import { mealPlanService, ScheduledMeal } from '@/lib/services/mealplan.service';
import { createErrorResponse, createSuccessResponse, getUserIdFromRequest } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return createErrorResponse('Unauthorized', 401);
    }

    const { searchParams } = new URL(request.url);
    const start = searchParams.get('start') || undefined;
    const end = searchParams.get('end') || undefined;

    const mealPlans = await mealPlanService.getMealPlans(userId, start, end);
    return createSuccessResponse({ data: mealPlans });
  } catch (error: any) {
    return createErrorResponse(error.message || 'Failed to fetch meal plans', 400);
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return createErrorResponse('Unauthorized', 401);
    }

    const body = await request.json();

    if (!body.scheduled_meals || !Array.isArray(body.scheduled_meals)) {
      return createErrorResponse('scheduled_meals array is required', 400);
    }

    const scheduledMeals: ScheduledMeal[] = body.scheduled_meals;
    const syncWithCalendar: boolean = body.syncWithCalendar || false;

    for (const meal of scheduledMeals) {
      if (!meal.recipe_id || !meal.date || !meal.meal_type) {
        return createErrorResponse('Each meal must have recipe_id, date, and meal_type', 400);
      }

      if (!['Breakfast', 'Lunch', 'Dinner', 'Snack'].includes(meal.meal_type)) {
        return createErrorResponse('meal_type must be Breakfast, Lunch, Dinner, or Snack', 400);
      }
    }

    const mealPlans = await mealPlanService.createMealPlans(userId, scheduledMeals, syncWithCalendar);
    return createSuccessResponse({ data: mealPlans }, 201);
  } catch (error: any) {
    console.error('Meal plan creation error:', error);
    return createErrorResponse(error.message || 'Failed to create meal plans', 400);
  }
}
