"use client";

import { useState, useEffect, useCallback } from "react";
import {
  CheckSquare,
  Clock,
  Calendar,
  Loader2,
  Camera,
  Bot,
  Sparkles,
  Zap
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { useVenue } from "@/lib/venue-context";
import { getTasks, getShifts, updateTaskStatus, type Shift } from "@/lib/api";
import { type Task, priorityConfig, categoryConfig } from "../tasks/task-data";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function TraineeDashboard() {
  const { user } = useAuth();
  const { selectedVenue } = useVenue();
  const router = useRouter();
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
            String(t.assigneeId) === String(user?.id)
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
              String(s.userId) === String(user?.id) &&
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
          {getGreeting()}, {user?.firstName} (Trainee) 👋
        </h1>
        <p className="text-muted-foreground">
          Your learning journey continues today.
        </p>
      </div>

      {/* Today's Shifts */}
      {todayShifts.length > 0 && (
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Today&apos;s Training Shift
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todayShifts.map((shift) => {
              const start = new Date(shift.startTime);
              const end = new Date(shift.endTime);
              return (
                <div key={shift.id} className="flex items-center justify-between">
                    <div>
                        <p className="font-medium text-foreground">
                        {start.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })} – {end.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                        <p className="text-sm text-muted-foreground">{shift.type} Shift</p>
                    </div>
                    <Badge variant="outline" className="bg-primary/5">Active</Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pending Tasks (Standard Work) */}
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
          <CardContent className="pt-6">
            {tasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckSquare className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p>No tasks assigned to you.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingTasks.map((task) => {
                  const pCfg =
                    priorityConfig[task.priority?.toUpperCase() as keyof typeof priorityConfig] ||
                    priorityConfig.MEDIUM;
                  const cCfg =
                    categoryConfig[task.category?.toUpperCase() as keyof typeof categoryConfig] ||
                    categoryConfig.cleaned;

                  return (
                    <div
                      key={task.id}
                      className="group flex items-start gap-3 p-3 rounded-lg border border-border hover:border-primary/20 transition-colors"
                    >
                      <button
                        onClick={() => handleToggleTask(task)}
                        className={`mt-0.5 h-5 w-5 rounded border ${
                          task.status === "DONE"
                            ? "bg-primary border-primary text-primary-foreground"
                            : "border-muted-foreground/30 hover:border-primary"
                        } flex items-center justify-center transition-colors`}
                      >
                        {task.status === "DONE" && (
                          <CheckSquare className="h-3.5 w-3.5" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-medium leading-none ${
                            task.status === "DONE"
                              ? "text-muted-foreground line-through"
                              : "text-foreground"
                          }`}
                        >
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                            {task.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Badge
                            variant="outline"
                            className={`text-[10px] px-1.5 py-0 h-5 gap-1 ${pCfg.color}`}
                          >
                            {pCfg.label}
                          </Badge>
                          {cCfg && (
                            <Badge
                              variant="secondary"
                              className="text-[10px] px-1.5 py-0 h-5"
                            >
                              {cCfg.label}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Mentor / Learning Path Widget (REPLACES STANDARD SUMMARY) */}
        <div className="space-y-6">
             <Card className="bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-transparent border-indigo-500/20">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Bot className="h-5 w-5 text-indigo-500" />
                        AI Mentor
                    </CardTitle>
                    <CardDescription>
                        Your personal assistant is online.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="p-3 bg-background/50 rounded-lg border border-indigo-100 dark:border-indigo-900/50">
                        <p className="text-sm italic text-muted-foreground">
                            &quot;Great job on closing the bar last night! Today, focus on mastering the <b>Margarita</b> recipe. I can quiz you on it later.&quot;
                        </p>
                     </div>
                     <Button className="w-full bg-indigo-600 hover:bg-indigo-700" onClick={() => router.push('/dashboard/learn')}>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Go to Learning Center
                     </Button>
                </CardContent>
             </Card>

             <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Zap className="h-5 w-5 text-yellow-500" />
                        Quick Actions
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/dashboard/handover')}>
                        Submit Handover
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/dashboard/schedule')}>
                        View Schedule
                    </Button>
                </CardContent>
             </Card>
        </div>
      </div>
    </div>
  );
}
