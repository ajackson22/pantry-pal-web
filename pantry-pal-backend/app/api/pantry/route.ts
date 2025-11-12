import { NextRequest } from 'next/server';
import { pantryService, PantryFilters } from '@/lib/services/pantry.service';
import { createErrorResponse, createSuccessResponse, getUserIdFromRequest } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return createErrorResponse('Unauthorized', 401);
    }

    const { searchParams } = new URL(request.url);

    const filters: PantryFilters = {
      location: searchParams.get('location') as any || undefined,
      category: searchParams.get('category') || undefined,
      search: searchParams.get('search') || undefined,
      expiring: searchParams.get('expiring') ? parseInt(searchParams.get('expiring')!) : undefined,
    };

    const items = await pantryService.getItems(userId, filters);
    return createSuccessResponse({ data: items });
  } catch (error: any) {
    return createErrorResponse(error.message || 'Failed to fetch pantry items', 400);
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return createErrorResponse('Unauthorized', 401);
    }

    const body = await request.json();
    const item = await pantryService.createItem(userId, body);
    return createSuccessResponse({ data: item }, 201);
  } catch (error: any) {
    return createErrorResponse(error.message || 'Failed to create pantry item', 400);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return createErrorResponse('Unauthorized', 401);
    }

    const body = await request.json();

    if (!body.items || !Array.isArray(body.items)) {
      return createErrorResponse('Invalid request: items array required', 400);
    }

    const updatedItems = await pantryService.bulkUpdate(userId, body.items);
    return createSuccessResponse({ data: updatedItems });
  } catch (error: any) {
    return createErrorResponse(error.message || 'Failed to update pantry items', 400);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return createErrorResponse('Unauthorized', 401);
    }

    const body = await request.json();

    if (!body.ids || !Array.isArray(body.ids)) {
      return createErrorResponse('Invalid request: ids array required', 400);
    }

    await pantryService.bulkDelete(userId, body.ids);
    return createSuccessResponse({ success: true });
  } catch (error: any) {
    return createErrorResponse(error.message || 'Failed to delete pantry items', 400);
  }
}
