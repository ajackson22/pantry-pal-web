import { RecipeGenerationParams } from './recipe.service';
import { PantryItem, Recipe } from '../types/database';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;

interface GeneratedRecipe {
  title: string;
  description: string;
  cooking_time: number;
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  ingredients: Array<{
    name: string;
    quantity: number;
    unit: string;
  }>;
  instructions: string[];
  dietary_restrictions?: string[];
  genre?: string;
  child_friendly?: boolean;
  suited_for_meal_types?: string[];
}

export class AIService {
  async generateRecipes(
    params: RecipeGenerationParams,
    pantryItems?: PantryItem[]
  ): Promise<GeneratedRecipe[]> {
    if (!OPENAI_API_KEY && !PERPLEXITY_API_KEY) {
      throw new Error('AI service not configured - missing API keys');
    }

    const prompt = this.buildRecipeGenerationPrompt(params, pantryItems);

    if (OPENAI_API_KEY) {
      return this.generateWithOpenAI(prompt, params.numOfRecipesToGenerate);
    } else if (PERPLEXITY_API_KEY) {
      return this.generateWithPerplexity(prompt, params.numOfRecipesToGenerate);
    }

    throw new Error('No AI service available');
  }

  private buildRecipeGenerationPrompt(
    params: RecipeGenerationParams,
    pantryItems?: PantryItem[]
  ): string {
    let prompt = `Generate ${params.numOfRecipesToGenerate} detailed recipe${params.numOfRecipesToGenerate > 1 ? 's' : ''}`;

    if (params.isRandom) {
      prompt += ' with random cuisines and styles';
    }

    if (params.selectedGenres && params.selectedGenres.length > 0) {
      prompt += ` from these genres: ${params.selectedGenres.join(', ')}`;
    }

    if (params.selectedDietary && params.selectedDietary.length > 0) {
      prompt += `. Must be ${params.selectedDietary.join(', ')} friendly`;
    }

    if (params.maxCookingTime) {
      prompt += `. Maximum cooking time: ${params.maxCookingTime} minutes`;
    }

    if (params.difficulty) {
      prompt += `. Difficulty level: ${params.difficulty}`;
    }

    if (params.servings) {
      prompt += `. Servings: ${params.servings}`;
    }

    if (params.childFriendly) {
      prompt += `. Recipes should be child-friendly`;
    }

    if (params.usePantryIngredients && pantryItems && pantryItems.length > 0) {
      const pantryList = pantryItems.map(item => `${item.name} (${item.quantity} ${item.unit})`).join(', ');
      prompt += `. Try to use ingredients from this pantry: ${pantryList}`;
    }

    if (params.userPrompt) {
      prompt += `. Additional requirements: ${params.userPrompt}`;
    }

    prompt += `\n\nFor each recipe, provide:
1. title: Recipe name
2. description: Brief description (1-2 sentences)
3. cooking_time: Total time in minutes (number)
4. servings: Number of servings (number)
5. difficulty: One of "easy", "medium", or "hard"
6. ingredients: Array of objects with name, quantity (number), and unit
7. instructions: Array of step-by-step instructions (strings)
8. dietary_restrictions: Array of dietary tags (e.g., ["vegetarian", "gluten-free", "dairy-free", "vegan", "keto", "paleo"])
9. genre: Cuisine type (e.g., "Italian", "Mexican", "Asian", "American")
10. child_friendly: Boolean
11. suited_for_meal_types: Array of meal types (e.g., ["Breakfast", "Lunch", "Dinner", "Snack"])

Return ONLY a valid JSON array of recipe objects. No markdown formatting or additional text.`;

    return prompt;
  }

  private async generateWithOpenAI(prompt: string, count: number): Promise<GeneratedRecipe[]> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are a professional chef and recipe expert. Generate detailed, accurate recipes in JSON format.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.8,
        max_tokens: 4000,
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

    const recipes = JSON.parse(jsonMatch[0]);

    if (!Array.isArray(recipes)) {
      throw new Error('AI did not return an array of recipes');
    }

    return recipes.slice(0, count);
  }

  private async generateWithPerplexity(prompt: string, count: number): Promise<GeneratedRecipe[]> {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-large-128k-online',
        messages: [
          {
            role: 'system',
            content: 'You are a professional chef and recipe expert. Generate detailed, accurate recipes in JSON format.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.8,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Perplexity API error: ${error.error?.message || 'Unknown error'}`);
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

    const recipes = JSON.parse(jsonMatch[0]);

    if (!Array.isArray(recipes)) {
      throw new Error('AI did not return an array of recipes');
    }

    return recipes.slice(0, count);
  }

  async generateRecipeImage(recipeTitle: string): Promise<string | null> {
    if (!OPENAI_API_KEY) {
      return null;
    }

    try {
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: `A beautiful, professional food photography shot of ${recipeTitle}. High quality, appetizing, well-lit, restaurant-style presentation.`,
          n: 1,
          size: '1024x1024',
          quality: 'standard',
        }),
      });

      if (!response.ok) {
        console.error('Image generation failed:', await response.text());
        return null;
      }

      const data = await response.json();
      return data.data[0]?.url || null;
    } catch (error) {
      console.error('Image generation error:', error);
      return null;
    }
  }
}

export const aiService = new AIService();
