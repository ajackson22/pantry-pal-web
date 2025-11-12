import { NextRequest } from 'next/server';
import { recipeService, RecipeGenerationParams } from '@/lib/services/recipe.service';
import { pantryService } from '@/lib/services/pantry.service';
import { aiService } from '@/lib/services/ai.service';
import { createErrorResponse, createSuccessResponse, getUserIdFromRequest } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return createErrorResponse('Unauthorized', 401);
    }

    const body: RecipeGenerationParams = await request.json();

    if (!body.numOfRecipesToGenerate || body.numOfRecipesToGenerate < 1) {
      return createErrorResponse('Number of recipes must be at least 1', 400);
    }

    if (body.numOfRecipesToGenerate > 10) {
      return createErrorResponse('Cannot generate more than 10 recipes at once', 400);
    }

    let pantryItems;
    if (body.usePantryIngredients) {
      pantryItems = await pantryService.getItems(userId);
    }

    const generatedRecipes = await aiService.generateRecipes(body, pantryItems);

    const recipesToSave = await Promise.all(
      generatedRecipes.map(async (recipe) => {
        let imageUrl = null;

        try {
          imageUrl = await aiService.generateRecipeImage(recipe.title);
        } catch (error) {
          console.error('Failed to generate image for recipe:', recipe.title, error);
        }

        return {
          title: recipe.title,
          description: recipe.description,
          cooking_time: recipe.cooking_time,
          servings: recipe.servings,
          difficulty: recipe.difficulty,
          ingredients: recipe.ingredients,
          instructions: recipe.instructions,
          dietary_restrictions: recipe.dietary_restrictions || [],
          genre: recipe.genre,
          child_friendly: recipe.child_friendly || false,
          suited_for_meal_types: recipe.suited_for_meal_types || [],
          image_url: imageUrl || undefined,
        };
      })
    );

    const savedRecipes = await recipeService.bulkCreateRecipes(userId, recipesToSave);

    for (const recipe of savedRecipes) {
      if (recipe.image_url && recipe.image_url.startsWith('http')) {
        try {
          const imageResponse = await fetch(recipe.image_url);
          const arrayBuffer = await imageResponse.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const base64Image = buffer.toString('base64');

          await supabase.from('recipe_images').insert({
            recipe_id: recipe.id,
            image_b64: base64Image,
            image_generation_created: Date.now(),
          });
        } catch (error) {
          console.error('Failed to save image for recipe:', recipe.id, error);
        }
      }
    }

    return createSuccessResponse({ data: savedRecipes }, 201);
  } catch (error: any) {
    console.error('Recipe generation error:', error);

    if (error.message.includes('AI service not configured')) {
      return createErrorResponse('AI service not configured', 503);
    }

    if (error.message.includes('API error')) {
      return createErrorResponse('AI service error: ' + error.message, 503);
    }

    return createErrorResponse(error.message || 'Failed to generate recipes', 400);
  }
}
