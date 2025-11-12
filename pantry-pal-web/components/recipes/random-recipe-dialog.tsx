'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Recipe } from './infinite-scroll-list';
import { Clock, Users, ChefHat, Calendar, Shuffle } from 'lucide-react';

interface RandomRecipeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipe: Recipe | null;
  loading: boolean;
  onGenerateAnother: () => void;
  onAddToMealPlan: (recipe: Recipe) => void;
}

export function RandomRecipeDialog({
  open,
  onOpenChange,
  recipe,
  loading,
  onGenerateAnother,
  onAddToMealPlan,
}: RandomRecipeDialogProps) {
  const getDifficultyColor = (difficulty: string) => {
    const colors: Record<string, string> = {
      easy: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      hard: 'bg-red-100 text-red-800',
    };
    return colors[difficulty?.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Random Recipe</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm text-gray-600">Finding a delicious recipe...</p>
          </div>
        ) : recipe ? (
          <div className="space-y-4">
            {recipe.imageUrl ? (
              <img
                src={recipe.imageUrl}
                alt={recipe.name}
                className="h-64 w-full rounded-lg object-cover"
              />
            ) : (
              <div className="flex h-64 items-center justify-center rounded-lg bg-gradient-to-br from-primary/10 to-primary/5">
                <ChefHat className="h-24 w-24 text-primary/30" />
              </div>
            )}

            <div>
              <h3 className="mb-2 text-2xl font-bold text-gray-900">{recipe.name}</h3>
              <p className="text-gray-600">{recipe.description}</p>
            </div>

            <div className="flex flex-wrap gap-2">
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

            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={onGenerateAnother} className="flex-1">
                <Shuffle className="mr-2 h-4 w-4" />
                Try Another
              </Button>
              <Button onClick={() => onAddToMealPlan(recipe)} className="flex-1">
                <Calendar className="mr-2 h-4 w-4" />
                Add to Meal Plan
              </Button>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
