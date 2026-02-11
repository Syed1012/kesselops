"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Users,
  Calendar,
  Loader2,
  Trash2,
  X,
  Save,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { toast } from "sonner";
import {
  getUsers,
  getShifts,
  createShift,
  updateShift,
  deleteShift,
  type User,
  type Shift,
} from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useVenue } from "@/lib/venue-context";

// Timeline hours: 9 AM to 11 PM
const timelineHours = Array.from({ length: 15 }, (_, i) => {
  const hour = i + 9;
  return {
    hour,
    label: hour === 0 ? "12 AM" : hour <= 12 ? `${hour} AM` : `${hour - 12} PM`,
    label24: `${hour.toString().padStart(2, "0")}:00`,
  };
});

// Shift type colors
const shiftTypeColors: Record<string, { bg: string; text: string; border: string; gradient: string }> = {
  MORNING: { bg: "bg-amber-500/20", text: "text-amber-300", border: "border-amber-500/40", gradient: "from-amber-500/30 to-amber-600/20" },
  AFTERNOON: { bg: "bg-blue-500/20", text: "text-blue-300", border: "border-blue-500/40", gradient: "from-blue-500/30 to-blue-600/20" },
  EVENING: { bg: "bg-purple-500/20", text: "text-purple-300", border: "border-purple-500/40", gradient: "from-purple-500/30 to-purple-600/20" },
  NIGHT: { bg: "bg-slate-500/20", text: "text-slate-300", border: "border-slate-500/40", gradient: "from-slate-500/30 to-slate-600/20" },
};

// Shift type time presets
const shiftPresets: Record<string, { start: string; end: string; label: string }> = {
  MORNING: { start: "09:00", end: "14:00", label: "Morning" },
  AFTERNOON: { start: "14:00", end: "20:00", label: "Afternoon" },
  EVENING: { start: "18:00", end: "23:00", label: "Evening" },
  NIGHT: { start: "20:00", end: "23:00", label: "Night" },
};

// Role badge colors
const roleColors: Record<string, string> = {
  MANAGER: "bg-blue-500/20 text-blue-300",
  CHEF: "bg-orange-500/20 text-orange-300",
  STAFF: "bg-green-500/20 text-green-300",
  TRAINEE: "bg-yellow-500/20 text-yellow-300",
};

// Days of the week
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const getLocalDateInputValue = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function SchedulePage() {
  const { user: currentUser } = useAuth();
  const { selectedVenue } = useVenue();
  const isPrivileged = ["OWNER", "MANAGER", "CHEF"].includes(currentUser?.role || "");
  const [currentWeek, setCurrentWeek] = useState(0);
  const [staff, setStaff] = useState<User[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [editingShiftId, setEditingShiftId] = useState<number | null>(null);

  // Create Shift Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [shiftForm, setShiftForm] = useState({
    userId: "",
    date: "",
    type: "EVENING" as "MORNING" | "AFTERNOON" | "EVENING" | "NIGHT",
    startTime: "18:00",
    endTime: "23:00",
    notes: "",
  });

  // Calculate week dates
  const getWeekDates = useCallback(() => {
    const today = new Date();
    const startOfWeek = new Date(today);
    const dayOfWeek = today.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    startOfWeek.setDate(today.getDate() + diff + currentWeek * 7);

    return days.map((_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      return {
        day: days[i],
        date: date.getDate(),
        month: date.toLocaleDateString("en-US", { month: "short" }),
        fullDate: date.toISOString().split("T")[0],
        isToday: date.toDateString() === today.toDateString(),
        dateObj: date,
      };
    });
  }, [currentWeek]);

  const weekDates = useMemo(() => getWeekDates(), [getWeekDates]);

  const loadData = useCallback(async () => {
    if (!selectedVenue?.id) {
      setStaff([]);
      setShifts([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const staffRes = await getUsers(selectedVenue.id);
      if (staffRes.success && staffRes.data) {
        setStaff(staffRes.data);
      }

      const from = weekDates[0].dateObj.toISOString();
      const to = new Date(weekDates[6].dateObj.getTime() + 24 * 60 * 60 * 1000).toISOString();
      const shiftsRes = await getShifts(selectedVenue.id, from, to);
      if (shiftsRes.success && shiftsRes.data) {
        setShifts(shiftsRes.data.content || []);
      }
    } catch {
      toast.error("Failed to load schedule data");
    } finally {
      setIsLoading(false);
    }
  }, [selectedVenue?.id, weekDates]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Get shift position on timeline for a given day column
  const getShiftPosition = (shift: Shift) => {
    const start = new Date(shift.startTime);
    const end = new Date(shift.endTime);

    // Start hour relative to 9 AM
    let startHour = start.getHours() + start.getMinutes() / 60;
    let endHour = end.getHours() + end.getMinutes() / 60;

    // Clamp to 9-23 timeline range
    if (startHour < 9) startHour = 9;
    if (endHour > 23) endHour = 23;
    if (endHour <= startHour) endHour = startHour + 1;

    const topPercent = ((startHour - 9) / 14) * 100;
    const heightPercent = ((endHour - startHour) / 14) * 100;

    return { top: `${topPercent}%`, height: `${Math.max(heightPercent, 3)}%` };
  };

  // Get which day column a shift belongs to
  const getShiftDay = (shift: Shift): string => {
    return new Date(shift.startTime).toISOString().split("T")[0];
  };

  const handleSubmitShift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVenue?.id) {
      toast.error("No venue selected");
      return;
    }
    if (!editingShiftId && !shiftForm.userId) {
      toast.error("Please select a staff member");
      return;
    }
    setIsCreating(true);

    try {
      const [startHour, startMin] = shiftForm.startTime.split(":").map(Number);
      const [endHour, endMin] = shiftForm.endTime.split(":").map(Number);

      const startDate = new Date(shiftForm.date);
      startDate.setHours(startHour, startMin, 0, 0);

      const endDate = new Date(shiftForm.date);
      endDate.setHours(endHour, endMin, 0, 0);

      if (endDate <= startDate) {
        endDate.setDate(endDate.getDate() + 1);
      }

      if (editingShiftId) {
        // Update existing shift
        const response = await updateShift(editingShiftId, {
          startTime: startDate.toISOString(),
          endTime: endDate.toISOString(),
          type: shiftForm.type,
          notes: shiftForm.notes || undefined,
        });
        if (response.success) {
          toast.success("Shift updated!");
          setCreateModalOpen(false);
          setEditingShiftId(null);
          resetForm();
          loadData();
        } else {
          toast.error(response.error || "Failed to update shift");
        }
      } else {
        // Create new shift
        const response = await createShift({
          venueId: selectedVenue.id,
          userId: parseInt(shiftForm.userId),
          startTime: startDate.toISOString(),
          endTime: endDate.toISOString(),
          type: shiftForm.type,
          notes: shiftForm.notes || undefined,
        });
        if (response.success) {
          toast.success("Shift created!");
          setCreateModalOpen(false);
          resetForm();
          loadData();
        } else {
          toast.error(response.error || "Failed to create shift");
        }
      }
    } catch {
      toast.error(editingShiftId ? "Failed to update shift" : "Failed to create shift");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteShift = async () => {
    if (!selectedShift) return;
    setIsDeleting(true);
    try {
      const response = await deleteShift(selectedShift.id);
      if (response.success) {
        toast.success("Shift deleted");
        setDetailsModalOpen(false);
        setSelectedShift(null);
        loadData();
      } else {
        toast.error(response.error || "Failed to delete shift");
      }
    } catch {
      toast.error("Failed to delete shift");
    } finally {
      setIsDeleting(false);
    }
  };

  const openEditShift = (shift: Shift) => {
    const start = new Date(shift.startTime);
    const end = new Date(shift.endTime);
    setEditingShiftId(shift.id);
    setShiftForm({
      userId: String(shift.userId || ""),
      date: start.toISOString().split("T")[0],
      type: shift.type,
      startTime: `${String(start.getHours()).padStart(2, "0")}:${String(start.getMinutes()).padStart(2, "0")}`,
      endTime: `${String(end.getHours()).padStart(2, "0")}:${String(end.getMinutes()).padStart(2, "0")}`,
      notes: shift.notes || "",
    });
    setDetailsModalOpen(false);
    setCreateModalOpen(true);
  };

  const handleShiftTypeChange = (type: string) => {
    const preset = shiftPresets[type];
    setShiftForm({
      ...shiftForm,
      type: type as typeof shiftForm.type,
      startTime: preset.start,
      endTime: preset.end,
    });
  };

  const resetForm = () => {
    setEditingShiftId(null);
    setShiftForm({
      userId: "",
      date: "",
      type: "EVENING",
      startTime: "18:00",
      endTime: "23:00",
      notes: "",
    });
  };

  const openCreateModal = (date?: string, userId?: string) => {
    setEditingShiftId(null);
    setShiftForm({
      ...shiftForm,
      date: date || getLocalDateInputValue(new Date()),
      userId: userId || "",
    });
    setCreateModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Shift Schedule</h1>
          <p className="text-muted-foreground">
            Plan and manage your team&apos;s shifts
          </p>
        </div>
        {isPrivileged && (
          <div className="flex items-center gap-2">
            <Button className="gap-2" onClick={() => openCreateModal()}>
              <Plus className="h-4 w-4" />
              Create Shift
            </Button>
          </div>
        )}
      </div>

      {/* Week Navigation */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentWeek(currentWeek - 1)}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="text-center">
              <h2 className="text-lg font-semibold text-foreground">
                {weekDates[0].month} {weekDates[0].date} &ndash;{" "}
                {weekDates[6].month} {weekDates[6].date}
              </h2>
              <p className="text-sm text-muted-foreground">
                {currentWeek === 0
                  ? "This Week"
                  : currentWeek > 0
                  ? `+${currentWeek} weeks`
                  : `${currentWeek} weeks`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {currentWeek !== 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentWeek(0)}
                >
                  Today
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentWeek(currentWeek + 1)}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Staff Legend */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm text-muted-foreground">Staff:</span>
            {staff.map((member) => (
              <Badge
                key={member.id}
                variant="secondary"
                className={`${roleColors[member.role] || "bg-muted text-muted-foreground"} text-xs`}
              >
                {member.firstName} {member.lastName[0]}.
              </Badge>
            ))}
          </div>

          {/* Timeline Schedule Grid */}
          <Card className="overflow-hidden">
            <CardContent className="p-0 overflow-x-auto">
              <div className="min-w-[800px]">
                {/* Header: Time | Mon | Tue | ... | Sun */}
                <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-border sticky top-0 bg-card z-10">
                  <div className="p-3 border-r border-border bg-muted/30">
                    <Clock className="h-4 w-4 text-muted-foreground mx-auto" />
                  </div>
                  {weekDates.map((d, i) => (
                    <div
                      key={i}
                      className={`p-3 text-center border-r last:border-r-0 border-border ${
                        d.isToday ? "bg-primary/10" : ""
                      }`}
                    >
                      <p className="text-xs text-muted-foreground uppercase">
                        {d.day}
                      </p>
                      <p
                        className={`text-lg font-semibold ${
                          d.isToday ? "text-primary" : "text-foreground"
                        }`}
                      >
                        {d.date}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Timeline Grid: Time labels on left, day columns with shift blocks */}
                <div className="grid grid-cols-[60px_repeat(7,1fr)] relative">
                  {/* Time Labels Column */}
                  <div className="border-r border-border">
                    {timelineHours.map((t, i) => (
                      <div
                        key={i}
                        className="h-12 border-b border-border flex items-start justify-end pr-2 pt-0.5"
                      >
                        <span className="text-xs text-muted-foreground font-mono">
                          {t.label}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Day Columns with shift blocks */}
                  {weekDates.map((d, dayIndex) => (
                    <div
                      key={dayIndex}
                      className={`relative border-r last:border-r-0 border-border ${
                        d.isToday ? "bg-primary/5" : ""
                      }`}
                      onClick={() => {
                        if (isPrivileged) {
                          openCreateModal(d.fullDate);
                        }
                      }}
                    >
                      {/* Hour grid lines */}
                      {timelineHours.map((_, i) => (
                        <div
                          key={i}
                          className="h-12 border-b border-border hover:bg-muted/10 transition-colors cursor-pointer"
                        />
                      ))}

                      {/* Shift blocks overlaid - with overlap handling */}
                      {(() => {
                        const dayShifts = shifts.filter(
                          (s) => getShiftDay(s) === d.fullDate
                        );

                        // Calculate overlap columns for side-by-side rendering
                        // Sort by start time
                        const sorted = [...dayShifts].sort(
                          (a, b) =>
                            new Date(a.startTime).getTime() -
                            new Date(b.startTime).getTime()
                        );

                        // Assign column index & total columns for each shift
                        const layout: Map<
                          number,
                          { colIndex: number; totalCols: number }
                        > = new Map();

                        // Track which columns are occupied at each point
                        const columns: { endTime: number; shiftId: number }[] =
                          [];

                        for (const shift of sorted) {
                          const shiftStart = new Date(
                            shift.startTime
                          ).getTime();
                          const shiftEnd = new Date(shift.endTime).getTime();

                          // Find the first available column
                          let placed = false;
                          for (let c = 0; c < columns.length; c++) {
                            if (columns[c].endTime <= shiftStart) {
                              // This column is free
                              columns[c] = {
                                endTime: shiftEnd,
                                shiftId: shift.id,
                              };
                              layout.set(shift.id, {
                                colIndex: c,
                                totalCols: 0,
                              }); // totalCols set later
                              placed = true;
                              break;
                            }
                          }
                          if (!placed) {
                            // Need a new column
                            layout.set(shift.id, {
                              colIndex: columns.length,
                              totalCols: 0,
                            });
                            columns.push({
                              endTime: shiftEnd,
                              shiftId: shift.id,
                            });
                          }
                        }

                        // Now determine totalCols for each shift by finding
                        // how many concurrent shifts overlap with it
                        for (const shift of sorted) {
                          const shiftStart = new Date(
                            shift.startTime
                          ).getTime();
                          const shiftEnd = new Date(shift.endTime).getTime();

                          let maxConcurrent = 1;
                          for (const other of sorted) {
                            if (other.id === shift.id) continue;
                            const otherStart = new Date(
                              other.startTime
                            ).getTime();
                            const otherEnd = new Date(
                              other.endTime
                            ).getTime();

                            // Check overlap
                            if (otherStart < shiftEnd && otherEnd > shiftStart) {
                              maxConcurrent++;
                            }
                          }

                          const info = layout.get(shift.id)!;
                          info.totalCols = Math.max(
                            maxConcurrent,
                            info.colIndex + 1
                          );
                        }

                        return sorted.map((shift) => {
                          const pos = getShiftPosition(shift);
                          const colors =
                            shiftTypeColors[shift.type] ||
                            shiftTypeColors.EVENING;
                          const member = staff.find(
                            (m) => m.id === shift.userId
                          );
                          const startTime = new Date(
                            shift.startTime
                          ).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          });
                          const endTime = new Date(
                            shift.endTime
                          ).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          });

                          const info = layout.get(shift.id) || {
                            colIndex: 0,
                            totalCols: 1,
                          };
                          const widthPercent = 100 / info.totalCols;
                          const leftPercent = info.colIndex * widthPercent;

                          return (
                            <motion.div
                              key={shift.id}
                              className={`absolute rounded-md border ${colors.border} bg-gradient-to-b ${colors.gradient} backdrop-blur-sm cursor-pointer overflow-hidden group z-10`}
                              style={{
                                top: pos.top,
                                height: pos.height,
                                minHeight: "28px",
                                left: `calc(${leftPercent}% + 2px)`,
                                width: `calc(${widthPercent}% - 4px)`,
                              }}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              whileHover={{ scale: 1.02, zIndex: 20 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedShift(shift);
                                setDetailsModalOpen(true);
                              }}
                            >
                              <div className="p-1 h-full flex flex-col justify-between overflow-hidden">
                                <div className="min-w-0">
                                  <p
                                    className={`text-[11px] font-semibold ${colors.text} truncate`}
                                  >
                                    {member
                                      ? `${member.firstName} ${member.lastName[0]}.`
                                      : "Unassigned"}
                                  </p>
                                  <p className="text-[10px] text-muted-foreground truncate">
                                    {startTime} – {endTime}
                                  </p>
                                </div>
                                {isPrivileged && (
                                  <div className="hidden group-hover:flex items-center gap-1 text-red-400 text-[10px]">
                                    <Trash2 className="h-3 w-3" />
                                    Delete
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          );
                        });
                      })()}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/10 rounded-lg">
                    <Users className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {staff.length}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Team Members
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-500/10 rounded-lg">
                    <Clock className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {shifts.length}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Shifts This Week
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-500/10 rounded-lg">
                    <Calendar className="h-6 w-6 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total Hours
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {shifts
                        .reduce((sum, s) => sum + (s.durationHours || 0), 0)
                        .toFixed(1)}
                      h
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Create/Edit Shift Modal */}
      <Dialog open={createModalOpen} onOpenChange={(open) => { setCreateModalOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingShiftId ? "Edit Shift" : "Create Shift"}</DialogTitle>
            <DialogDescription>
              {editingShiftId ? "Update the shift details" : "Assign a shift to a team member"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitShift} className="space-y-4 py-2">
            {/* Staff Member - read-only when editing */}
            {!editingShiftId ? (
              <div className="space-y-2">
                <Label>Staff Member</Label>
                <Select
                  value={shiftForm.userId}
                  onValueChange={(val) =>
                    setShiftForm({ ...shiftForm, userId: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select team member..." />
                  </SelectTrigger>
                  <SelectContent>
                    {staff.map((member) => (
                      <SelectItem key={member.id} value={String(member.id)}>
                        {member.firstName} {member.lastName} &middot;{" "}
                        {member.role.toLowerCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Staff Member</Label>
                <div className="p-2.5 rounded-md bg-muted text-sm text-foreground">
                  {(() => {
                    const m = staff.find(s => String(s.id) === shiftForm.userId);
                    return m ? `${m.firstName} ${m.lastName}` : "Staff member";
                  })()}
                </div>
              </div>
            )}

            {/* Date */}
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={shiftForm.date}
                onChange={(e) =>
                  setShiftForm({ ...shiftForm, date: e.target.value })
                }
                required
              />
            </div>

            {/* Shift Type */}
            <div className="space-y-2">
              <Label>Shift Type</Label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(shiftPresets).map(([type, preset]) => {
                  const colors = shiftTypeColors[type];
                  const isSelected = shiftForm.type === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleShiftTypeChange(type)}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        isSelected
                          ? `${colors.bg} ${colors.border} border-2`
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <p
                        className={`text-sm font-medium ${
                          isSelected ? colors.text : "text-foreground"
                        }`}
                      >
                        {preset.label}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {preset.start} – {preset.end}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Override */}
            <div className="space-y-2">
              <Label>Custom Time</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="time"
                  value={shiftForm.startTime}
                  onChange={(e) =>
                    setShiftForm({ ...shiftForm, startTime: e.target.value })
                  }
                  className="flex-1"
                />
                <span className="text-muted-foreground text-sm">to</span>
                <Input
                  type="time"
                  value={shiftForm.endTime}
                  onChange={(e) =>
                    setShiftForm({ ...shiftForm, endTime: e.target.value })
                  }
                  className="flex-1"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>Notes</Label>
              <Input
                placeholder="VIP event, training session..."
                value={shiftForm.notes}
                onChange={(e) =>
                  setShiftForm({ ...shiftForm, notes: e.target.value })
                }
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isCreating || !shiftForm.date || (!editingShiftId && !shiftForm.userId)}
                className="gap-2"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {editingShiftId ? "Saving..." : "Creating..."}
                  </>
                ) : (
                  <>
                    {editingShiftId ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    {editingShiftId ? "Save Changes" : "Create Shift"}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Shift Details Modal */}
      <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Shift Details</DialogTitle>
            <DialogDescription>
              {selectedShift && (() => {
                const member = staff.find((m) => m.id === selectedShift.userId);
                const start = new Date(selectedShift.startTime);
                const end = new Date(selectedShift.endTime);
                return (
                  <>
                    <span className="font-medium text-foreground">
                      {member
                        ? `${member.firstName} ${member.lastName}`
                        : "Unassigned"}
                    </span>
                    {" · "}
                    {start.toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                    {" · "}
                    {start.toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })}
                    {" – "}
                    {end.toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })}
                  </>
                );
              })()}
            </DialogDescription>
          </DialogHeader>

          {selectedShift && (
            <div className="space-y-3 py-2">
              <div className="flex items-center gap-2">
                <Badge
                  className={`${shiftTypeColors[selectedShift.type]?.bg} ${shiftTypeColors[selectedShift.type]?.text} border-0`}
                >
                  {selectedShift.type}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {selectedShift.durationHours?.toFixed(1)}h
                </span>
              </div>
              {selectedShift.notes && (
                <p className="text-sm text-muted-foreground">
                  {selectedShift.notes}
                </p>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDetailsModalOpen(false)}
            >
              Close
            </Button>
            {selectedShift && isPrivileged && (
              <>
                <Button
                  variant="outline"
                  onClick={() => openEditShift(selectedShift)}
                  className="gap-2"
                >
                  <Save className="h-4 w-4" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteShift}
                  disabled={isDeleting}
                  className="gap-2"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </>
                  )}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
