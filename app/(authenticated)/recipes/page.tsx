'use client';

import { useState, useEffect, useCallback } from 'react';
import { RecipesHeader } from '@/components/recipes/header';
import { RecipeFilters } from '@/components/recipes/filters';
import { InfiniteScrollList, Recipe } from '@/components/recipes/infinite-scroll-list';
import { GenerateRecipeDialog } from '@/components/recipes/generate-recipe-dialog';
import { RandomRecipeDialog } from '@/components/recipes/random-recipe-dialog';
import { AddToMealPlanDialog } from '@/components/recipes/add-to-meal-plan-dialog';
import { useApiClient } from '@/lib/hooks/use-api-client';
import { toast } from 'sonner';

const RECIPES_PER_PAGE = 10;

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [genres, setGenres] = useState<string[]>([]);
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);
  const [maxCookingTime, setMaxCookingTime] = useState(120);
  const [difficulty, setDifficulty] = useState('all');
  const [servings, setServings] = useState(4);

  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [showRandomDialog, setShowRandomDialog] = useState(false);
  const [randomRecipe, setRandomRecipe] = useState<Recipe | null>(null);
  const [randomLoading, setRandomLoading] = useState(false);
  const [showAddToMealPlan, setShowAddToMealPlan] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const apiClient = useApiClient();

  const fetchRecipes = useCallback(async (pageNum: number, reset = false) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: RECIPES_PER_PAGE.toString(),
        ...(searchQuery && { search: searchQuery }),
        ...(genres.length > 0 && { genres: genres.join(',') }),
        ...(dietaryRestrictions.length > 0 && { dietary: dietaryRestrictions.join(',') }),
        ...(maxCookingTime !== 120 && { maxTime: maxCookingTime.toString() }),
        ...(difficulty !== 'all' && { difficulty }),
        ...(servings !== 4 && { servings: servings.toString() }),
      });

      const data = await apiClient.get<Recipe[]>(`/recipes?${params}`);

      if (reset) {
        setRecipes(data);
      } else {
        setRecipes((prev) => [...prev, ...data]);
      }

      setHasMore(data.length === RECIPES_PER_PAGE);
    } catch (error: any) {
      toast.error('Failed to load recipes');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, genres, dietaryRestrictions, maxCookingTime, difficulty, servings, apiClient]);

  useEffect(() => {
    setPage(1);
    fetchRecipes(1, true);
  }, [searchQuery, genres, dietaryRestrictions, maxCookingTime, difficulty, servings]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchRecipes(nextPage, false);
  };

  const handleToggleSave = async (recipeId: string, currentlySaved: boolean) => {
    setRecipes((prev) =>
      prev.map((recipe) =>
        recipe.id === recipeId ? { ...recipe, isSaved: !currentlySaved } : recipe
      )
    );

    try {
      if (currentlySaved) {
        await apiClient.delete(`/recipes/${recipeId}/save`);
        toast.success('Recipe unsaved');
      } else {
        await apiClient.post(`/recipes/${recipeId}/save`, {});
        toast.success('Recipe saved');
      }
    } catch (error: any) {
      setRecipes((prev) =>
        prev.map((recipe) =>
          recipe.id === recipeId ? { ...recipe, isSaved: currentlySaved } : recipe
        )
      );
      toast.error('Failed to update recipe');
    }
  };

  const handleAddToMealPlan = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setShowAddToMealPlan(true);
  };

  const handleRandomRecipe = async () => {
    setShowRandomDialog(true);
    setRandomLoading(true);
    setRandomRecipe(null);

    try {
      const recipe = await apiClient.get<Recipe>('/recipes/random');
      setRandomRecipe(recipe);
    } catch (error: any) {
      toast.error('Failed to fetch random recipe');
      setShowRandomDialog(false);
    } finally {
      setRandomLoading(false);
    }
  };

  const handleClearFilters = () => {
    setGenres([]);
    setDietaryRestrictions([]);
    setMaxCookingTime(120);
    setDifficulty('all');
    setServings(4);
  };

  return (
    <div>
      <RecipesHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onGenerateRecipes={() => setShowGenerateDialog(true)}
        onRandomRecipe={handleRandomRecipe}
      />

      <div className="grid gap-6 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <RecipeFilters
            genres={genres}
            dietaryRestrictions={dietaryRestrictions}
            maxCookingTime={maxCookingTime}
            difficulty={difficulty}
            servings={servings}
            onGenresChange={setGenres}
            onDietaryChange={setDietaryRestrictions}
            onMaxCookingTimeChange={setMaxCookingTime}
            onDifficultyChange={setDifficulty}
            onServingsChange={setServings}
            onClearFilters={handleClearFilters}
          />
        </div>

        <div className="lg:col-span-3">
          <InfiniteScrollList
            recipes={recipes}
            hasMore={hasMore}
            loading={loading}
            onLoadMore={handleLoadMore}
            onToggleSave={handleToggleSave}
            onAddToMealPlan={handleAddToMealPlan}
          />
        </div>
      </div>

      <GenerateRecipeDialog
        open={showGenerateDialog}
        onOpenChange={setShowGenerateDialog}
        onRecipesGenerated={() => {
          setPage(1);
          fetchRecipes(1, true);
        }}
      />

      <RandomRecipeDialog
        open={showRandomDialog}
        onOpenChange={setShowRandomDialog}
        recipe={randomRecipe}
        loading={randomLoading}
        onGenerateAnother={handleRandomRecipe}
        onAddToMealPlan={handleAddToMealPlan}
      />

      <AddToMealPlanDialog
        open={showAddToMealPlan}
        onOpenChange={setShowAddToMealPlan}
        recipe={selectedRecipe}
        onAdded={() => {}}
      />
    </div>
  );
}
