'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChefHat, Plus, Shuffle, Search } from 'lucide-react';

interface RecipesHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onGenerateRecipes: () => void;
  onRandomRecipe: () => void;
}

export function RecipesHeader({
  searchQuery,
  onSearchChange,
  onGenerateRecipes,
  onRandomRecipe,
}: RecipesHeaderProps) {
  return (
    <div className="mb-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold text-gray-900">
            <ChefHat className="h-8 w-8 text-primary" />
            Recipes
          </h1>
          <p className="mt-1 text-gray-600">Discover delicious recipes tailored to your pantry</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onRandomRecipe}>
            <Shuffle className="mr-2 h-4 w-4" />
            Random Recipe
          </Button>
          <Button onClick={onGenerateRecipes}>
            <Plus className="mr-2 h-4 w-4" />
            Generate Recipes
          </Button>
        </div>
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search recipes..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
    </div>
  );
}
