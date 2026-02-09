"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Package,
  Search,
  Plus,
  AlertTriangle,
  Filter,
  ShoppingCart,
  ArrowUpDown,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { inventory } from "@/lib/mock-data";

// Stock status badge config
const statusConfig = {
  critical: { variant: "danger" as const, label: "Critical" },
  low: { variant: "warning" as const, label: "Low" },
  ok: { variant: "success" as const, label: "OK" },
};

export default function InventoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  // Filter inventory
  const filteredInventory = inventory.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = !filterStatus || item.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Stats
  const criticalCount = inventory.filter((i) => i.status === "critical").length;
  const lowCount = inventory.filter((i) => i.status === "low").length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Inventory</h1>
          <p className="text-muted-foreground">Track and manage your stock levels</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <ShoppingCart className="h-4 w-4" />
            Create Order
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Alert Banner */}
      {criticalCount > 0 && (
        <motion.div
          className="bg-danger/10 border border-danger/20 rounded-lg p-4 flex items-center gap-3"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <AlertTriangle className="h-5 w-5 text-danger" />
          <p className="text-sm text-foreground">
            <strong>{criticalCount} items</strong> are critically low and need immediate attention.
          </p>
          <Button size="sm" variant="outline" className="ml-auto border-danger text-danger hover:bg-danger/10">
            Auto-Order Low Stock
          </Button>
        </motion.div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:border-foreground/20 transition-colors" onClick={() => setFilterStatus(null)}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <Package className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{inventory.length}</p>
                <p className="text-sm text-muted-foreground">Total Products</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer hover:border-warning/50 transition-colors ${filterStatus === "low" ? "border-warning" : ""}`}
          onClick={() => setFilterStatus(filterStatus === "low" ? null : "low")}
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
          onClick={() => setFilterStatus(filterStatus === "critical" ? null : "critical")}
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
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filters
        </Button>
        <Button variant="outline" className="gap-2">
          <ArrowUpDown className="h-4 w-4" />
          Sort
        </Button>
      </div>

      {/* Inventory Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Product</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Category</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Stock</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Min Stock</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map((item, i) => (
                  <motion.tr
                    key={item.id}
                    className="border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <td className="p-4">
                      <p className="font-medium text-foreground">{item.name}</p>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-muted-foreground">{item.category}</span>
                    </td>
                    <td className="p-4">
                      <span className={`font-medium ${item.status === "critical" ? "text-danger" : item.status === "low" ? "text-warning" : "text-foreground"}`}>
                        {item.stock} {item.unit}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-muted-foreground">
                        {item.minStock} {item.unit}
                      </span>
                    </td>
                    <td className="p-4">
                      <Badge variant={statusConfig[item.status].variant}>
                        {statusConfig[item.status].label}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <Button size="sm" variant="ghost">
                        Edit
                      </Button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
