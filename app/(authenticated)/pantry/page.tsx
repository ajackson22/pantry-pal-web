'use client';

import { useState, useEffect, useMemo } from 'react';
import { PantryHeader } from '@/components/pantry/header';
import { PantryTabs } from '@/components/pantry/pantry-tabs';
import { PantryItems, PantryItem } from '@/components/pantry/pantry-items';
import { AddItemForm } from '@/components/pantry/add-item-form';
import { AddReceiptForm } from '@/components/pantry/add-receipt-form';
import { StorageSpace } from '@/components/pantry/storage-space';
import { PantryVisualization } from '@/components/pantry/pantry-visualization';
import { ChatPanel } from '@/components/chat/chat-panel';
import { Button } from '@/components/ui/button';
import { useApiClient } from '@/lib/hooks/use-api-client';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';
import { differenceInDays } from 'date-fns';

export default function PantryPage() {
  const [items, setItems] = useState<PantryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('all');
  const [category, setCategory] = useState('all');
  const [showExpiring, setShowExpiring] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showAddItem, setShowAddItem] = useState(false);
  const [showAddReceipt, setShowAddReceipt] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const apiClient = useApiClient();

  const fetchItems = async () => {
    try {
      const data = await apiClient.get<PantryItem[]>('/pantry/items');
      setItems(data);
    } catch (error: any) {
      toast.error('Failed to load pantry items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLocation = location === 'all' || item.location === location;
      const matchesCategory = category === 'all' || item.category === category;
      const isExpiring = showExpiring
        ? item.expirationDate && differenceInDays(new Date(item.expirationDate), new Date()) <= 3
        : true;

      return matchesSearch && matchesLocation && matchesCategory && isExpiring;
    });
  }, [items, searchQuery, location, category, showExpiring]);

  const handleItemSelect = (id: string, selected: boolean) => {
    setSelectedItems((prev) =>
      selected ? [...prev, id] : prev.filter((itemId) => itemId !== id)
    );
  };

  const handleDeleteItem = async (id: string) => {
    try {
      await apiClient.delete(`/pantry/items/${id}`);
      toast.success('Item deleted');
      fetchItems();
      setSelectedItems((prev) => prev.filter((itemId) => itemId !== id));
    } catch (error: any) {
      toast.error('Failed to delete item');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) return;

    try {
      await apiClient.post('/pantry/items/bulk-delete', { ids: selectedItems });
      toast.success(`Deleted ${selectedItems.length} items`);
      fetchItems();
      setSelectedItems([]);
    } catch (error: any) {
      toast.error('Failed to delete items');
    }
  };

  const handleEditItem = (item: PantryItem) => {
    toast.info('Edit functionality coming soon');
  };

  const locationCounts = useMemo(() => {
    return {
      pantry: items.filter((item) => item.location === 'pantry').length,
      fridge: items.filter((item) => item.location === 'fridge').length,
      freezer: items.filter((item) => item.location === 'freezer').length,
    };
  }, [items]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <PantryHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onAddItem={() => setShowAddItem(true)}
        onScanReceipt={() => setShowAddReceipt(true)}
        onOpenChat={() => setShowChat(true)}
      />

      <div className="mb-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <StorageSpace
            pantryCount={locationCounts.pantry}
            fridgeCount={locationCounts.fridge}
            freezerCount={locationCounts.freezer}
          />
        </div>
        <PantryVisualization items={items} />
      </div>

      <div className="mb-4 flex items-center justify-between">
        <PantryTabs
          location={location}
          category={category}
          showExpiring={showExpiring}
          onLocationChange={setLocation}
          onCategoryChange={setCategory}
          onShowExpiringChange={setShowExpiring}
        />
      </div>

      {selectedItems.length > 0 && (
        <div className="mb-4 flex items-center justify-between rounded-lg bg-primary/10 p-4">
          <p className="text-sm font-medium text-primary">
            {selectedItems.length} item(s) selected
          </p>
          <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Selected
          </Button>
        </div>
      )}

      <PantryItems
        items={filteredItems}
        selectedItems={selectedItems}
        onItemSelect={handleItemSelect}
        onDeleteItem={handleDeleteItem}
        onEditItem={handleEditItem}
      />

      <AddItemForm
        open={showAddItem}
        onOpenChange={setShowAddItem}
        onItemAdded={fetchItems}
      />

      <AddReceiptForm
        open={showAddReceipt}
        onOpenChange={setShowAddReceipt}
        onReceiptProcessed={fetchItems}
      />

      <ChatPanel open={showChat} onOpenChange={setShowChat} />
    </div>
  );
}
