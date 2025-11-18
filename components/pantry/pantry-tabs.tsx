'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Filter, AlertCircle } from 'lucide-react';

interface PantryTabsProps {
  location: string;
  category: string;
  showExpiring: boolean;
  onLocationChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onShowExpiringChange: (value: boolean) => void;
}

export function PantryTabs({
  location,
  category,
  showExpiring,
  onLocationChange,
  onCategoryChange,
  onShowExpiringChange,
}: PantryTabsProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <Tabs value={location} onValueChange={onLocationChange}>
        <TabsList>
          <TabsTrigger value="all">All Items</TabsTrigger>
          <TabsTrigger value="pantry">Pantry</TabsTrigger>
          <TabsTrigger value="fridge">Fridge</TabsTrigger>
          <TabsTrigger value="freezer">Freezer</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex gap-2">
        <Select value={category} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="produce">Produce</SelectItem>
            <SelectItem value="dairy">Dairy</SelectItem>
            <SelectItem value="meat">Meat & Seafood</SelectItem>
            <SelectItem value="grains">Grains & Pasta</SelectItem>
            <SelectItem value="canned">Canned Goods</SelectItem>
            <SelectItem value="snacks">Snacks</SelectItem>
            <SelectItem value="beverages">Beverages</SelectItem>
            <SelectItem value="condiments">Condiments</SelectItem>
            <SelectItem value="frozen">Frozen</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant={showExpiring ? 'default' : 'outline'}
          onClick={() => onShowExpiringChange(!showExpiring)}
        >
          <AlertCircle className="mr-2 h-4 w-4" />
          Expiring
        </Button>
      </div>
    </div>
  );
}
