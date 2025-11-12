'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { MoreVertical, Trash2, Edit, Calendar } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format, differenceInDays } from 'date-fns';

export interface PantryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  location: string;
  expirationDate?: string;
  addedDate: string;
}

interface PantryItemsProps {
  items: PantryItem[];
  selectedItems: string[];
  onItemSelect: (id: string, selected: boolean) => void;
  onDeleteItem: (id: string) => void;
  onEditItem: (item: PantryItem) => void;
}

export function PantryItems({
  items,
  selectedItems,
  onItemSelect,
  onDeleteItem,
  onEditItem,
}: PantryItemsProps) {
  const getExpirationStatus = (expirationDate?: string) => {
    if (!expirationDate) return null;

    const daysUntilExpiration = differenceInDays(new Date(expirationDate), new Date());

    if (daysUntilExpiration < 0) {
      return { label: 'Expired', color: 'bg-red-100 text-red-800' };
    } else if (daysUntilExpiration <= 3) {
      return { label: 'Expires Soon', color: 'bg-orange-100 text-orange-800' };
    } else if (daysUntilExpiration <= 7) {
      return { label: 'Expires in 1 week', color: 'bg-yellow-100 text-yellow-800' };
    }

    return null;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      produce: 'bg-green-100 text-green-800',
      dairy: 'bg-blue-100 text-blue-800',
      meat: 'bg-red-100 text-red-800',
      grains: 'bg-amber-100 text-amber-800',
      canned: 'bg-gray-100 text-gray-800',
      snacks: 'bg-purple-100 text-purple-800',
      beverages: 'bg-cyan-100 text-cyan-800',
      condiments: 'bg-yellow-100 text-yellow-800',
      frozen: 'bg-indigo-100 text-indigo-800',
      other: 'bg-slate-100 text-slate-800',
    };
    return colors[category] || colors.other;
  };

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-lg font-medium text-gray-900">No items found</p>
          <p className="text-sm text-gray-600">Try adjusting your filters or add new items</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => {
        const expirationStatus = getExpirationStatus(item.expirationDate);
        const isSelected = selectedItems.includes(item.id);

        return (
          <Card key={item.id} className={`transition-shadow hover:shadow-md ${isSelected ? 'ring-2 ring-primary' : ''}`}>
            <CardContent className="p-4">
              <div className="mb-3 flex items-start justify-between">
                <div className="flex items-start gap-2">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) => onItemSelect(item.id, checked as boolean)}
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-600">
                      {item.quantity} {item.unit}
                    </p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEditItem(item)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDeleteItem(item.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className={getCategoryColor(item.category)}>
                  {item.category}
                </Badge>
                <Badge variant="outline">{item.location}</Badge>
                {expirationStatus && (
                  <Badge className={expirationStatus.color}>{expirationStatus.label}</Badge>
                )}
              </div>
              {item.expirationDate && (
                <div className="mt-3 flex items-center text-xs text-gray-600">
                  <Calendar className="mr-1 h-3 w-3" />
                  Expires: {format(new Date(item.expirationDate), 'MMM dd, yyyy')}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
