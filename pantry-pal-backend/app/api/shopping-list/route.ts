import { NextRequest } from 'next/server';
import { shoppingService } from '@/lib/services/shopping.service';
import { createErrorResponse, createSuccessResponse, getUserIdFromRequest } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return createErrorResponse('Unauthorized', 401);
    }

    const { searchParams } = new URL(request.url);
    const completedParam = searchParams.get('completed');

    let completed: boolean | undefined;
    if (completedParam === 'true') completed = true;
    else if (completedParam === 'false') completed = false;

    const items = await shoppingService.getItems(userId, completed);
    return createSuccessResponse({ data: items });
  } catch (error: any) {
    return createErrorResponse(error.message || 'Failed to fetch shopping list', 400);
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return createErrorResponse('Unauthorized', 401);
    }

    const body = await request.json();

    if (!body.name) {
      return createErrorResponse('Item name is required', 400);
    }

    const item = await shoppingService.createItem(userId, body);
    return createSuccessResponse({ data: item }, 201);
  } catch (error: any) {
    return createErrorResponse(error.message || 'Failed to create shopping list item', 400);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return createErrorResponse('Unauthorized', 401);
    }

    await shoppingService.clearCompleted(userId);
    return createSuccessResponse({ success: true });
  } catch (error: any) {
    return createErrorResponse(error.message || 'Failed to clear completed items', 400);
  }
}
