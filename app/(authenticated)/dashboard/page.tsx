'use client';

import Link from 'next/link';
import { DashboardHeader } from '@/components/dashboard/header';
import { PantryOverview } from '@/components/dashboard/pantry-overview';
import { MealPlanPreview } from '@/components/dashboard/meal-plan-preview';
import { RecipeSuggestions } from '@/components/dashboard/recipe-suggestions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Camera, Calendar, MessageSquare, ShoppingCart, ChefHat } from 'lucide-react';

export default function DashboardPage() {
  const quickActions = [
    {
      title: 'Add Item',
      description: 'Add new items to pantry',
      icon: Package,
      href: '/pantry',
      color: 'bg-blue-50 text-blue-600',
    },
    {
      title: 'Scan Receipt',
      description: 'Upload receipt image',
      icon: Camera,
      href: '/pantry',
      color: 'bg-green-50 text-green-600',
    },
    {
      title: 'Plan Meals',
      description: 'Create weekly meal plan',
      icon: Calendar,
      href: '/meal-plan',
      color: 'bg-purple-50 text-purple-600',
    },
    {
      title: 'Browse Recipes',
      description: 'Find new recipes',
      icon: ChefHat,
      href: '/recipes',
      color: 'bg-orange-50 text-orange-600',
    },
    {
      title: 'Shopping List',
      description: 'View shopping list',
      icon: ShoppingCart,
      href: '/shopping',
      color: 'bg-pink-50 text-pink-600',
    },
    {
      title: 'Ask Assistant',
      description: 'Chat with AI helper',
      icon: MessageSquare,
      href: '/pantry',
      color: 'bg-teal-50 text-teal-600',
    },
  ];

  return (
    <div>
      <DashboardHeader />

      <div className="space-y-6">
        <PantryOverview />

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {quickActions.map((action) => (
                <Button
                  key={action.title}
                  variant="outline"
                  className="h-auto justify-start p-4"
                  asChild
                >
                  <Link href={action.href}>
                    <div className="flex items-start gap-3">
                      <div className={`rounded-lg p-2 ${action.color}`}>
                        <action.icon className="h-5 w-5" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-gray-900">{action.title}</div>
                        <div className="text-sm text-gray-600">{action.description}</div>
                      </div>
                    </div>
                  </Link>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <MealPlanPreview />
          <RecipeSuggestions />
        </div>
      </div>
    </div>
  );
}
