'use client';

import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Calendar, Plus, Wand2 } from 'lucide-react';

interface MealPlanHeaderProps {
  googleCalendarSync: boolean;
  onGoogleCalendarSyncChange: (enabled: boolean) => void;
  onGenerateMealPlan: () => void;
  onAddMeal: () => void;
}

export function MealPlanHeader({
  googleCalendarSync,
  onGoogleCalendarSyncChange,
  onGenerateMealPlan,
  onAddMeal,
}: MealPlanHeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold text-gray-900">
            <Calendar className="h-8 w-8 text-primary" />
            Meal Plan
          </h1>
          <p className="mt-1 text-gray-600">Plan your meals for the week ahead</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="google-sync"
              checked={googleCalendarSync}
              onCheckedChange={onGoogleCalendarSyncChange}
            />
            <Label htmlFor="google-sync">Google Calendar</Label>
          </div>
          <Button variant="outline" onClick={onAddMeal}>
            <Plus className="mr-2 h-4 w-4" />
            Add Meal
          </Button>
          <Button onClick={onGenerateMealPlan}>
            <Wand2 className="mr-2 h-4 w-4" />
            Generate Plan
          </Button>
        </div>
      </div>
    </div>
  );
}
