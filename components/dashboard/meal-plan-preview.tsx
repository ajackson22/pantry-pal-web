'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useApiClient } from '@/lib/hooks/use-api-client';
import { CalendarDays, ChevronRight, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface MealPlan {
  id: string;
  date: string;
  mealType: string;
  recipeName: string;
  prepTime: number;
}

export function MealPlanPreview() {
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const apiClient = useApiClient();

  useEffect(() => {
    const fetchMealPlans = async () => {
      try {
        const data = await apiClient.get<MealPlan[]>('/meal-plans/upcoming');
        setMealPlans(data);
      } catch (error: any) {
        toast.error('Failed to load meal plans');
      } finally {
        setLoading(false);
      }
    };

    fetchMealPlans();
  }, [apiClient]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-primary" />
              This Week's Meal Plans
            </CardTitle>
            <CardDescription>Your upcoming meals for the week</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/meal-plan">
              View All
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-2">
                  <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
                  <div className="h-3 w-24 animate-pulse rounded bg-gray-200" />
                </div>
                <div className="h-3 w-16 animate-pulse rounded bg-gray-200" />
              </div>
            ))}
          </div>
        ) : mealPlans.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CalendarDays className="mb-3 h-12 w-12 text-gray-300" />
            <p className="mb-1 font-medium text-gray-900">No meal plans yet</p>
            <p className="mb-4 text-sm text-gray-600">
              Start planning your meals for the week
            </p>
            <Button asChild>
              <Link href="/meal-plan">Create Meal Plan</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {mealPlans.slice(0, 3).map((meal) => (
              <div
                key={meal.id}
                className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-gray-50"
              >
                <div>
                  <p className="font-medium text-gray-900">{meal.recipeName}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(meal.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}{' '}
                    · {meal.mealType}
                  </p>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="mr-1 h-3 w-3" />
                  {meal.prepTime}m
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
