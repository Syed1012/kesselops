"use client";

import { useState, useEffect, useCallback } from "react";
import {
  CheckSquare,
  Clock,
  Calendar,
  Loader2,
  Camera,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { useVenue } from "@/lib/venue-context";
import { getTasks, getShifts, updateTaskStatus, type Shift } from "@/lib/api";
import { type Task, priorityConfig, categoryConfig } from "../tasks/task-data";
import { toast } from "sonner";

export default function StaffDashboard() {
  const { user } = useAuth();
  const { selectedVenue } = useVenue();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [todayShifts, setTodayShifts] = useState<Shift[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!selectedVenue) return;
    setIsLoading(true);
    try {
      // Fetch tasks assigned to current user
      const [tasksRes, shiftsRes] = await Promise.all([
        getTasks(selectedVenue.id),
        getShifts(selectedVenue.id),
      ]);

      if (tasksRes.success && tasksRes.data) {
        // Filter tasks assigned to current user (or unassigned)
        const myTasks = tasksRes.data.filter(
          (t: Task) =>
            t.assigneeId === user?.id ||
            (!t.assigneeId && t.status?.toUpperCase() !== "DONE")
        );
        setTasks(myTasks);
      }

      if (shiftsRes.success && shiftsRes.data) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Filter shifts for current user today
        const content = shiftsRes.data.content || shiftsRes.data;
        const myShifts = (Array.isArray(content) ? content : []).filter(
          (s: Shift) => {
            const shiftDate = new Date(s.startTime);
            return (
              s.userId === user?.id &&
              shiftDate >= today &&
              shiftDate < tomorrow
            );
          }
        );
        setTodayShifts(myShifts);
      }
    } catch {
      toast.error("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  }, [selectedVenue, user?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleToggleTask = async (task: Task) => {
    const newStatus = task.status?.toUpperCase() === "DONE" ? "TODO" : "DONE";
    try {
      const res = await updateTaskStatus(task.id, newStatus);
      if (res.success) {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === task.id ? { ...t, status: newStatus } : t
          )
        );
        toast.success(
          newStatus === "DONE" ? "Task completed!" : "Task reopened"
        );
      }
    } catch {
      toast.error("Failed to update task");
    }
  };

  const pendingTasks = tasks.filter((t) => t.status?.toUpperCase() !== "DONE");
  const doneTasks = tasks.filter((t) => t.status?.toUpperCase() === "DONE");

  // Greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {getGreeting()}, {user?.firstName || "there"} 👋
        </h1>
        <p className="text-muted-foreground">
          {todayShifts.length > 0
            ? `You have ${todayShifts.length} shift${todayShifts.length > 1 ? "s" : ""} today`
            : "No shifts scheduled for today"}
        </p>
      </div>

      {/* Today's Shifts */}
      {todayShifts.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Today&apos;s Shifts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {todayShifts.map((shift) => {
              const start = new Date(shift.startTime);
              const end = new Date(shift.endTime);
              const now = new Date();
              const isActive = now >= start && now <= end;

              return (
                <div
                  key={shift.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    isActive
                      ? "bg-primary/5 border-primary/30"
                      : "bg-muted/50 border-border"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Clock className={`h-5 w-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                    <div>
                      <p className="font-medium text-foreground">
                        {start.toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        })}{" "}
                        –{" "}
                        {end.toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {shift.type} shift · {shift.durationHours?.toFixed(1)}h
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isActive && (
                      <Badge className="bg-primary/10 text-primary border-0">
                        Active
                      </Badge>
                    )}
                    {shift.notes && (
                      <span className="text-xs text-muted-foreground max-w-[120px] truncate">
                        {shift.notes}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pending Tasks */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-amber-500" />
              My Tasks
            </CardTitle>
            <CardDescription>
              {pendingTasks.length} pending · {doneTasks.length} done
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pendingTasks.length === 0 && doneTasks.length === 0 ? (
              <div className="text-center py-6">
                <CheckSquare className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No tasks assigned to you
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {pendingTasks.map((task) => {
                  const pCfg =
                    priorityConfig[task.priority?.toUpperCase() as keyof typeof priorityConfig] ||
                    priorityConfig[task.priority?.toLowerCase() as keyof typeof priorityConfig];
                  const cCfg =
                    categoryConfig[task.category?.toUpperCase() as keyof typeof categoryConfig] ||
                    categoryConfig[task.category?.toLowerCase() as keyof typeof categoryConfig];

                  return (
                    <div
                      key={task.id}
                      className="group flex items-start gap-3 p-3 rounded-lg border border-border hover:border-primary/20 transition-colors"
                    >
                      <button
                        onClick={() => handleToggleTask(task)}
                        className="mt-0.5 w-5 h-5 rounded border-2 border-muted-foreground/40 hover:border-primary transition-colors shrink-0 flex items-center justify-center"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground text-sm">
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                            {task.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-1.5">
                          {pCfg && (
                            <Badge
                              variant="outline"
                              className={`text-[10px] px-1.5 py-0 ${pCfg.color}`}
                            >
                              {pCfg.label}
                            </Badge>
                          )}
                          {cCfg && (
                            <Badge
                              variant="outline"
                              className="text-[10px] px-1.5 py-0"
                            >
                              {cCfg.label}
                            </Badge>
                          )}
                          {task.requiresPhoto && (
                            <Camera className="h-3 w-3 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
                    </div>
                  );
                })}

                {/* Completed tasks (collapsed) */}
                {doneTasks.length > 0 && (
                  <div className="pt-2 border-t border-border mt-3">
                    <p className="text-xs text-muted-foreground mb-2">
                      Completed ({doneTasks.length})
                    </p>
                    {doneTasks.slice(0, 3).map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center gap-3 p-2 rounded-lg"
                      >
                        <button
                          onClick={() => handleToggleTask(task)}
                          className="w-5 h-5 rounded bg-primary/20 border-2 border-primary shrink-0 flex items-center justify-center"
                        >
                          <div className="w-2.5 h-2.5 bg-primary rounded-sm" />
                        </button>
                        <span className="text-sm text-muted-foreground line-through">
                          {task.title}
                        </span>
                      </div>
                    ))}
                    {doneTasks.length > 3 && (
                      <p className="text-xs text-muted-foreground pl-8">
                        +{doneTasks.length - 3} more completed
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-muted/50 border border-border text-center">
                <p className="text-2xl font-bold text-foreground">
                  {pendingTasks.length}
                </p>
                <p className="text-xs text-muted-foreground">Pending Tasks</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 border border-border text-center">
                <p className="text-2xl font-bold text-foreground">
                  {doneTasks.length}
                </p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 border border-border text-center">
                <p className="text-2xl font-bold text-foreground">
                  {todayShifts.length}
                </p>
                <p className="text-xs text-muted-foreground">
                  Shifts Today
                </p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 border border-border text-center">
                <p className="text-2xl font-bold text-foreground">
                  {todayShifts.reduce(
                    (acc, s) => acc + (s.durationHours || 0),
                    0
                  ).toFixed(1)}
                  h
                </p>
                <p className="text-xs text-muted-foreground">Hours Today</p>
              </div>
            </div>

            {/* Progress */}
            {tasks.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Task Progress</span>
                  <span className="font-medium text-foreground">
                    {Math.round(
                      (doneTasks.length / tasks.length) * 100
                    )}
                    %
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{
                      width: `${(doneTasks.length / tasks.length) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
