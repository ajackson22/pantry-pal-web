import { NextRequest } from 'next/server';
import { createErrorResponse, createSuccessResponse, getUserIdFromRequest } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return createErrorResponse('Unauthorized', 401);
    }

    const formData = await request.formData();
    const image = formData.get('image') as File;

    if (!image) {
      return createErrorResponse('Image file is required', 400);
    }

    if (!image.type.startsWith('image/')) {
      return createErrorResponse('File must be an image', 400);
    }

    const maxSize = 10 * 1024 * 1024;
    if (image.size > maxSize) {
      return createErrorResponse('Image size must be less than 10MB', 400);
    }

    const arrayBuffer = await image.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString('base64');
    const dataUrl = `data:${image.type};base64,${base64Image}`;

    return createSuccessResponse({
      data: {
        url: dataUrl,
        filename: image.name,
        size: image.size,
        type: image.type,
      },
    });
  } catch (error: any) {
    return createErrorResponse(error.message || 'Failed to upload image', 400);
  }
}
