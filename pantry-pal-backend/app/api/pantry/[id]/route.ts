import { NextRequest } from 'next/server';
import { pantryService } from '@/lib/services/pantry.service';
import { createErrorResponse, createSuccessResponse, getUserIdFromRequest } from '@/lib/utils';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return createErrorResponse('Unauthorized', 401);
    }

    const item = await pantryService.getItem(userId, params.id);
    if (!item) {
      return createErrorResponse('Item not found', 404);
    }

    return createSuccessResponse({ data: item });
  } catch (error: any) {
    return createErrorResponse(error.message || 'Failed to fetch pantry item', 400);
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

    const item = await pantryService.updateItem(userId, params.id, updates);
    return createSuccessResponse({ data: item });
  } catch (error: any) {
    if (error.message.includes('No rows')) {
      return createErrorResponse('Item not found or not owned by user', 404);
    }
    return createErrorResponse(error.message || 'Failed to update pantry item', 400);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return createErrorResponse('Unauthorized', 401);
    }

    await pantryService.deleteItem(userId, params.id);
    return createSuccessResponse({ success: true });
  } catch (error: any) {
    return createErrorResponse(error.message || 'Failed to delete pantry item', 400);
  }
}
