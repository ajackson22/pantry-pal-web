'use client';

import { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, ChefHat, Heart, Calendar, BookmarkPlus, Bookmark } from 'lucide-react';
import { toast } from 'sonner';

export interface Recipe {
  id: string;
  name: string;
  description: string;
  cuisine: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: string;
  imageUrl?: string;
  isSaved?: boolean;
}

interface InfiniteScrollListProps {
  recipes: Recipe[];
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
  onToggleSave: (recipeId: string, currentlySaved: boolean) => void;
  onAddToMealPlan: (recipe: Recipe) => void;
}

export function InfiniteScrollList({
  recipes,
  hasMore,
  loading,
  onLoadMore,
  onToggleSave,
  onAddToMealPlan,
}: InfiniteScrollListProps) {
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loading, onLoadMore]);

  const getDifficultyColor = (difficulty: string) => {
    const colors: Record<string, string> = {
      easy: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      hard: 'bg-red-100 text-red-800',
    };
    return colors[difficulty.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  if (recipes.length === 0 && !loading) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <ChefHat className="mb-3 h-12 w-12 text-gray-300" />
          <p className="text-lg font-medium text-gray-900">No recipes found</p>
          <p className="text-sm text-gray-600">Try adjusting your filters or generate new recipes</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {recipes.map((recipe) => (
        <Card key={recipe.id} className="overflow-hidden transition-shadow hover:shadow-lg">
          <div className="flex flex-col md:flex-row">
            {recipe.imageUrl ? (
              <div className="h-48 w-full bg-gray-200 md:h-auto md:w-64">
                <img
                  src={recipe.imageUrl}
                  alt={recipe.name}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="flex h-48 w-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 md:h-auto md:w-64">
                <ChefHat className="h-16 w-16 text-primary/30" />
              </div>
            )}
            <CardContent className="flex-1 p-6">
              <div className="mb-3 flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="mb-1 text-xl font-bold text-gray-900">{recipe.name}</h3>
                  <p className="text-sm text-gray-600">{recipe.description}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onToggleSave(recipe.id, recipe.isSaved || false)}
                >
                  {recipe.isSaved ? (
                    <Bookmark className="h-5 w-5 fill-primary text-primary" />
                  ) : (
                    <BookmarkPlus className="h-5 w-5" />
                  )}
                </Button>
              </div>

              <div className="mb-4 flex flex-wrap gap-2">
                <Badge variant="secondary">{recipe.cuisine}</Badge>
                <Badge className={getDifficultyColor(recipe.difficulty)}>
                  {recipe.difficulty}
                </Badge>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="mr-1 h-4 w-4" />
                  {recipe.prepTime + recipe.cookTime}m
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="mr-1 h-4 w-4" />
                  {recipe.servings} servings
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  View Recipe
                </Button>
                <Button
                  size="sm"
                  onClick={() => onAddToMealPlan(recipe)}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Add to Meal Plan
                </Button>
              </div>
            </CardContent>
          </div>
        </Card>
      ))}

      {loading && (
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      )}

      <div ref={observerTarget} className="h-4" />
    </div>
  );
}
