"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Calendar,
  Package,
  UtensilsCrossed,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Bell,
  Building2,
  ChevronDown,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { CartProvider } from "@/context/cart-context";

import { currentUser, currentVenue, venues, alerts } from "@/lib/mock-data";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Calendar, label: "Schedule", href: "/dashboard/schedule" },
  { icon: Package, label: "Inventory", href: "/dashboard/inventory" },
  { icon: UtensilsCrossed, label: "Menu", href: "/dashboard/menu" },
  { icon: Users, label: "Team", href: "/dashboard/team" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

// Desktop Sidebar Component
function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-card border-r border-border transition-all duration-300 hidden lg:flex flex-col",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className={cn("flex items-center gap-3 px-4 py-6 border-b border-border", collapsed && "justify-center")}>
        <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl flex items-center justify-center shrink-0">
          <span className="text-white font-bold">K</span>
        </div>
        {!collapsed && <span className="font-semibold text-lg text-foreground">KesselOps</span>}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto">
        <ul className="space-y-1">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    collapsed && "justify-center"
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Collapse Toggle */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 bg-card border border-border rounded-full p-1 shadow-sm hover:bg-muted transition-colors"
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>

      {/* User Section */}
      <div className={cn("p-4 border-t border-border", collapsed && "flex justify-center")}>
        <div className={cn("flex items-center gap-3", collapsed && "flex-col")}>
          <Avatar fallback={`${currentUser.firstName[0]}${currentUser.lastName[0]}`} />
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate text-foreground">
                {currentUser.firstName} {currentUser.lastName}
              </p>
              <p className="text-xs text-muted-foreground truncate">{currentUser.role}</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

// Top Header Component
function Header({ sidebarCollapsed }: { sidebarCollapsed: boolean }) {
  const [venueDropdownOpen, setVenueDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [criticalItems, setCriticalItems] = useState<any[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  // Fetch critically low stock items
  const fetchCriticalItems = async () => {
    setLoadingNotifications(true);
    try {
      const { inventoryApi } = await import("@/lib/api");
      const lowStockItems = await inventoryApi.getLowStock(1); // venue ID = 1
      // Filter only critically low items (quantityOnHand <= 25% of reorderLevel)
      const critical = lowStockItems?.filter((item: any) => {
        if (!item.reorderLevel) return false;
        const ratio = item.quantityOnHand / item.reorderLevel;
        return ratio <= 0.25;
      }) || [];
      setCriticalItems(critical);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      setCriticalItems([]);
    } finally {
      setLoadingNotifications(false);
    }
  };

  // Load notifications when opened
  const handleNotificationsOpen = (open: boolean) => {
    setNotificationsOpen(open);
    if (open) {
      fetchCriticalItems();
    }
  };

  return (
    <header
      className={cn(
        "fixed top-0 right-0 z-30 h-16 bg-card/80 backdrop-blur-md border-b border-border flex items-center justify-between px-4 lg:px-6 transition-all duration-300",
        sidebarCollapsed ? "lg:left-20" : "lg:left-64",
        "left-0"
      )}
    >
      {/* Mobile Logo */}
      <div className="flex items-center gap-3 lg:hidden">
        <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-violet-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">K</span>
        </div>
        <span className="font-semibold text-foreground">KesselOps</span>
      </div>

      {/* Venue Selector (Desktop) */}
      <div className="hidden lg:block relative">
        <button
          onClick={() => setVenueDropdownOpen(!venueDropdownOpen)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
        >
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium text-foreground">{currentVenue.name}</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </button>

        <AnimatePresence>
          {venueDropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 mt-1 w-64 bg-card border border-border rounded-lg shadow-lg py-2"
            >
              {venues.map((venue) => (
                <button
                  key={venue.id}
                  className={cn(
                    "w-full px-4 py-2 text-left hover:bg-muted transition-colors",
                    venue.id === currentVenue.id && "bg-primary/10"
                  )}
                  onClick={() => setVenueDropdownOpen(false)}
                >
                  <p className="font-medium text-foreground">{venue.name}</p>
                  <p className="text-xs text-muted-foreground">{venue.city}</p>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        <ThemeToggle />

        {/* Notifications */}
        <Popover open={notificationsOpen} onOpenChange={handleNotificationsOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {criticalItems.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-foreground">Notifications</h4>
                {criticalItems.length > 0 && (
                  <span className="text-xs bg-danger/10 text-danger px-2 py-0.5 rounded-full">
                    {criticalItems.length}
                  </span>
                )}
              </div>

              {loadingNotifications ? (
                <div className="py-8 text-center text-muted-foreground text-sm">
                  Loading...
                </div>
              ) : criticalItems.length === 0 ? (
                <div className="py-8 text-center">
                  <AlertTriangle className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" />
                  <p className="text-sm text-muted-foreground">No notifications</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    All inventory levels are healthy
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {criticalItems.map((item: any) => (
                    <Link
                      key={item.id}
                      href="/dashboard/inventory"
                      onClick={() => setNotificationsOpen(false)}
                      className="block p-3 rounded-lg border border-danger/20 bg-danger/5 hover:bg-danger/10 transition-colors"
                    >
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-danger shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {item.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Only {item.quantityOnHand} {item.unit} remaining
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* User (Desktop) */}
        <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-border ml-2">
          <Avatar fallback={`${currentUser.firstName[0]}${currentUser.lastName[0]}`} />
          <div className="hidden xl:block">
            <p className="text-sm font-medium text-foreground">{currentUser.firstName}</p>
          </div>
        </div>

        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}

// Mobile Bottom Tab Bar
function MobileTabBar() {
  const pathname = usePathname();

  const tabItems = [
    { icon: LayoutDashboard, label: "Home", href: "/dashboard" },
    { icon: Calendar, label: "Schedule", href: "/dashboard/schedule" },
    { icon: Package, label: "Stock", href: "/dashboard/inventory" },
    { icon: UtensilsCrossed, label: "Menu", href: "/dashboard/menu" },
    { icon: Users, label: "Team", href: "/dashboard/team" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border lg:hidden">
      <ul className="flex items-center justify-around py-2">
        {tabItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-xs">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

// Main Dashboard Layout
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <CartProvider>
      <div className="min-h-screen bg-background">
        <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <Header sidebarCollapsed={sidebarCollapsed} />

        <main
          className={cn(
            "pt-16 pb-20 lg:pb-6 min-h-screen transition-all duration-300",
            sidebarCollapsed ? "lg:pl-20" : "lg:pl-64"
          )}
        >
          <div className="p-4 lg:p-6">
            {children}
          </div>
        </main>

        <MobileTabBar />
      </div>
    </CartProvider>
  );
}
