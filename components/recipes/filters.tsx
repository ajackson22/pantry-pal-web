'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface FiltersProps {
  genres: string[];
  dietaryRestrictions: string[];
  maxCookingTime: number;
  difficulty: string;
  servings: number;
  onGenresChange: (genres: string[]) => void;
  onDietaryChange: (restrictions: string[]) => void;
  onMaxCookingTimeChange: (time: number) => void;
  onDifficultyChange: (difficulty: string) => void;
  onServingsChange: (servings: number) => void;
  onClearFilters: () => void;
}

const GENRE_OPTIONS = [
  'Italian',
  'Mexican',
  'Asian',
  'American',
  'Mediterranean',
  'Indian',
  'French',
  'Thai',
  'Japanese',
  'Chinese',
];

const DIETARY_OPTIONS = [
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Dairy-Free',
  'Keto',
  'Paleo',
  'Low-Carb',
  'Nut-Free',
];

export function RecipeFilters({
  genres,
  dietaryRestrictions,
  maxCookingTime,
  difficulty,
  servings,
  onGenresChange,
  onDietaryChange,
  onMaxCookingTimeChange,
  onDifficultyChange,
  onServingsChange,
  onClearFilters,
}: FiltersProps) {
  const handleGenreToggle = (genre: string) => {
    if (genres.includes(genre)) {
      onGenresChange(genres.filter((g) => g !== genre));
    } else {
      onGenresChange([...genres, genre]);
    }
  };

  const handleDietaryToggle = (restriction: string) => {
    if (dietaryRestrictions.includes(restriction)) {
      onDietaryChange(dietaryRestrictions.filter((r) => r !== restriction));
    } else {
      onDietaryChange([...dietaryRestrictions, restriction]);
    }
  };

  const hasActiveFilters =
    genres.length > 0 ||
    dietaryRestrictions.length > 0 ||
    maxCookingTime !== 120 ||
    difficulty !== 'all' ||
    servings !== 4;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Filters</CardTitle>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={onClearFilters}>
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label className="mb-3 block text-sm font-medium">Genres</Label>
          <div className="flex flex-wrap gap-2">
            {GENRE_OPTIONS.map((genre) => {
              const isSelected = genres.includes(genre);
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

        <div>
          <Label className="mb-3 block text-sm font-medium">Dietary Restrictions</Label>
          <div className="space-y-2">
            {DIETARY_OPTIONS.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={option}
                  checked={dietaryRestrictions.includes(option)}
                  onCheckedChange={() => handleDietaryToggle(option)}
                />
                <Label htmlFor={option} className="text-sm font-normal">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label className="mb-3 block text-sm font-medium">
            Max Cooking Time: {maxCookingTime} min
          </Label>
          <Slider
            value={[maxCookingTime]}
            onValueChange={(value) => onMaxCookingTimeChange(value[0])}
            min={15}
            max={180}
            step={15}
          />
        </div>

        <div>
          <Label className="mb-3 block text-sm font-medium">Difficulty</Label>
          <Select value={difficulty} onValueChange={onDifficultyChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="mb-3 block text-sm font-medium">Servings: {servings}</Label>
          <Slider
            value={[servings]}
            onValueChange={(value) => onServingsChange(value[0])}
            min={1}
            max={12}
            step={1}
          />
        </div>
      </CardContent>
    </Card>
  );
}
