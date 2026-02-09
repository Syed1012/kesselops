"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  UtensilsCrossed,
  Search,
  Plus,
  Edit,
  Trash2,
  Filter,
  Eye,
  EyeOff,
  DollarSign,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { menuItems } from "@/lib/mock-data";

// Calculate profit margin
const getMargin = (price: number, cost: number) => {
  return ((price - cost) / price) * 100;
};

export default function MenuPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  // Get unique categories
  const categories = ["all", ...new Set(menuItems.map((item) => item.category))];

  // Filter items
  const filteredItems = menuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "all" || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  // Stats
  const avgMargin =
    menuItems.reduce((sum, item) => sum + getMargin(item.price, item.cost), 0) / menuItems.length;
  const unavailableCount = menuItems.filter((i) => !i.available).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Menu Management</h1>
          <p className="text-muted-foreground">Manage your menu items, pricing, and availability</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <Sparkles className="h-4 w-4" />
            Generate Description
          </Button>
          <Button className="gap-2">
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
                <p className="text-2xl font-bold text-foreground">{menuItems.length}</p>
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
          <TabsList className="bg-muted">
            {categories.map((cat) => (
              <TabsTrigger key={cat} value={cat} className="capitalize">
                {cat}
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
          {/* Menu Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((item, i) => {
              const margin = getMargin(item.price, item.cost);
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className={`group h-full ${!item.available ? "opacity-60" : ""}`}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">{item.name}</h3>
                          <p className="text-sm text-muted-foreground">{item.category}</p>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="icon" variant="ghost" className="h-8 w-8">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-danger">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Tags */}
                      {item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {item.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Pricing */}
                      <div className="flex items-center justify-between pt-3 border-t border-border">
                        <div>
                          <p className="text-lg font-bold text-foreground">€{item.price.toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">
                            Cost: €{item.cost.toFixed(2)} • {margin.toFixed(0)}% margin
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant={item.available ? "outline" : "default"}
                          className={!item.available ? "bg-danger hover:bg-danger/90" : ""}
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
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
