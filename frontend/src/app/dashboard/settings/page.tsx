"use client";

import { motion } from "framer-motion";
import {
  Settings,
  Building2,
  User,
  Bell,
  Palette,
  Shield,
  CreditCard,
  HelpCircle,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import { currentVenue, currentUser } from "@/lib/mock-data";

// Settings sections
const settingsSections = [
  {
    icon: Building2,
    title: "Venue Settings",
    description: "Manage venue details, hours, and location",
    href: "/dashboard/settings/venue",
  },
  {
    icon: User,
    title: "Account",
    description: "Update your profile and preferences",
    href: "/dashboard/settings/account",
  },
  {
    icon: Bell,
    title: "Notifications",
    description: "Configure alerts and notification preferences",
    href: "/dashboard/settings/notifications",
  },
  {
    icon: Shield,
    title: "Roles & Permissions",
    description: "Manage team roles and access levels",
    href: "/dashboard/settings/roles",
  },
  {
    icon: CreditCard,
    title: "Billing",
    description: "View invoices and manage subscription",
    href: "/dashboard/settings/billing",
  },
  {
    icon: HelpCircle,
    title: "Help & Support",
    description: "Get help and contact support",
    href: "/dashboard/settings/support",
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your venue and account settings</p>
      </div>

      {/* Quick Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Settings</CardTitle>
          <CardDescription>Frequently used settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Theme</p>
              <p className="text-sm text-muted-foreground">Toggle dark/light mode</p>
            </div>
            <ThemeToggle />
          </div>

          <div className="h-px bg-border" />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Current Venue</p>
              <p className="text-sm text-muted-foreground">{currentVenue.name}</p>
            </div>
            <Button variant="outline" size="sm">Switch</Button>
          </div>
        </CardContent>
      </Card>

      {/* Venue Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Venue Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Venue Name</label>
              <Input defaultValue={currentVenue.name} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Type</label>
              <Input defaultValue={currentVenue.type} className="capitalize" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Address</label>
              <Input defaultValue={currentVenue.address} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Opening Hours</label>
              <Input defaultValue={currentVenue.openingHours} />
            </div>
          </div>
          <Button className="mt-4">Save Changes</Button>
        </CardContent>
      </Card>

      {/* All Settings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {settingsSections.map((section, i) => (
          <motion.div
            key={section.href}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="cursor-pointer hover:border-primary/30 transition-colors group">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-muted rounded-lg">
                    <section.icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                      {section.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">{section.description}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Danger Zone */}
      <Card className="border-danger/30">
        <CardHeader>
          <CardTitle className="text-lg text-danger">Danger Zone</CardTitle>
          <CardDescription>Irreversible and destructive actions</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div>
            <p className="font-medium text-foreground">Delete Venue</p>
            <p className="text-sm text-muted-foreground">
              Permanently delete this venue and all its data
            </p>
          </div>
          <Button variant="outline" className="border-danger text-danger hover:bg-danger/10">
            Delete Venue
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
