'use client';

import { useState, useEffect } from 'react';
import { MealPlanHeader } from '@/components/meal-plan/header';
import { MealPlanStats } from '@/components/meal-plan/stats';
import { MealPlanCalendar, MealPlanItem } from '@/components/meal-plan/calendar';
import { GenerateMealPlanDialog } from '@/components/meal-plan/generate-meal-plan-dialog';
import { AddMealDialog } from '@/components/meal-plan/add-meal-dialog';
import { useApiClient } from '@/lib/hooks/use-api-client';
import { toast } from 'sonner';

export default function MealPlanPage() {
  const [mealPlans, setMealPlans] = useState<MealPlanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [googleCalendarSync, setGoogleCalendarSync] = useState(false);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [stats, setStats] = useState({
    totalMeals: 0,
    plannedThisWeek: 0,
    groceryItems: 0,
    completionRate: 0,
  });
  const apiClient = useApiClient();

  const fetchMealPlans = async () => {
    try {
      const data = await apiClient.get<MealPlanItem[]>('/meal-plans');
      setMealPlans(data);
    } catch (error: any) {
      toast.error('Failed to load meal plans');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await apiClient.get<typeof stats>('/meal-plans/stats');
      setStats(data);
    } catch (error: any) {
      console.error('Failed to load stats');
    }
  };

  useEffect(() => {
    fetchMealPlans();
    fetchStats();
  }, []);

  const handleAddMeal = (date: Date) => {
    setSelectedDate(date);
    setShowAddDialog(true);
  };

  const handleMealClick = (meal: MealPlanItem) => {
    toast.info('Meal details coming soon');
  };

  const handleGoogleCalendarSync = async (enabled: boolean) => {
    setGoogleCalendarSync(enabled);
    if (enabled) {
      toast.success('Google Calendar sync enabled');
    } else {
      toast.info('Google Calendar sync disabled');
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <MealPlanHeader
        googleCalendarSync={googleCalendarSync}
        onGoogleCalendarSyncChange={handleGoogleCalendarSync}
        onGenerateMealPlan={() => setShowGenerateDialog(true)}
        onAddMeal={() => setShowAddDialog(true)}
      />

      <MealPlanStats
        totalMeals={stats.totalMeals}
        plannedThisWeek={stats.plannedThisWeek}
        groceryItems={stats.groceryItems}
        completionRate={stats.completionRate}
      />

      <MealPlanCalendar
        currentMonth={currentMonth}
        mealPlans={mealPlans}
        onMonthChange={setCurrentMonth}
        onAddMeal={handleAddMeal}
        onMealClick={handleMealClick}
      />

      <GenerateMealPlanDialog
        open={showGenerateDialog}
        onOpenChange={setShowGenerateDialog}
        onGenerated={() => {
          fetchMealPlans();
          fetchStats();
        }}
      />

      <AddMealDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        selectedDate={selectedDate}
        onAdded={() => {
          fetchMealPlans();
          fetchStats();
        }}
      />
    </div>
  );
}
