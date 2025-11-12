import { NextRequest } from 'next/server';
import { pantryService } from '@/lib/services/pantry.service';
import { recipeService } from '@/lib/services/recipe.service';
import { mealPlanService } from '@/lib/services/mealplan.service';
import { aiService } from '@/lib/services/ai.service';
import { createErrorResponse, createSuccessResponse, getUserIdFromRequest } from '@/lib/utils';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const SYSTEM_PROMPT = `You are PantryPal Assistant, a helpful kitchen management AI assistant. You help users manage their pantry, discover recipes, plan meals, and organize their shopping.

You have access to the following functions:
- addPantryItem: Add items to the user's pantry
- getPantryItems: View all items in the pantry
- getMealPlan: Get meal plans for a date range
- findRecipes: Search for recipes with specific criteria
- generateRecipes: Generate new AI-powered recipes
- saveMealPlan: Create and save meal plans with optional calendar sync

Be friendly, helpful, and concise. When users ask for help, guide them through their options. When they request actions, use the appropriate functions.

Example interactions:
- "What's in my pantry?" → Use getPantryItems
- "Add milk to my pantry" → Use addPantryItem
- "Find vegetarian recipes" → Use findRecipes
- "Plan meals for next week" → Use getMealPlan or saveMealPlan
- "Generate some dinner ideas" → Use generateRecipes

Always confirm actions after they're completed.`;

const FUNCTION_DEFINITIONS = [
  {
    name: 'addPantryItem',
    description: 'Add an item to the user\'s pantry',
    parameters: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Name of the item' },
        quantity: { type: 'number', description: 'Quantity of the item' },
        unit: { type: 'string', description: 'Unit of measurement (e.g., kg, lbs, pcs)' },
        category: { type: 'string', description: 'Category (e.g., Dairy, Vegetables, Meat)' },
        location: { type: 'string', enum: ['fridge', 'freezer', 'pantry'], description: 'Storage location' },
        expiry_date: { type: 'string', description: 'Expiry date in ISO format (optional)' },
      },
      required: ['name', 'quantity', 'unit', 'location'],
    },
  },
  {
    name: 'getPantryItems',
    description: 'Get all items in the user\'s pantry',
    parameters: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'getMealPlan',
    description: 'Get meal plan for a date range',
    parameters: {
      type: 'object',
      properties: {
        startDate: { type: 'string', description: 'Start date in ISO format (YYYY-MM-DD)' },
        endDate: { type: 'string', description: 'End date in ISO format (YYYY-MM-DD)' },
      },
      required: ['startDate', 'endDate'],
    },
  },
  {
    name: 'findRecipes',
    description: 'Search for recipes with specific criteria',
    parameters: {
      type: 'object',
      properties: {
        genres: { type: 'array', items: { type: 'string' }, description: 'Recipe genres/cuisines' },
        dietaryRestrictions: { type: 'array', items: { type: 'string' }, description: 'Dietary restrictions' },
        maxCookingTime: { type: 'number', description: 'Maximum cooking time in minutes' },
        difficulty: { type: 'string', enum: ['easy', 'medium', 'hard'], description: 'Difficulty level' },
        servings: { type: 'number', description: 'Number of servings' },
        limit: { type: 'number', description: 'Maximum number of results (default 10)' },
      },
    },
  },
  {
    name: 'generateRecipes',
    description: 'Generate new AI-powered recipes',
    parameters: {
      type: 'object',
      properties: {
        numOfRecipesToGenerate: { type: 'number', description: 'Number of recipes to generate (1-10)' },
        preferences: {
          type: 'object',
          description: 'Recipe generation preferences',
          properties: {
            genres: { type: 'array', items: { type: 'string' } },
            dietary: { type: 'array', items: { type: 'string' } },
            maxCookingTime: { type: 'number' },
            difficulty: { type: 'string' },
            childFriendly: { type: 'boolean' },
            servings: { type: 'number' },
            usePantryIngredients: { type: 'boolean' },
          },
        },
      },
      required: ['numOfRecipesToGenerate'],
    },
  },
  {
    name: 'saveMealPlan',
    description: 'Create and save meal plans',
    parameters: {
      type: 'object',
      properties: {
        scheduled_meals: {
          type: 'array',
          description: 'Array of meals to schedule',
          items: {
            type: 'object',
            properties: {
              recipe_id: { type: 'string' },
              date: { type: 'string', description: 'Date in ISO format' },
              meal_type: { type: 'string', enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack'] },
            },
            required: ['recipe_id', 'date', 'meal_type'],
          },
        },
        syncWithCalendar: { type: 'boolean', description: 'Sync with Google Calendar' },
      },
      required: ['scheduled_meals'],
    },
  },
];

async function executeFunctionCall(
  userId: string,
  functionName: string,
  args: any
): Promise<any> {
  switch (functionName) {
    case 'addPantryItem':
      const item = await pantryService.createItem(userId, args);
      return { success: true, item };

    case 'getPantryItems':
      const items = await pantryService.getItems(userId);
      return { items, count: items.length };

    case 'getMealPlan':
      const mealPlans = await mealPlanService.getMealPlans(
        userId,
        args.startDate,
        args.endDate
      );
      return { mealPlans, count: mealPlans.length };

    case 'findRecipes':
      const recipes = await recipeService.searchRecipes({
        genres: args.genres,
        dietary: args.dietaryRestrictions,
        maxCookingTime: args.maxCookingTime,
        difficulty: args.difficulty,
        servings: args.servings,
        limit: args.limit || 10,
      });
      return { recipes, count: recipes.length };

    case 'generateRecipes':
      const pantryItems = args.preferences?.usePantryIngredients
        ? await pantryService.getItems(userId)
        : undefined;

      const generatedRecipes = await aiService.generateRecipes(
        {
          numOfRecipesToGenerate: args.numOfRecipesToGenerate,
          isRandom: false,
          selectedGenres: args.preferences?.genres,
          selectedDietary: args.preferences?.dietary,
          maxCookingTime: args.preferences?.maxCookingTime,
          difficulty: args.preferences?.difficulty,
          childFriendly: args.preferences?.childFriendly,
          servings: args.preferences?.servings,
          usePantryIngredients: args.preferences?.usePantryIngredients,
        },
        pantryItems
      );

      const savedRecipes = await recipeService.bulkCreateRecipes(
        userId,
        generatedRecipes
      );
      return { recipes: savedRecipes, count: savedRecipes.length };

    case 'saveMealPlan':
      const createdMealPlans = await mealPlanService.createMealPlans(
        userId,
        args.scheduled_meals,
        args.syncWithCalendar || false
      );
      return { mealPlans: createdMealPlans, count: createdMealPlans.length };

    default:
      throw new Error(`Unknown function: ${functionName}`);
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return createErrorResponse('Unauthorized', 401);
    }

    if (!OPENAI_API_KEY) {
      return createErrorResponse('Chat service not configured', 503);
    }

    const body = await request.json();

    if (!body.message) {
      return createErrorResponse('Message is required', 400);
    }

    const conversationHistory = body.conversationHistory || [];

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...conversationHistory,
      { role: 'user', content: body.message },
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages,
        functions: FUNCTION_DEFINITIONS,
        function_call: 'auto',
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const assistantMessage = data.choices[0]?.message;

    if (!assistantMessage) {
      throw new Error('No response from AI');
    }

    let finalResponse = assistantMessage.content;
    let functionResults = null;

    if (assistantMessage.function_call) {
      const functionName = assistantMessage.function_call.name;
      const functionArgs = JSON.parse(assistantMessage.function_call.arguments);

      try {
        functionResults = await executeFunctionCall(userId, functionName, functionArgs);

        const followUpMessages = [
          ...messages,
          assistantMessage,
          {
            role: 'function',
            name: functionName,
            content: JSON.stringify(functionResults),
          },
        ];

        const followUpResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'gpt-4-turbo-preview',
            messages: followUpMessages,
            temperature: 0.7,
          }),
        });

        if (followUpResponse.ok) {
          const followUpData = await followUpResponse.json();
          finalResponse = followUpData.choices[0]?.message?.content || finalResponse;
        }
      } catch (error: any) {
        console.error('Function execution error:', error);
        finalResponse = `I tried to ${functionName}, but encountered an error: ${error.message}. Please try again or rephrase your request.`;
      }
    }

    return createSuccessResponse({
      response: finalResponse,
      functionCalled: assistantMessage.function_call?.name,
      functionResults,
      usage: data.usage,
    });
  } catch (error: any) {
    console.error('Chat error:', error);

    if (error.message.includes('OpenAI API')) {
      return createErrorResponse('AI service error: ' + error.message, 503);
    }

    return createErrorResponse(error.message || 'Chat request failed', 400);
  }
}
