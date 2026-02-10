"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
  Calendar,
  User as UserIcon,
  Sparkles,
  Loader2,
  Trash2,
  ChevronDown,
  Tag,
  MoreVertical,
  ClipboardList,
  ArrowUp,
  ArrowRight,
  ArrowDown,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { getUsers, type User } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

// ─── Types ────────────────────────────────────────────────
type Priority = "urgent" | "high" | "medium" | "low";
type TaskStatus = "todo" | "in_progress" | "done";
type TaskCategory = "opening" | "closing" | "cleaning" | "inventory" | "service" | "kitchen" | "custom";

interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: TaskStatus;
  category: TaskCategory;
  assigneeId: number | null;
  assigneeName: string;
  dueDate: string;
  createdAt: string;
  createdBy: string;
  isAiGenerated: boolean;
}

// ─── Config ───────────────────────────────────────────────
const priorityConfig: Record<Priority, { label: string; color: string; icon: React.ReactNode }> = {
  urgent: { label: "Urgent", color: "text-red-500 bg-red-500/10 border-red-500/20", icon: <AlertCircle className="h-3.5 w-3.5" /> },
  high: { label: "High", color: "text-orange-500 bg-orange-500/10 border-orange-500/20", icon: <ArrowUp className="h-3.5 w-3.5" /> },
  medium: { label: "Medium", color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20", icon: <ArrowRight className="h-3.5 w-3.5" /> },
  low: { label: "Low", color: "text-blue-500 bg-blue-500/10 border-blue-500/20", icon: <ArrowDown className="h-3.5 w-3.5" /> },
};

const statusConfig: Record<TaskStatus, { label: string; color: string; icon: React.ReactNode }> = {
  todo: { label: "To Do", color: "text-slate-400 bg-slate-500/10", icon: <Circle className="h-4 w-4" /> },
  in_progress: { label: "In Progress", color: "text-blue-400 bg-blue-500/10", icon: <Clock className="h-4 w-4" /> },
  done: { label: "Done", color: "text-green-400 bg-green-500/10", icon: <CheckCircle2 className="h-4 w-4" /> },
};

const categoryConfig: Record<TaskCategory, { label: string; emoji: string }> = {
  opening: { label: "Opening", emoji: "🌅" },
  closing: { label: "Closing", emoji: "🌙" },
  cleaning: { label: "Cleaning", emoji: "🧹" },
  inventory: { label: "Inventory", emoji: "📦" },
  service: { label: "Service", emoji: "🍽️" },
  kitchen: { label: "Kitchen", emoji: "👨‍🍳" },
  custom: { label: "Custom", emoji: "📌" },
};

const AI_TASK_TEMPLATES: Record<string, { title: string; description: string; category: TaskCategory; priority: Priority }[]> = {
  opening: [
    { title: "Turn on all lights and signage", description: "Ensure all interior and exterior lighting and signage are switched on.", category: "opening", priority: "high" },
    { title: "Check reservation list", description: "Review tonight's reservations and prepare seating arrangements.", category: "opening", priority: "high" },
    { title: "Set up POS systems", description: "Boot up all point-of-sale terminals and verify connectivity.", category: "opening", priority: "urgent" },
    { title: "Prep garnish station", description: "Cut fresh garnishes, refill ice wells, and stock napkins.", category: "opening", priority: "medium" },
    { title: "Inspect restrooms", description: "Check restrooms for cleanliness, stock soap and paper towels.", category: "opening", priority: "medium" },
  ],
  closing: [
    { title: "Cash out all registers", description: "Run end-of-day reports and reconcile cash drawers.", category: "closing", priority: "urgent" },
    { title: "Clean and sanitize all surfaces", description: "Wipe down bar tops, tables, and prep areas with sanitizer.", category: "closing", priority: "high" },
    { title: "Restock fridges for next day", description: "Check fridge inventory and restock beers, wines, and mixers.", category: "closing", priority: "medium" },
    { title: "Take out trash and recycling", description: "Empty all bins, replace liners, and take waste to dumpster.", category: "closing", priority: "high" },
    { title: "Lock all entry points", description: "Secure all doors, windows, and activate alarm system.", category: "closing", priority: "urgent" },
  ],
  cleaning: [
    { title: "Deep clean espresso machine", description: "Run backflush cycle, clean group heads and steam wands.", category: "cleaning", priority: "medium" },
    { title: "Mop all floor areas", description: "Sweep and mop front of house and kitchen floors.", category: "cleaning", priority: "high" },
    { title: "Clean glass washer", description: "Empty, clean, and sanitize the glass washing machine.", category: "cleaning", priority: "medium" },
  ],
  inventory: [
    { title: "Count spirits inventory", description: "Perform a full count of all spirits and update the stock sheet.", category: "inventory", priority: "medium" },
    { title: "Check expiry dates", description: "Review perishable items for upcoming expiry dates.", category: "inventory", priority: "high" },
    { title: "Submit supplier order", description: "Review low-stock items and place orders with suppliers.", category: "inventory", priority: "high" },
  ],
};

// ─── Storage Key ──────────────────────────────────────────
const TASKS_STORAGE_KEY = "kesselops_tasks";

function loadTasks(): Task[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(TASKS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveTasks(tasks: Task[]) {
  localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
}

// ─── Main Page ────────────────────────────────────────────
export default function TasksPage() {
  const { user: currentUser } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [staff, setStaff] = useState<User[]>([]);
  const [isLoadingStaff, setIsLoadingStaff] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<TaskStatus | "all">("all");
  const [filterPriority, setFilterPriority] = useState<Priority | "all">("all");
  const [filterCategory, setFilterCategory] = useState<TaskCategory | "all">("all");

  // Create task modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    priority: "medium" as Priority,
    category: "custom" as TaskCategory,
    assigneeId: "" as string,
    dueDate: new Date().toISOString().split("T")[0],
  });

  // AI Assist modal
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiCategory, setAiCategory] = useState<string>("opening");
  const [aiSelectedTasks, setAiSelectedTasks] = useState<Set<number>>(new Set());
  const [isGenerating, setIsGenerating] = useState(false);

  // Detail / action dropdown
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Load tasks from localStorage
  useEffect(() => {
    setTasks(loadTasks());
  }, []);

  // Load staff
  useEffect(() => {
    (async () => {
      try {
        const res = await getUsers();
        if (res.success && res.data) {
          setStaff(res.data);
        }
      } catch { /* ignore */ }
      finally { setIsLoadingStaff(false); }
    })();
  }, []);

  // Persist tasks on change
  useEffect(() => {
    if (tasks.length > 0) saveTasks(tasks);
  }, [tasks]);

  // ─── Handlers ─────────────────────────────────────────
  const handleCreateTask = () => {
    if (!taskForm.title.trim()) {
      toast.error("Task title is required");
      return;
    }
    setIsCreating(true);

    const assignee = staff.find((s) => String(s.id) === taskForm.assigneeId);
    const newTask: Task = {
      id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: taskForm.title.trim(),
      description: taskForm.description.trim(),
      priority: taskForm.priority,
      status: "todo",
      category: taskForm.category,
      assigneeId: assignee ? assignee.id : null,
      assigneeName: assignee ? `${assignee.firstName} ${assignee.lastName}` : "Unassigned",
      dueDate: taskForm.dueDate,
      createdAt: new Date().toISOString(),
      createdBy: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : "Unknown",
      isAiGenerated: false,
    };

    setTasks((prev) => [newTask, ...prev]);
    setCreateModalOpen(false);
    setTaskForm({
      title: "",
      description: "",
      priority: "medium",
      category: "custom",
      assigneeId: "",
      dueDate: new Date().toISOString().split("T")[0],
    });
    setIsCreating(false);
    toast.success("Task created successfully");
  };

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
    setOpenMenuId(null);
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => {
      const updated = prev.filter((t) => t.id !== taskId);
      saveTasks(updated);
      return updated;
    });
    setOpenMenuId(null);
    toast.success("Task deleted");
  };

  const handleAiGenerate = () => {
    if (aiSelectedTasks.size === 0) {
      toast.error("Select at least one task to add");
      return;
    }
    setIsGenerating(true);

    const templates = AI_TASK_TEMPLATES[aiCategory] || [];
    const newTasks: Task[] = [];

    aiSelectedTasks.forEach((idx) => {
      const template = templates[idx];
      if (template) {
        newTasks.push({
          id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          title: template.title,
          description: template.description,
          priority: template.priority,
          status: "todo",
          category: template.category,
          assigneeId: null,
          assigneeName: "Unassigned",
          dueDate: new Date().toISOString().split("T")[0],
          createdAt: new Date().toISOString(),
          createdBy: "AI Assistant",
          isAiGenerated: true,
        });
      }
    });

    setTimeout(() => {
      setTasks((prev) => [...newTasks, ...prev]);
      setAiModalOpen(false);
      setAiSelectedTasks(new Set());
      setIsGenerating(false);
      toast.success(`${newTasks.length} task${newTasks.length > 1 ? "s" : ""} generated by AI`);
    }, 800);
  };

  // ─── Filters ──────────────────────────────────────────
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (filterStatus !== "all" && task.status !== filterStatus) return false;
      if (filterPriority !== "all" && task.priority !== filterPriority) return false;
      if (filterCategory !== "all" && task.category !== filterCategory) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          task.title.toLowerCase().includes(q) ||
          task.assigneeName.toLowerCase().includes(q) ||
          task.description.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [tasks, filterStatus, filterPriority, filterCategory, searchQuery]);

  // ─── Stats ────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = tasks.length;
    const todo = tasks.filter((t) => t.status === "todo").length;
    const inProgress = tasks.filter((t) => t.status === "in_progress").length;
    const done = tasks.filter((t) => t.status === "done").length;
    const urgent = tasks.filter((t) => t.priority === "urgent" && t.status !== "done").length;
    return { total, todo, inProgress, done, urgent };
  }, [tasks]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tasks</h1>
          <p className="text-muted-foreground">Create, assign, and track tasks for your team</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setAiModalOpen(true)}
          >
            <Sparkles className="h-4 w-4 text-violet-500" />
            AI Assist
          </Button>
          <Button
            className="gap-2"
            onClick={() => setCreateModalOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Create Task
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "Total", value: stats.total, icon: <ClipboardList className="h-4 w-4" />, color: "text-foreground" },
          { label: "To Do", value: stats.todo, icon: <Circle className="h-4 w-4" />, color: "text-slate-400" },
          { label: "In Progress", value: stats.inProgress, icon: <Clock className="h-4 w-4" />, color: "text-blue-400" },
          { label: "Done", value: stats.done, icon: <CheckCircle2 className="h-4 w-4" />, color: "text-green-400" },
          { label: "Urgent", value: stats.urgent, icon: <AlertCircle className="h-4 w-4" />, color: "text-red-400" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-4 pb-3 px-4">
              <div className="flex items-center gap-2">
                <div className={stat.color}>{stat.icon}</div>
                <div>
                  <p className="text-xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks, assignees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as TaskStatus | "all")}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="todo">To Do</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="done">Done</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterPriority} onValueChange={(v) => setFilterPriority(v as Priority | "all")}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterCategory} onValueChange={(v) => setFilterCategory(v as TaskCategory | "all")}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {Object.entries(categoryConfig).map(([key, cfg]) => (
                <SelectItem key={key} value={key}>
                  {cfg.emoji} {cfg.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <ClipboardList className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">
              {tasks.length === 0 ? "No tasks yet" : "No matching tasks"}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {tasks.length === 0
                ? "Create your first task or use AI Assist to generate tasks automatically."
                : "Try adjusting your filters or search query."}
            </p>
            {tasks.length === 0 && (
              <div className="flex items-center justify-center gap-2">
                <Button variant="outline" className="gap-2" onClick={() => setAiModalOpen(true)}>
                  <Sparkles className="h-4 w-4 text-violet-500" />
                  AI Assist
                </Button>
                <Button className="gap-2" onClick={() => setCreateModalOpen(true)}>
                  <Plus className="h-4 w-4" />
                  Create Task
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredTasks.map((task, i) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Card
                className={`group transition-all hover:border-primary/20 ${
                  task.status === "done" ? "opacity-60" : ""
                }`}
              >
                <CardContent className="py-4 px-4">
                  <div className="flex items-start gap-3">
                    {/* Status Toggle */}
                    <button
                      onClick={() => {
                        const cycle: TaskStatus[] = ["todo", "in_progress", "done"];
                        const nextIdx = (cycle.indexOf(task.status) + 1) % cycle.length;
                        handleStatusChange(task.id, cycle[nextIdx]);
                      }}
                      className={`mt-0.5 shrink-0 transition-colors ${statusConfig[task.status].color} rounded-full p-0.5`}
                      title={`Status: ${statusConfig[task.status].label} (click to cycle)`}
                    >
                      {statusConfig[task.status].icon}
                    </button>

                    {/* Task Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3
                          className={`font-medium text-sm ${
                            task.status === "done"
                              ? "line-through text-muted-foreground"
                              : "text-foreground"
                          }`}
                        >
                          {task.title}
                        </h3>
                        {task.isAiGenerated && (
                          <Badge variant="secondary" className="text-xs gap-1 bg-violet-500/10 text-violet-400 border-0">
                            <Sparkles className="h-3 w-3" />
                            AI
                          </Badge>
                        )}
                      </div>
                      {task.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                          {task.description}
                        </p>
                      )}

                      {/* Meta Row */}
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        <Badge
                          variant="outline"
                          className={`text-xs gap-1 ${priorityConfig[task.priority].color}`}
                        >
                          {priorityConfig[task.priority].icon}
                          {priorityConfig[task.priority].label}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Tag className="h-3 w-3" />
                          {categoryConfig[task.category]?.emoji} {categoryConfig[task.category]?.label}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(task.dueDate).toLocaleDateString("de-DE", {
                            day: "2-digit",
                            month: "short",
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Assignee */}
                    <div className="hidden sm:flex items-center gap-2 shrink-0">
                      {task.assigneeId ? (
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6 border border-border">
                            <AvatarFallback>{task.assigneeName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}</AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-muted-foreground max-w-[80px] truncate">
                            {task.assigneeName.split(" ")[0]}
                          </span>
                        </div>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          Unassigned
                        </Badge>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="relative shrink-0">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === task.id ? null : task.id)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                      <AnimatePresence>
                        {openMenuId === task.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="absolute right-0 top-full mt-1 w-44 bg-card border border-border rounded-lg shadow-lg py-1 z-50"
                          >
                            {(["todo", "in_progress", "done"] as TaskStatus[]).map((s) => (
                              <button
                                key={s}
                                className="w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors flex items-center gap-2"
                                onClick={() => handleStatusChange(task.id, s)}
                              >
                                <span className={statusConfig[s].color}>
                                  {statusConfig[s].icon}
                                </span>
                                {statusConfig[s].label}
                              </button>
                            ))}
                            <div className="border-t border-border my-1" />
                            <button
                              className="w-full px-3 py-2 text-left text-sm hover:bg-red-500/10 text-red-500 transition-colors flex items-center gap-2"
                              onClick={() => handleDeleteTask(task.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* ─── Create Task Modal ──────────────────────────── */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Task</DialogTitle>
            <DialogDescription>
              Add a new task and optionally assign it to a team member.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                value={taskForm.title}
                onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                placeholder="e.g. Restock bar fridges"
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <textarea
                value={taskForm.description}
                onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                placeholder="Detailed instructions (optional)"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm min-h-[80px] resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={taskForm.category}
                  onValueChange={(v) => setTaskForm({ ...taskForm, category: v as TaskCategory })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryConfig).map(([key, cfg]) => (
                      <SelectItem key={key} value={key}>
                        {cfg.emoji} {cfg.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  value={taskForm.priority}
                  onValueChange={(v) => setTaskForm({ ...taskForm, priority: v as Priority })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(priorityConfig).map(([key, cfg]) => (
                      <SelectItem key={key} value={key}>
                        <span className="flex items-center gap-2">
                          {cfg.icon} {cfg.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Assign To</Label>
                <Select
                  value={taskForm.assigneeId}
                  onValueChange={(v) => setTaskForm({ ...taskForm, assigneeId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Unassigned" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {staff.map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.firstName} {s.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input
                  type="date"
                  value={taskForm.dueDate}
                  onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTask} disabled={isCreating} className="gap-2">
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Create Task
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── AI Assist Modal ────────────────────────────── */}
      <Dialog open={aiModalOpen} onOpenChange={setAiModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-violet-500" />
              AI Task Assistant
            </DialogTitle>
            <DialogDescription>
              Generate task templates for common venue operations. Select the tasks you want to add.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Template Category</Label>
              <Select value={aiCategory} onValueChange={(v) => { setAiCategory(v); setAiSelectedTasks(new Set()); }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(AI_TASK_TEMPLATES).map(([key]) => (
                    <SelectItem key={key} value={key}>
                      {categoryConfig[key as TaskCategory]?.emoji} {categoryConfig[key as TaskCategory]?.label || key}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {(AI_TASK_TEMPLATES[aiCategory] || []).map((template, idx) => {
                const isSelected = aiSelectedTasks.has(idx);
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setAiSelectedTasks((prev) => {
                        const next = new Set(prev);
                        if (next.has(idx)) next.delete(idx);
                        else next.add(idx);
                        return next;
                      });
                    }}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      isSelected
                        ? "border-violet-500/50 bg-violet-500/5"
                        : "border-border hover:border-muted-foreground/30"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? "bg-violet-500 border-violet-500 text-white"
                            : "border-muted-foreground/30"
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="h-3.5 w-3.5" />}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-foreground">{template.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {template.description}
                        </p>
                        <Badge
                          variant="outline"
                          className={`text-xs mt-1.5 gap-1 ${priorityConfig[template.priority].color}`}
                        >
                          {priorityConfig[template.priority].icon}
                          {priorityConfig[template.priority].label}
                        </Badge>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {(AI_TASK_TEMPLATES[aiCategory] || []).length > 0 && (
              <button
                onClick={() => {
                  const all = (AI_TASK_TEMPLATES[aiCategory] || []).map((_, i) => i);
                  setAiSelectedTasks((prev) =>
                    prev.size === all.length ? new Set() : new Set(all)
                  );
                }}
                className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
              >
                {aiSelectedTasks.size === (AI_TASK_TEMPLATES[aiCategory] || []).length
                  ? "Deselect All"
                  : "Select All"}
              </button>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAiModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAiGenerate}
              disabled={isGenerating || aiSelectedTasks.size === 0}
              className="gap-2 bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  Add {aiSelectedTasks.size} Task{aiSelectedTasks.size !== 1 ? "s" : ""}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
