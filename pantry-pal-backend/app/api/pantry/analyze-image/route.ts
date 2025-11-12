import { NextRequest } from 'next/server';
import { pantryService } from '@/lib/services/pantry.service';
import { createErrorResponse, createSuccessResponse, getUserIdFromRequest } from '@/lib/utils';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

interface ExtractedItem {
  name: string;
  quantity: number;
  unit: string;
  category?: string;
}

async function analyzeImageWithAI(base64Image: string): Promise<ExtractedItem[]> {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4-vision-preview',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analyze this image and extract all food items visible. For each item, provide:
1. name: The name of the food item
2. quantity: Estimated quantity (number only)
3. unit: Unit of measurement (e.g., "pcs", "kg", "lbs", "oz", "g", "ml", "l", "cups", "tsp", "tbsp")
4. category: Food category (e.g., "Dairy", "Vegetables", "Fruits", "Meat", "Grains", "Snacks", "Beverages", "Condiments")

Return ONLY a valid JSON array of objects with these exact fields. No additional text or markdown formatting.
Example: [{"name":"Milk","quantity":1,"unit":"l","category":"Dairy"},{"name":"Apples","quantity":6,"unit":"pcs","category":"Fruits"}]`,
            },
            {
              type: 'image_url',
              image_url: {
                url: base64Image,
              },
            },
          ],
        },
      ],
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;

  if (!content) {
    throw new Error('No content returned from AI');
  }

  const jsonMatch = content.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    console.error('AI Response:', content);
    throw new Error('Could not extract JSON from AI response');
  }

  const items = JSON.parse(jsonMatch[0]);

  if (!Array.isArray(items)) {
    throw new Error('AI did not return an array');
  }

  return items;
}

export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return createErrorResponse('Unauthorized', 401);
    }

    const formData = await request.formData();
    const image = formData.get('image') as File;
    const location = (formData.get('location') as string) || 'pantry';

    if (!image) {
      return createErrorResponse('Image file is required', 400);
    }

    if (!image.type.startsWith('image/')) {
      return createErrorResponse('File must be an image', 400);
    }

    if (!['fridge', 'freezer', 'pantry'].includes(location)) {
      return createErrorResponse('Invalid location. Must be fridge, freezer, or pantry', 400);
    }

    const maxSize = 20 * 1024 * 1024;
    if (image.size > maxSize) {
      return createErrorResponse('Image size must be less than 20MB', 400);
    }

    const arrayBuffer = await image.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString('base64');
    const dataUrl = `data:${image.type};base64,${base64Image}`;

    const extractedItems = await analyzeImageWithAI(dataUrl);

    const pantryItems = extractedItems.map(item => ({
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      category: item.category,
      location: location as 'fridge' | 'freezer' | 'pantry',
    }));

    const addedItems = await pantryService.bulkCreate(userId, pantryItems);

    return createSuccessResponse({
      data: addedItems,
      meta: {
        itemsExtracted: extractedItems.length,
        itemsAdded: addedItems.length,
      },
    }, 201);
  } catch (error: any) {
    console.error('Image analysis error:', error);

    if (error.message.includes('OpenAI API key')) {
      return createErrorResponse('AI service not configured', 503);
    }

    return createErrorResponse(error.message || 'Failed to analyze image', 400);
  }
}
