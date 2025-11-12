'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useApiClient } from '@/lib/hooks/use-api-client';
import { ChefHat, ChevronRight, Clock, Users } from 'lucide-react';
import { toast } from 'sonner';

interface Recipe {
  id: string;
  name: string;
  cuisine: string;
  prepTime: number;
  servings: number;
  matchPercentage: number;
}

export function RecipeSuggestions() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const apiClient = useApiClient();

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const data = await apiClient.get<Recipe[]>('/recipes/suggestions');
        setRecipes(data);
      } catch (error: any) {
        toast.error('Failed to load recipe suggestions');
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [apiClient]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ChefHat className="h-5 w-5 text-primary" />
              Recipe Suggestions
            </CardTitle>
            <CardDescription>Based on your pantry items</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/recipes">
              View All
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-lg border p-4">
                <div className="mb-2 h-5 w-3/4 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
              </div>
            ))}
          </div>
        ) : recipes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <ChefHat className="mb-3 h-12 w-12 text-gray-300" />
            <p className="mb-1 font-medium text-gray-900">No suggestions yet</p>
            <p className="mb-4 text-sm text-gray-600">
              Add items to your pantry to get recipe suggestions
            </p>
            <Button asChild>
              <Link href="/pantry">Go to Pantry</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {recipes.slice(0, 3).map((recipe) => (
              <div
                key={recipe.id}
                className="rounded-lg border p-4 transition-colors hover:bg-gray-50"
              >
                <div className="mb-2 flex items-start justify-between">
                  <h4 className="font-semibold text-gray-900">{recipe.name}</h4>
                  <Badge variant="secondary" className="ml-2">
                    {recipe.matchPercentage}% match
                  </Badge>
                </div>
                <p className="mb-3 text-sm text-gray-600">{recipe.cuisine}</p>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Clock className="mr-1 h-3 w-3" />
                    {recipe.prepTime}m
                  </div>
                  <div className="flex items-center">
                    <Users className="mr-1 h-3 w-3" />
                    {recipe.servings} servings
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
