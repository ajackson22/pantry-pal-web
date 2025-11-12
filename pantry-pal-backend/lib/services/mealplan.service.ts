import { supabase } from '../supabase';
import { MealPlan, Recipe } from '../types/database';
import { calendarService } from './calendar.service';
import { settingsService } from './settings.service';

export interface MealPlanWithRecipe extends MealPlan {
  recipe?: Recipe;
}

export interface ScheduledMeal {
  recipe_id: string;
  date: string;
  meal_type: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
}

export class MealPlanService {
  async getMealPlans(userId: string, startDate?: string, endDate?: string): Promise<MealPlanWithRecipe[]> {
    let query = supabase
      .from('meal_plans')
      .select('*, recipes(*)')
      .eq('user_id', userId);

    if (startDate) {
      query = query.gte('date', startDate);
    }
    if (endDate) {
      query = query.lte('date', endDate);
    }

    const { data, error } = await query.order('date', { ascending: true });

    if (error) throw new Error(error.message);

    return (data || []).map((item: any) => ({
      ...item,
      recipe: item.recipes,
      recipes: undefined,
    }));
  }

  async getMealPlan(userId: string, mealPlanId: string): Promise<MealPlanWithRecipe | null> {
    const { data, error } = await supabase
      .from('meal_plans')
      .select('*, recipes(*)')
      .eq('id', mealPlanId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw new Error(error.message);

    if (!data) return null;

    return {
      ...data,
      recipe: (data as any).recipes,
      recipes: undefined,
    };
  }

  async createMealPlan(userId: string, mealPlan: Partial<MealPlan>): Promise<MealPlan> {
    const { data, error } = await supabase
      .from('meal_plans')
      .insert({ ...mealPlan, user_id: userId })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async createMealPlans(
    userId: string,
    scheduledMeals: ScheduledMeal[],
    syncWithCalendar: boolean = false
  ): Promise<MealPlan[]> {
    const settings = await settingsService.getSettings(userId);
    const mealTimes = settings?.meal_times as any || {
      breakfast: '08:00',
      lunch: '12:00',
      dinner: '18:00',
      snacks: '15:00',
    };

    const mealPlansToCreate = await Promise.all(
      scheduledMeals.map(async (meal) => {
        const { data: recipe } = await supabase
          .from('recipes')
          .select('title, description')
          .eq('id', meal.recipe_id)
          .single();

        let calendarEventId: string | undefined;

        if (syncWithCalendar && settings?.sync_with_calendar) {
          try {
            const mealTypeKey = meal.meal_type.toLowerCase();
            const mealTime = mealTimes[mealTypeKey] || '12:00';

            calendarEventId = await calendarService.createCalendarEvent(userId, {
              summary: `${meal.meal_type}: ${recipe?.title || 'Meal'}`,
              description: recipe?.description,
              date: meal.date,
              mealTime,
            });
          } catch (error) {
            console.error('Failed to create calendar event:', error);
          }
        }

        return {
          user_id: userId,
          recipe_id: meal.recipe_id,
          date: meal.date,
          meal_type: meal.meal_type,
          calendar_event_id: calendarEventId,
          sync_with_calendar: syncWithCalendar && settings?.sync_with_calendar,
        };
      })
    );

    const { data, error } = await supabase
      .from('meal_plans')
      .insert(mealPlansToCreate)
      .select();

    if (error) throw new Error(error.message);
    return data || [];
  }

  async updateMealPlan(
    userId: string,
    mealPlanId: string,
    updates: Partial<MealPlan>
  ): Promise<MealPlan> {
    const { data, error } = await supabase
      .from('meal_plans')
      .update(updates)
      .eq('id', mealPlanId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async deleteMealPlan(userId: string, mealPlanId: string): Promise<void> {
    const mealPlan = await this.getMealPlan(userId, mealPlanId);

    if (mealPlan?.calendar_event_id) {
      try {
        await calendarService.deleteCalendarEvent(userId, mealPlan.calendar_event_id);
      } catch (error) {
        console.error('Failed to delete calendar event:', error);
      }
    }

    const { error } = await supabase
      .from('meal_plans')
      .delete()
      .eq('id', mealPlanId)
      .eq('user_id', userId);

    if (error) throw new Error(error.message);
  }
}

export const mealPlanService = new MealPlanService();
