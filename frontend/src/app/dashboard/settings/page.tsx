"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Building2,
  User,
  Bell,
  Shield,
  CreditCard,
  HelpCircle,
  ChevronRight,
  Plus,
  Save,
  Loader2,
  MapPin,
  Clock,
  Globe,
  Check,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/lib/auth-context";
import { useVenue } from "@/lib/venue-context";
import { createVenue, updateVenue } from "@/lib/api";
import { toast } from "sonner";

// Settings navigation items (removed "Venue Settings" since it's inline now)
const settingsSections = [
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

const venueTypes = [
  { value: "restaurant", label: "Restaurant" },
  { value: "bar", label: "Bar" },
  { value: "cafe", label: "Café" },
  { value: "club", label: "Club" },
  { value: "hotel", label: "Hotel" },
  { value: "catering", label: "Catering" },
];

export default function SettingsPage() {
  const { user: currentUser } = useAuth();
  const isOwner = currentUser?.role === "OWNER";
  const canSeeAdminSections = ["OWNER", "MANAGER", "CHEF"].includes(currentUser?.role || "");
  const { venues, selectedVenue, setSelectedVenue, refreshVenues } = useVenue();

  // Edit venue form state
  const [venueForm, setVenueForm] = useState({
    name: "",
    address: "",
    city: "",
    type: "",
    timezone: "Europe/Berlin",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Add venue modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newVenueForm, setNewVenueForm] = useState({
    name: "",
    address: "",
    city: "",
    type: "restaurant",
    timezone: "Europe/Berlin",
  });

  // Sync form when selectedVenue loads/changes (fixes empty fields on refresh)
  useEffect(() => {
    if (selectedVenue) {
      setVenueForm({
        name: selectedVenue.name,
        address: selectedVenue.address,
        city: selectedVenue.city,
        type: (selectedVenue.type || "").toLowerCase(),
        timezone: selectedVenue.timezone || "Europe/Berlin",
      });
      setHasChanges(false);
    }
  }, [selectedVenue]);

  // Add useSearchParams hook
  const searchParams = useSearchParams();

  // Auto-open add modal if query param is set
  useEffect(() => {
    if (isOwner && searchParams.get("open") === "add-venue") {
      setAddModalOpen(true);
    }
  }, [isOwner, searchParams]);

  // Update form when venue changes
  const handleVenueSelect = (venue: typeof selectedVenue) => {
    if (!venue) return;
    setSelectedVenue(venue);
    setVenueForm({
      name: venue.name,
      address: venue.address,
      city: venue.city,
      type: (venue.type || "").toLowerCase(),
      timezone: venue.timezone || "Europe/Berlin",
    });
    setHasChanges(false);
  };

  const handleFieldChange = (field: string, value: string) => {
    setVenueForm((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSaveVenue = async () => {
    if (!isOwner) {
      toast.error("Only owners can update venues");
      return;
    }
    if (!selectedVenue) return;
    setIsSaving(true);
    try {
      const res = await updateVenue(selectedVenue.id, venueForm);
      if (res.success) {
        toast.success("Venue updated successfully");
        setHasChanges(false);
        await refreshVenues();
      } else {
        toast.error(res.error || "Failed to update venue");
      }
    } catch {
      toast.error("Failed to update venue");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateVenue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOwner) {
      toast.error("Only owners can create venues");
      return;
    }
    if (!newVenueForm.name || !newVenueForm.address || !newVenueForm.city) {
      toast.error("Please fill in all required fields");
      return;
    }
    setIsCreating(true);
    try {
      const res = await createVenue(newVenueForm);
      if (res.success && res.data) {
        toast.success(`Venue "${res.data.name}" created!`);
        setAddModalOpen(false);
        setNewVenueForm({ name: "", address: "", city: "", type: "restaurant", timezone: "Europe/Berlin" });
        await refreshVenues();
        // Auto-select the new venue
        setSelectedVenue(res.data);
        setVenueForm({
          name: res.data.name,
          address: res.data.address,
          city: res.data.city,
          type: res.data.type,
          timezone: res.data.timezone || "Europe/Berlin",
        });
        setHasChanges(false);
      } else {
        toast.error(res.error || "Failed to create venue");
      }
    } catch {
      toast.error("Failed to create venue");
    } finally {
      setIsCreating(false);
    }
  };

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
              <p className="font-medium text-foreground">Active Venue</p>
              <p className="text-sm text-muted-foreground">
                {selectedVenue?.name || "No venue selected"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {venues.length > 1 && (
                <div className="flex gap-1">
                  {venues.map((v) => (
                    <Button
                      key={v.id}
                      variant={v.id === selectedVenue?.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleVenueSelect(v)}
                      className="text-xs"
                    >
                      {v.id === selectedVenue?.id && <Check className="h-3 w-3 mr-1" />}
                      {v.name}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Venue Information — Editable (privileged only) */}
      {isOwner && (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Venue Information
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => setAddModalOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Add Venue
            </Button>
          </div>
          <CardDescription>
            Edit details for <span className="font-medium text-foreground">{selectedVenue?.name || "your venue"}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedVenue ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                    Venue Name
                  </Label>
                  <Input
                    value={venueForm.name}
                    onChange={(e) => handleFieldChange("name", e.target.value)}
                    placeholder="My Restaurant"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                    Type
                  </Label>
                  <Select
                    value={venueForm.type}
                    onValueChange={(val) => handleFieldChange("type", val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type..." />
                    </SelectTrigger>
                    <SelectContent>
                      {venueTypes.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                    Address
                  </Label>
                  <Input
                    value={venueForm.address}
                    onChange={(e) => handleFieldChange("address", e.target.value)}
                    placeholder="123 Main St"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                    City
                  </Label>
                  <Input
                    value={venueForm.city}
                    onChange={(e) => handleFieldChange("city", e.target.value)}
                    placeholder="Stuttgart"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    Timezone
                  </Label>
                  <Input
                    value={venueForm.timezone}
                    onChange={(e) => handleFieldChange("timezone", e.target.value)}
                    placeholder="Europe/Berlin"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                {hasChanges && (
                  <Badge variant="secondary" className="text-xs bg-amber-500/10 text-amber-400 border-0">
                    Unsaved changes
                  </Badge>
                )}
                <div className="ml-auto">
                  <Button
                    onClick={handleSaveVenue}
                    disabled={!hasChanges || isSaving}
                    className="gap-2"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-3">No venue selected. Create your first venue to get started.</p>
              <Button onClick={() => setAddModalOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Venue
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      )}

      {/* All Settings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {settingsSections
          .filter((section) => canSeeAdminSections || section.title === "Account")
          .map((section, i) => (
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

      {/* Danger Zone (privileged only) */}
      {isOwner && (
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
      )}

      {/* Add Venue Modal */}
      {isOwner && (
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Venue</DialogTitle>
            <DialogDescription>
              Create a new venue for your business
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateVenue} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Venue Name *</Label>
              <Input
                value={newVenueForm.name}
                onChange={(e) => setNewVenueForm({ ...newVenueForm, name: e.target.value })}
                placeholder="My Restaurant"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={newVenueForm.type}
                onValueChange={(val) => setNewVenueForm({ ...newVenueForm, type: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type..." />
                </SelectTrigger>
                <SelectContent>
                  {venueTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Address *</Label>
                <Input
                  value={newVenueForm.address}
                  onChange={(e) => setNewVenueForm({ ...newVenueForm, address: e.target.value })}
                  placeholder="123 Main St"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>City *</Label>
                <Input
                  value={newVenueForm.city}
                  onChange={(e) => setNewVenueForm({ ...newVenueForm, city: e.target.value })}
                  placeholder="Stuttgart"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Timezone</Label>
              <Input
                value={newVenueForm.timezone}
                onChange={(e) => setNewVenueForm({ ...newVenueForm, timezone: e.target.value })}
                placeholder="Europe/Berlin"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating} className="gap-2">
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Create Venue
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      )}
    </div>
  );
}
