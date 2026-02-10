"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  Loader2,
  Check,
  ClipboardList,
  Plus,
  GraduationCap,
  ArrowLeftRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/lib/auth-context";
import { VenueProvider, useVenue } from "@/lib/venue-context";
import { GlobalAIMentor } from "@/components/dashboard/ai-mentor";

const allSidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard", allowedRoles: "all" as const },
  { icon: Calendar, label: "Schedule", href: "/dashboard/schedule", allowedRoles: "all" as const },
  { icon: Package, label: "Inventory", href: "/dashboard/inventory", allowedRoles: ["OWNER", "MANAGER", "CHEF"] as const },
  { icon: UtensilsCrossed, label: "Menu", href: "/dashboard/menu", allowedRoles: ["OWNER", "MANAGER", "CHEF"] as const },
  { icon: Users, label: "Team", href: "/dashboard/team", allowedRoles: ["OWNER", "MANAGER", "CHEF"] as const },
  { icon: ClipboardList, label: "Tasks", href: "/dashboard/tasks", allowedRoles: "all" as const },
  { icon: ArrowLeftRight, label: "Handover", href: "/dashboard/handover", allowedRoles: ["STAFF", "TRAINEE", "MANAGER", "CHEF", "OWNER"] as const },
  { icon: GraduationCap, label: "Learn", href: "/dashboard/learn", allowedRoles: ["TRAINEE"] as const },
  { icon: Settings, label: "Settings", href: "/dashboard/settings", allowedRoles: "all" as const },
];

const privilegedRoles = ["OWNER", "MANAGER", "CHEF"];

function getSidebarItems(role: string) {
  // Filter items based on role
  return allSidebarItems.filter((item) => {
    if (item.allowedRoles === "all") return true;
    return (item.allowedRoles as readonly string[]).includes(role);
  });
}

// Desktop Sidebar Component
function Sidebar({ collapsed, onToggle, user, onLogout }: { collapsed: boolean; onToggle: () => void; user: { firstName: string; lastName: string; role: string } | null; onLogout: () => void }) {
  const pathname = usePathname();
  const sidebarItems = getSidebarItems(user?.role || "STAFF");

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
      <div className={cn("p-4 border-t border-border", collapsed && "flex flex-col items-center")}>
        <div className={cn("flex items-center gap-3", collapsed && "flex-col")}>
          <Avatar>
            <AvatarFallback>{user ? `${user.firstName[0]}${user.lastName[0]}` : "?"}</AvatarFallback>
          </Avatar>
          {!collapsed && user && (
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate text-foreground">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-muted-foreground truncate">{user.role}</p>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={onLogout}
              className="p-2 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
        {collapsed && (
          <button
            onClick={onLogout}
            className="mt-2 p-2 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        )}
      </div>
    </aside>
  );
}

// Top Header Component
function Header({ sidebarCollapsed }: { sidebarCollapsed: boolean }) {
  const [venueDropdownOpen, setVenueDropdownOpen] = useState(false);
  const { venues, selectedVenue, setSelectedVenue, isLoading: venueLoading } = useVenue();
  const { user } = useAuth();

  // Close dropdown on outside click
  useEffect(() => {
    if (!venueDropdownOpen) return;
    const handler = () => setVenueDropdownOpen(false);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [venueDropdownOpen]);

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
      <div className="hidden lg:flex items-center gap-2 relative">
        <div className="relative">
          <button
            onClick={(e) => { e.stopPropagation(); setVenueDropdownOpen(!venueDropdownOpen); }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
          >
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-foreground">
              {venueLoading ? "Loading..." : selectedVenue?.name || "No venue"}
            </span>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </button>

          <AnimatePresence>
            {venueDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 mt-1 w-64 bg-card border border-border rounded-lg shadow-lg py-2"
                onClick={(e) => e.stopPropagation()}
              >
                {venues.length === 0 ? (
                  <p className="px-4 py-3 text-sm text-muted-foreground">No venues found</p>
                ) : (
                  venues.map((venue) => (
                    <button
                      key={venue.id}
                      className={cn(
                        "w-full px-4 py-2.5 text-left hover:bg-muted transition-colors flex items-center justify-between",
                        venue.id === selectedVenue?.id && "bg-primary/10"
                      )}
                      onClick={() => {
                        setSelectedVenue(venue);
                        setVenueDropdownOpen(false);
                      }}
                    >
                      <div>
                        <p className="font-medium text-foreground">{venue.name}</p>
                        <p className="text-xs text-muted-foreground">{venue.city}</p>
                      </div>
                      {venue.id === selectedVenue?.id && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </button>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Add Venue Button (Desktop) - Only for privileged roles */}
        {privilegedRoles.includes(user?.role || "") && (
          <div className="relative group">
            <Link href="/dashboard/settings?open=add-venue">
              <button
                className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-primary border border-transparent hover:border-border"
                title="Add new venue"
              >
                <Plus className="h-4 w-4" />
              </button>
            </Link>
            {/* Custom Tooltip */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-md border border-border opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
              Add new venue
            </div>
          </div>
        )}
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        <ThemeToggle />

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}

// Mobile Bottom Tab Bar
function MobileTabBar({ userRole }: { userRole: string }) {
  const pathname = usePathname();

  const allTabItems = [
    { icon: LayoutDashboard, label: "Home", href: "/dashboard", allowedRoles: "all" as const },
    { icon: Calendar, label: "Schedule", href: "/dashboard/schedule", allowedRoles: "all" as const },
    { icon: Package, label: "Inv.", href: "/dashboard/inventory", allowedRoles: ["OWNER", "MANAGER", "CHEF"] as const },
    { icon: Users, label: "Team", href: "/dashboard/team", allowedRoles: ["OWNER", "MANAGER", "CHEF"] as const },
    { icon: ClipboardList, label: "Tasks", href: "/dashboard/tasks", allowedRoles: "all" as const },
    { icon: ArrowLeftRight, label: "H.Over", href: "/dashboard/handover", allowedRoles: ["STAFF", "TRAINEE", "MANAGER", "CHEF", "OWNER"] as const },
    { icon: GraduationCap, label: "Learn", href: "/dashboard/learn", allowedRoles: ["TRAINEE"] as const },
    { icon: Settings, label: "Settings", href: "/dashboard/settings", allowedRoles: "all" as const },
  ];

  const tabItems = allTabItems.filter((item) => {
    if (item.allowedRoles === "all") return true;
    return (item.allowedRoles as readonly string[]).includes(userRole);
  });

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
  const router = useRouter();
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <VenueProvider>
      <div className="min-h-screen bg-background">
        <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} user={user} onLogout={handleLogout} />
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

        <MobileTabBar userRole={user?.role || "STAFF"} />
        <GlobalAIMentor />
      </div>
    </VenueProvider>
  );
}
