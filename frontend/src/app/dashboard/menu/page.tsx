"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  UtensilsCrossed,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  TrendingUp,
  Sparkles,
  Loader2,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { menuItemApi, MenuItem, MenuCategory } from "@/lib/api";
import { MenuItemModal } from "@/components/menu/menu-item-modal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Default venue ID - in production this would come from context/auth
const VENUE_ID = 1;

// Category display names
const categoryLabels: Record<MenuCategory, string> = {
  COCKTAIL: "Cocktails",
  BEER: "Beer",
  WINE: "Wine",
  SPIRIT: "Spirits",
  SOFT_DRINK: "Soft Drinks",
  HOT_DRINK: "Hot Drinks",
  FOOD: "Food",
  DESSERT: "Desserts",
  SNACK: "Snacks",
  OTHER: "Other",
};

export default function MenuPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showMenuItemModal, setShowMenuItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<MenuItem | null>(null);

  // Fetch menu items
  const fetchMenuItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await menuItemApi.list(VENUE_ID);
      setItems(data ?? []);
    } catch (err) {
      console.error("Failed to fetch menu items:", err);
      setError("Failed to load menu items. Please check that the backend is running.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenuItems();
  }, [fetchMenuItems]);

  // Toggle availability
  const handleToggleAvailability = async (item: MenuItem) => {
    try {
      const updated = await menuItemApi.toggleAvailability(item.id, !item.available);
      setItems(prev => prev.map(i => i.id === item.id ? updated : i));
      toast.success(`${item.name} is now ${!item.available ? "available" : "unavailable"}`);
    } catch (err) {
      console.error("Failed to toggle availability:", err);
      toast.error("Failed to update availability");
    }
  };

  // Handle add menu item
  const handleAddMenuItem = () => {
    setEditingItem(null);
    setShowMenuItemModal(true);
  };

  // Handle edit menu item
  const handleEditMenuItem = (item: MenuItem) => {
    setEditingItem(item);
    setShowMenuItemModal(true);
  };

  // Handle delete menu item
  const handleDeleteMenuItem = (item: MenuItem) => {
    setDeletingItem(item);
  };

  const confirmDelete = async () => {
    if (!deletingItem) return;

    try {
      await menuItemApi.deactivate(deletingItem.id);
      setItems(prev => prev.filter(i => i.id !== deletingItem.id));
      toast.success(`${deletingItem.name} has been deleted`);
    } catch (err) {
      console.error("Failed to delete menu item:", err);
      toast.error("Failed to delete menu item");
    } finally {
      setDeletingItem(null);
    }
  };

  // Handle modal success
  const handleMenuItemSuccess = () => {
    fetchMenuItems();
  };

  // Get unique categories from items (with defensive array check)
  const safeItems = Array.isArray(items) ? items : [];
  const categories = ["all", ...new Set(safeItems.map((item) => item.category))];

  // Filter items
  const filteredItems = safeItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "all" || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  // Stats
  const avgMargin = safeItems.length > 0
    ? safeItems.reduce((sum, item) => sum + (item.profitMargin || 0), 0) / safeItems.length
    : 0;
  const unavailableCount = safeItems.filter((i) => !i.available).length;

  if (loading && items.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          <p className="text-muted-foreground">Loading menu items...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <AlertTriangle className="h-8 w-8 mx-auto text-danger" />
          <p className="text-danger">{error}</p>
          <Button onClick={fetchMenuItems} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Menu Management</h1>
          <p className="text-muted-foreground">Manage your menu items, pricing, and availability</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2" onClick={fetchMenuItems}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" className="gap-2">
            <Sparkles className="h-4 w-4" />
            Generate Description
          </Button>
          <Button className="gap-2" onClick={handleAddMenuItem}>
            <Plus className="h-4 w-4" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <UtensilsCrossed className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{items.length}</p>
                <p className="text-sm text-muted-foreground">Total Items</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{avgMargin.toFixed(1)}%</p>
                <p className="text-sm text-muted-foreground">Avg Margin</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-500/10 rounded-lg">
                <EyeOff className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{unavailableCount}</p>
                <p className="text-sm text-muted-foreground">86&apos;d Items</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Tabs */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <TabsList className="bg-muted flex-wrap">
            {categories.map((cat) => (
              <TabsTrigger key={cat} value={cat} className="capitalize">
                {cat === "all" ? "All" : categoryLabels[cat as MenuCategory] || cat}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <TabsContent value={activeCategory} className="mt-6">
          {/* Empty state */}
          {filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <UtensilsCrossed className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                {items.length === 0 ? "No menu items yet" : "No items match your search"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {items.length === 0
                  ? "Add your first menu item to get started."
                  : "Try adjusting your search or category filter."}
              </p>
              {items.length === 0 && (
                <Button className="gap-2" onClick={handleAddMenuItem}>
                  <Plus className="h-4 w-4" />
                  Add First Item
                </Button>
              )}
            </div>
          ) : (
            /* Menu Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Card className={`group h-full ${!item.available ? "opacity-60" : ""}`}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">{item.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {categoryLabels[item.category] || item.category}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => handleEditMenuItem(item)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-danger"
                            onClick={() => handleDeleteMenuItem(item)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Description */}
                      {item.description && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {item.description}
                        </p>
                      )}

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {item.hasRecipe && (
                          <Badge variant="outline" className="text-xs">
                            Has Recipe
                          </Badge>
                        )}
                      </div>

                      {/* Pricing */}
                      <div className="flex items-center justify-between pt-3 border-t border-border">
                        <div>
                          <p className="text-lg font-bold text-foreground">€{item.price.toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">
                            Cost: €{item.cost.toFixed(2)} • {item.profitMargin.toFixed(0)}% margin
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant={item.available ? "outline" : "default"}
                          className={!item.available ? "bg-danger hover:bg-danger/90" : ""}
                          onClick={() => handleToggleAvailability(item)}
                        >
                          {item.available ? (
                            <>
                              <Eye className="h-4 w-4 mr-1" />
                              Live
                            </>
                          ) : (
                            <>
                              <EyeOff className="h-4 w-4 mr-1" />
                              86&apos;d
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <MenuItemModal
        open={showMenuItemModal}
        onOpenChange={setShowMenuItemModal}
        item={editingItem}
        venueId={VENUE_ID}
        onSuccess={handleMenuItemSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingItem} onOpenChange={(open: boolean) => !open && setDeletingItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Menu Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deletingItem?.name}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-danger hover:bg-danger/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
