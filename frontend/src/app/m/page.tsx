"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UtensilsCrossed,
  Search,
  Leaf,
  Flame,
  Star,
  Clock,
  X,
  Calendar,
  Users,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import { menuItems, currentVenue, reservations } from "@/lib/mock-data";

// Tag icons
const tagIcons: Record<string, React.ReactNode> = {
  Vegan: <Leaf className="h-3 w-3" />,
  Popular: <Flame className="h-3 w-3" />,
  Signature: <Star className="h-3 w-3" />,
  Classic: <Clock className="h-3 w-3" />,
};

// Guest Digital Menu Page (Public)
export default function GuestMenuPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [reservationOpen, setReservationOpen] = useState(false);

  // Get unique categories
  const categories = [...new Set(menuItems.map((item) => item.category))];

  // Filter items
  const availableItems = menuItems.filter((item) => item.available);
  const filteredItems = availableItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !activeCategory || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const selected = menuItems.find((i) => i.id === selectedItem);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/90 backdrop-blur-md border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-foreground">{currentVenue.name}</h1>
              <p className="text-sm text-muted-foreground">{currentVenue.openingHours}</p>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button size="sm" onClick={() => setReservationOpen(true)}>
                <Calendar className="h-4 w-4 mr-2" />
                Reserve
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Pills */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2 -mx-4 px-4">
            <Button
              size="sm"
              variant={activeCategory === null ? "default" : "outline"}
              onClick={() => setActiveCategory(null)}
              className="shrink-0"
            >
              All
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat}
                size="sm"
                variant={activeCategory === cat ? "default" : "outline"}
                onClick={() => setActiveCategory(cat)}
                className="shrink-0"
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>
      </header>

      {/* Menu Grid */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredItems.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setSelectedItem(item.id)}
              className="bg-card border border-border rounded-xl p-4 cursor-pointer hover:border-primary/30 transition-colors"
            >
              <div className="flex justify-between mb-2">
                <h3 className="font-semibold text-foreground">{item.name}</h3>
                <span className="font-bold text-primary">€{item.price.toFixed(2)}</span>
              </div>

              {item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {item.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs gap-1">
                      {tagIcons[tag]}
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <UtensilsCrossed className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No items found</p>
          </div>
        )}
      </main>

      {/* Item Detail Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/80 flex items-end sm:items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              className="bg-card w-full max-w-lg rounded-t-2xl sm:rounded-2xl p-6 max-h-[80vh] overflow-y-auto"
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">{selected.name}</h2>
                  <p className="text-muted-foreground">{selected.category}</p>
                </div>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="p-2 hover:bg-muted rounded-full transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {selected.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {selected.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tagIcons[tag]}
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <span className="text-3xl font-bold text-primary">
                  €{selected.price.toFixed(2)}
                </span>
                <Button size="lg">Order at Bar</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reservation Modal */}
      <AnimatePresence>
        {reservationOpen && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/80 flex items-end sm:items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setReservationOpen(false)}
          >
            <motion.div
              className="bg-card w-full max-w-lg rounded-t-2xl sm:rounded-2xl p-6"
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-foreground">Make a Reservation</h2>
                  <p className="text-muted-foreground">{currentVenue.name}</p>
                </div>
                <button
                  onClick={() => setReservationOpen(false)}
                  className="p-2 hover:bg-muted rounded-full transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Name</label>
                  <Input placeholder="Your name" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground">Date</label>
                    <Input type="date" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Time</label>
                    <Input type="time" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Party Size</label>
                  <Input type="number" placeholder="2" min="1" max="20" />
                </div>
                <Button size="lg" className="w-full">
                  <Calendar className="h-4 w-4 mr-2" />
                  Request Reservation
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center mt-4">
                You will receive a confirmation email once your reservation is approved.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
