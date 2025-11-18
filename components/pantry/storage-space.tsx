'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Refrigerator, Snowflake, Package } from 'lucide-react';

interface StorageData {
  location: string;
  itemCount: number;
  capacity: number;
  icon: React.ElementType;
  color: string;
}

interface StorageSpaceProps {
  pantryCount: number;
  fridgeCount: number;
  freezerCount: number;
}

export function StorageSpace({ pantryCount, fridgeCount, freezerCount }: StorageSpaceProps) {
  const storageData: StorageData[] = [
    {
      location: 'Pantry',
      itemCount: pantryCount,
      capacity: 100,
      icon: Package,
      color: 'text-amber-600',
    },
    {
      location: 'Fridge',
      itemCount: fridgeCount,
      capacity: 50,
      icon: Refrigerator,
      color: 'text-blue-600',
    },
    {
      location: 'Freezer',
      itemCount: freezerCount,
      capacity: 30,
      icon: Snowflake,
      color: 'text-cyan-600',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Storage Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {storageData.map((storage) => {
          const percentage = Math.min((storage.itemCount / storage.capacity) * 100, 100);
          const Icon = storage.icon;

          return (
            <div key={storage.location}>
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className={`h-5 w-5 ${storage.color}`} />
                  <span className="font-medium text-gray-900">{storage.location}</span>
                </div>
                <span className="text-sm text-gray-600">
                  {storage.itemCount} / {storage.capacity}
                </span>
              </div>
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">{percentage.toFixed(0)}% full</p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
