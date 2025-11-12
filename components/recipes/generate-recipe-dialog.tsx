'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useApiClient } from '@/lib/hooks/use-api-client';
import { toast } from 'sonner';
import { X } from 'lucide-react';

interface GenerateRecipeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRecipesGenerated: () => void;
}

const GENRE_OPTIONS = ['Italian', 'Mexican', 'Asian', 'American', 'Mediterranean', 'Indian'];
const DIETARY_OPTIONS = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Paleo'];

export function GenerateRecipeDialog({
  open,
  onOpenChange,
  onRecipesGenerated,
}: GenerateRecipeDialogProps) {
  const [loading, setLoading] = useState(false);
  const [numRecipes, setNumRecipes] = useState('3');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
  const [maxCookingTime, setMaxCookingTime] = useState('60');
  const [usePantryIngredients, setUsePantryIngredients] = useState(true);
  const [customPrompt, setCustomPrompt] = useState('');
  const apiClient = useApiClient();

  const handleGenreToggle = (genre: string) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter((g) => g !== genre));
    } else {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  const handleDietaryToggle = (restriction: string) => {
    if (selectedDietary.includes(restriction)) {
      setSelectedDietary(selectedDietary.filter((r) => r !== restriction));
    } else {
      setSelectedDietary([...selectedDietary, restriction]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await apiClient.post('/recipes/generate', {
        numRecipes: parseInt(numRecipes),
        genres: selectedGenres,
        dietaryRestrictions: selectedDietary,
        maxCookingTime: parseInt(maxCookingTime),
        usePantryIngredients,
        customPrompt,
      });

      toast.success('Recipes generated successfully!');
      onRecipesGenerated();
      onOpenChange(false);

      setNumRecipes('3');
      setSelectedGenres([]);
      setSelectedDietary([]);
      setMaxCookingTime('60');
      setUsePantryIngredients(true);
      setCustomPrompt('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate recipes');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Generate Recipes</DialogTitle>
          <DialogDescription>
            Let AI create personalized recipes based on your preferences
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="numRecipes">Number of Recipes</Label>
              <Input
                id="numRecipes"
                type="number"
                min="1"
                max="10"
                value={numRecipes}
                onChange={(e) => setNumRecipes(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label>Cuisines (Optional)</Label>
              <div className="flex flex-wrap gap-2">
                {GENRE_OPTIONS.map((genre) => {
                  const isSelected = selectedGenres.includes(genre);
                  return (
                    <Badge
                      key={genre}
                      variant={isSelected ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => handleGenreToggle(genre)}
                    >
                      {genre}
                      {isSelected && <X className="ml-1 h-3 w-3" />}
                    </Badge>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Dietary Restrictions (Optional)</Label>
              <div className="flex flex-wrap gap-2">
                {DIETARY_OPTIONS.map((option) => {
                  const isSelected = selectedDietary.includes(option);
                  return (
                    <Badge
                      key={option}
                      variant={isSelected ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => handleDietaryToggle(option)}
                    >
                      {option}
                      {isSelected && <X className="ml-1 h-3 w-3" />}
                    </Badge>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="maxCookingTime">Max Cooking Time (minutes)</Label>
              <Input
                id="maxCookingTime"
                type="number"
                min="15"
                max="180"
                step="15"
                value={maxCookingTime}
                onChange={(e) => setMaxCookingTime(e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="usePantry"
                checked={usePantryIngredients}
                onCheckedChange={(checked) => setUsePantryIngredients(checked as boolean)}
              />
              <Label htmlFor="usePantry" className="font-normal">
                Use ingredients from my pantry
              </Label>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="customPrompt">Custom Instructions (Optional)</Label>
              <Textarea
                id="customPrompt"
                placeholder="E.g., I want spicy recipes, avoid seafood, include desserts..."
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Generating...' : 'Generate Recipes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
