'use client';

import { useAuth } from '@/lib/providers/auth-provider';
import { Calendar } from 'lucide-react';

export function DashboardHeader() {
  const { user } = useAuth();
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-gray-900">
        {greeting()}, {user?.email?.split('@')[0]}!
      </h1>
      <div className="mt-2 flex items-center text-gray-600">
        <Calendar className="mr-2 h-4 w-4" />
        <span>{today}</span>
      </div>
    </div>
  );
}
