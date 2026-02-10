"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Search,
  Plus,
  AlertTriangle,
  Filter,
  ShoppingCart,
  ArrowUpDown,
  Loader2,
  RefreshCw,
  X,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { inventoryApi, InventoryItem } from "@/lib/api";
import { ProductModal } from "@/components/inventory/product-modal";
import { useCart } from "@/context/cart-context";

// Default venue ID - in production this would come from context/auth
const VENUE_ID = 1;

// Stock status type
type StockStatus = "critical" | "low" | "ok";

// Stock status helper
const getStockStatus = (item: InventoryItem): StockStatus => {
  if (!item.reorderLevel) return "ok";
  const ratio = item.quantityOnHand / item.reorderLevel;
  if (ratio <= 0.25) return "critical";
  if (ratio <= 0.75) return "low";
  return "ok";
};

// Stock status badge config
const statusConfig: Record<StockStatus, { variant: "danger" | "warning" | "success"; label: string }> = {
  critical: { variant: "danger", label: "Critical" },
  low: { variant: "warning", label: "Low" },
  ok: { variant: "success", label: "OK" },
};

// Sort options
const sortOptions = [
  { value: "name,asc", label: "Name A-Z" },
  { value: "name,desc", label: "Name Z-A" },
  { value: "quantityOnHand,asc", label: "Stock Low-High" },
  { value: "quantityOnHand,desc", label: "Stock High-Low" },
  { value: "sku,asc", label: "SKU A-Z" },
  { value: "createdAt,desc", label: "Newest First" },
];

// Filter options
const filterOptions = [
  { value: "all", label: "All Status" },
  { value: "ok", label: "In Stock" },
  { value: "low", label: "Low Stock" },
  { value: "critical", label: "Critical" },
];

export default function InventoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name,asc");
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  // Alert state
  const [showLowStockAlert, setShowLowStockAlert] = useState(true);

  // Cart
  const { addToCart, itemCount } = useCart();
  const router = useRouter();

  const handleQuickOrder = (item: InventoryItem & { status: StockStatus }) => {
    addToCart({
      inventoryItemId: item.id,
      name: item.name,
      sku: item.sku,
      unit: item.unit,
      quantity: item.reorderLevel ?? 1,
      unitCost: item.unitCost ?? 0,
    });
    toast.success(`"${item.name}" added to cart`);
  };

  // Fetch inventory data
  const fetchInventory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await inventoryApi.list(VENUE_ID, 0, 100, searchQuery || undefined);
      setItems(response.content ?? []);
    } catch (err) {
      console.error("Failed to fetch inventory:", err);
      setError("Failed to load inventory. Please check that the backend is running.");
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  // Debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchQuery !== undefined) {
        fetchInventory();
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery, fetchInventory]);

  // Handle refresh - reset filters
  const handleRefresh = async () => {
    setFilterStatus("all");
    setSortBy("name,asc");
    setSearchQuery("");
    // Also reset alert if it was dismissed? Maybe good UX.
    setShowLowStockAlert(true);
    await fetchInventory();
  };

  // Add status to items
  const itemsWithStatus: (InventoryItem & { status: StockStatus })[] = (Array.isArray(items) ? items : []).map(item => ({
    ...item,
    status: getStockStatus(item)
  }));

  // Filter inventory by status
  let filteredInventory = itemsWithStatus;
  if (filterStatus && filterStatus !== "all") {
    filteredInventory = itemsWithStatus.filter((item) => item.status === filterStatus);
  }

  // Sort inventory
  const [sortField, sortDir] = sortBy.split(",");
  filteredInventory = [...filteredInventory].sort((a, b) => {
    let aVal: string | number = "";
    let bVal: string | number = "";

    if (sortField === "name") {
      aVal = a.name.toLowerCase();
      bVal = b.name.toLowerCase();
    } else if (sortField === "sku") {
      aVal = a.sku.toLowerCase();
      bVal = b.sku.toLowerCase();
    } else if (sortField === "quantityOnHand") {
      aVal = a.quantityOnHand;
      bVal = b.quantityOnHand;
    } else if (sortField === "createdAt") {
      aVal = a.createdAt;
      bVal = b.createdAt;
    }

    if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
    if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  // Stats
  const criticalCount = itemsWithStatus.filter((i) => i.status === "critical").length;
  const lowCount = itemsWithStatus.filter((i) => i.status === "low").length;

  // Handle add/edit product
  const handleAddProduct = () => {
    setEditingItem(null);
    setShowProductModal(true);
  };

  const handleEditProduct = (item: InventoryItem) => {
    setEditingItem(item);
    setShowProductModal(true);
  };

  const handleProductSuccess = () => {
    fetchInventory();
  };



  if (loading && items.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          <p className="text-muted-foreground">Loading inventory...</p>
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
          <Button onClick={fetchInventory} variant="outline" className="gap-2">
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
          <h1 className="text-2xl font-bold text-foreground">Inventory</h1>
          <p className="text-muted-foreground">Track and manage your stock levels</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2" onClick={handleRefresh}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" className="gap-2 relative" onClick={() => router.push("/dashboard/cart")}>
            <ShoppingCart className="h-4 w-4" />
            Cart
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Button>
          <Button className="gap-2" onClick={handleAddProduct}>
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Alert Banner */}
      <AnimatePresence>
        {criticalCount > 0 && showLowStockAlert && (
          <motion.div
            className="bg-danger/10 border border-danger/20 rounded-lg p-4 flex items-center gap-3 relative"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <AlertTriangle className="h-5 w-5 text-danger" />
            <p className="text-sm text-foreground pr-8">
              <strong>{criticalCount} items</strong> are critically low and need immediate attention.
            </p>
            <div className="ml-auto flex items-center gap-2">
              <Button size="sm" variant="outline" className="border-danger text-danger hover:bg-danger/10">
                Auto-Order Low Stock
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6 text-muted-foreground hover:text-foreground"
                onClick={() => setShowLowStockAlert(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:border-foreground/20 transition-colors" onClick={() => setFilterStatus("all")}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <Package className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{items.length}</p>
                <p className="text-sm text-muted-foreground">Total Products</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer hover:border-warning/50 transition-colors ${filterStatus === "low" ? "border-warning" : ""}`}
          onClick={() => setFilterStatus(filterStatus === "low" ? "all" : "low")}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-warning/10 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{lowCount}</p>
                <p className="text-sm text-muted-foreground">Low Stock</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer hover:border-danger/50 transition-colors ${filterStatus === "critical" ? "border-danger" : ""}`}
          onClick={() => setFilterStatus(filterStatus === "critical" ? "all" : "critical")}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-danger/10 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-danger" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{criticalCount}</p>
                <p className="text-sm text-muted-foreground">Critical</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[150px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            {filterOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[160px]">
            <ArrowUpDown className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Inventory Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Product</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">SKU</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Stock</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Reorder Level</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      {items.length === 0
                        ? "No inventory items yet. Add your first product to get started."
                        : "No items match your search criteria."}
                    </td>
                  </tr>
                ) : (
                  filteredInventory.map((item, i) => (
                    <motion.tr
                      key={item.id}
                      className="border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                    >
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-foreground">{item.name}</p>
                          {item.supplierName && (
                            <p className="text-xs text-muted-foreground">{item.supplierName}</p>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-muted-foreground font-mono">{item.sku}</span>
                      </td>
                      <td className="p-4">
                        <span className={`font-medium ${item.status === "critical" ? "text-danger" : item.status === "low" ? "text-warning" : "text-foreground"}`}>
                          {item.quantityOnHand} {item.unit}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-muted-foreground">
                          {item.reorderLevel ?? "-"} {item.reorderLevel ? item.unit : ""}
                        </span>
                      </td>
                      <td className="p-4">
                        <Badge variant={statusConfig[item.status].variant}>
                          {statusConfig[item.status].label}
                        </Badge>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button size="sm" variant="ghost" onClick={() => handleEditProduct(item)}>
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-primary hover:text-primary"
                            onClick={() => handleQuickOrder(item)}
                          >
                            <Zap className="h-3 w-3 mr-1" />
                            Quick Order
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <ProductModal
        open={showProductModal}
        onOpenChange={setShowProductModal}
        item={editingItem}
        venueId={VENUE_ID}
        onSuccess={handleProductSuccess}
      />


    </div>
  );
}
