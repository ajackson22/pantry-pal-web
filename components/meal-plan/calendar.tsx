'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { startOfMonth, endOfMonth, eachDayOfInterval, format, isSameMonth, isToday, startOfWeek, endOfWeek } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

export interface MealPlanItem {
  id: string;
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  recipeName: string;
}

interface MealPlanCalendarProps {
  currentMonth: Date;
  mealPlans: MealPlanItem[];
  onMonthChange: (month: Date) => void;
  onAddMeal: (date: Date) => void;
  onMealClick: (meal: MealPlanItem) => void;
}

export function MealPlanCalendar({
  currentMonth,
  mealPlans,
  onMonthChange,
  onAddMeal,
  onMealClick,
}: MealPlanCalendarProps) {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getMealsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return mealPlans.filter((meal) => meal.date === dateStr);
  };

  const getMealTypeColor = (mealType: string) => {
    const colors: Record<string, string> = {
      breakfast: 'bg-yellow-100 text-yellow-800',
      lunch: 'bg-green-100 text-green-800',
      dinner: 'bg-blue-100 text-blue-800',
      snack: 'bg-purple-100 text-purple-800',
    };
    return colors[mealType] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">{format(currentMonth, 'MMMM yyyy')}</h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onMonthChange(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onMonthChange(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-600">
              {day}
            </div>
          ))}

          {days.map((day) => {
            const meals = getMealsForDate(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isDayToday = isToday(day);

            return (
              <div
                key={day.toISOString()}
                className={`min-h-[120px] border p-2 ${
                  !isCurrentMonth ? 'bg-gray-50' : 'bg-white'
                } ${isDayToday ? 'ring-2 ring-primary' : ''}`}
              >
                <div className="mb-1 flex items-center justify-between">
                  <span className={`text-sm ${!isCurrentMonth ? 'text-gray-400' : 'font-medium'}`}>
                    {format(day, 'd')}
                  </span>
                  {isCurrentMonth && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => onAddMeal(day)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                <div className="space-y-1">
                  {meals.map((meal) => (
                    <Badge
                      key={meal.id}
                      className={`cursor-pointer text-xs ${getMealTypeColor(meal.mealType)}`}
                      onClick={() => onMealClick(meal)}
                    >
                      {meal.recipeName.length > 15
                        ? meal.recipeName.substring(0, 15) + '...'
                        : meal.recipeName}
                    </Badge>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
