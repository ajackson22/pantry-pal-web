import { NextRequest } from 'next/server';
import { shoppingService } from '@/lib/services/shopping.service';
import { createErrorResponse, createSuccessResponse, getUserIdFromRequest } from '@/lib/utils';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return createErrorResponse('Unauthorized', 401);
    }

    const item = await shoppingService.getItem(userId, params.id);
    if (!item) {
      return createErrorResponse('Item not found', 404);
    }

    return createSuccessResponse({ data: item });
  } catch (error: any) {
    return createErrorResponse(error.message || 'Failed to fetch shopping list item', 400);
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return createErrorResponse('Unauthorized', 401);
    }

    const body = await request.json();
    const updates = body.updates || body;

    const item = await shoppingService.updateItem(userId, params.id, updates);
    return createSuccessResponse({ data: item });
  } catch (error: any) {
    if (error.message.includes('No rows')) {
      return createErrorResponse('Item not found or not owned by user', 404);
    }
    return createErrorResponse(error.message || 'Failed to update shopping list item', 400);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return createErrorResponse('Unauthorized', 401);
    }

    await shoppingService.deleteItem(userId, params.id);
    return createSuccessResponse({ success: true });
  } catch (error: any) {
    return createErrorResponse(error.message || 'Failed to delete shopping list item', 400);
  }
}
