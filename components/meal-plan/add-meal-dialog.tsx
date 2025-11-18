'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useApiClient } from '@/lib/hooks/use-api-client';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface AddMealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date | null;
  onAdded: () => void;
}

export function AddMealDialog({
  open,
  onOpenChange,
  selectedDate,
  onAdded,
}: AddMealDialogProps) {
  const [loading, setLoading] = useState(false);
  const [recipeName, setRecipeName] = useState('');
  const [mealType, setMealType] = useState('dinner');
  const apiClient = useApiClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) return;

    setLoading(true);

    try {
      await apiClient.post('/meal-plans', {
        date: format(selectedDate, 'yyyy-MM-dd'),
        mealType,
        recipeName,
      });

      toast.success('Meal added to plan!');
      onAdded();
      onOpenChange(false);
      setRecipeName('');
      setMealType('dinner');
    } catch (error: any) {
      toast.error(error.message || 'Failed to add meal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Meal</DialogTitle>
          <DialogDescription>
            Add a meal to {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'your plan'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="recipeName">Recipe/Meal Name</Label>
              <Input
                id="recipeName"
                value={recipeName}
                onChange={(e) => setRecipeName(e.target.value)}
                placeholder="Enter meal name..."
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="mealType">Meal Type</Label>
              <Select value={mealType} onValueChange={setMealType} required>
                <SelectTrigger id="mealType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="breakfast">Breakfast</SelectItem>
                  <SelectItem value="lunch">Lunch</SelectItem>
                  <SelectItem value="dinner">Dinner</SelectItem>
                  <SelectItem value="snack">Snack</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Meal'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
