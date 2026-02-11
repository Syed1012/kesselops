"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
  Loader2,
  Trash2,
  LayoutTemplate,
  Briefcase,
  Camera,
  ClipboardList,
  Sun,
  Moon,
  Sunset,
  Upload,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  getUsers,
  getTasks,
  createTask as apiCreateTask,
  createTasksBatch,
  updateTask as apiUpdateTask,
  updateTaskStatus,
  uploadTaskPhoto,
  deleteTask as apiDeleteTask,
  type User,
} from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useVenue } from "@/lib/venue-context";
import {
  type Task,
  priorityConfig,
  statusConfig,
  categoryConfig,
  categoryOptions,
  SHIFT_TEMPLATES,
  OTHER_TEMPLATES,
} from "./task-data";

// ─── Helper: Get Current Shift ────────────────────────────
const getShiftDetails = () => {
  const hour = new Date().getHours();
  if (hour < 12)
    return {
      key: "morning" as const,
      greeting: "Good Morning",
      icon: Sun,
      color: "text-amber-500",
      bg: "bg-amber-500/10 border-amber-500/20",
    };
  if (hour < 17)
    return {
      key: "afternoon" as const,
      greeting: "Good Afternoon",
      icon: Sunset,
      color: "text-orange-500",
      bg: "bg-orange-500/10 border-orange-500/20",
    };
  return {
    key: "evening" as const,
    greeting: "Good Evening",
    icon: Moon,
    color: "text-indigo-500",
    bg: "bg-indigo-500/10 border-indigo-500/20",
  };
};

const KANBAN_STATUSES = ["TODO", "IN_PROGRESS", "DONE"] as const;

// ─── Main Page ────────────────────────────────────────────
export default function TasksPage() {
  const { user: currentUser } = useAuth();
  const { selectedVenue } = useVenue();
  const isPrivileged = ["OWNER", "MANAGER", "CHEF"].includes(currentUser?.role || "");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [staff, setStaff] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [opsHubOpen, setOpsHubOpen] = useState(false);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);

  // State
  const [isCreating, setIsCreating] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [draggedTaskId, setDraggedTaskId] = useState<number | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Hub shift selector
  const [selectedShiftKey, setSelectedShiftKey] = useState<string | null>(null);

  // Forms
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    category: "custom",
    assigneeId: "",
    dueDate: new Date().toISOString().split("T")[0],
    requiresPhoto: false,
  });

  const currentShift = getShiftDetails();
  const venueId = selectedVenue?.id;

  // ─── Load Tasks & Staff ───────────────────────────────
  const loadAllTasks = useCallback(async () => {
    if (!venueId) return;
    setIsLoading(true);
    try {
      const res = await getTasks(venueId);
      if (res.success && res.data) {
        setTasks(res.data);
      }
    } catch {
      /* ignore */
    } finally {
      setIsLoading(false);
    }
  }, [venueId]);

  useEffect(() => {
    if (!venueId) {
      setStaff([]);
      return;
    }

    loadAllTasks();
    (async () => {
      try {
        const res = await getUsers(venueId);
        if (res.success && res.data) setStaff(res.data);
      } catch {
        /* ignore */
      }
    })();
  }, [loadAllTasks, venueId]);

  // ─── Handlers ─────────────────────────────────────────
  const handleCreateTask = async () => {
    if (!taskForm.title.trim()) {
      toast.error("Task title is required");
      return;
    }
    if (!venueId) {
      toast.error("No venue selected");
      return;
    }
    setIsCreating(true);

    const assigneeId =
      taskForm.assigneeId && taskForm.assigneeId !== "unassigned"
        ? Number(taskForm.assigneeId)
        : null;

    const res = await apiCreateTask({
      title: taskForm.title.trim(),
      description: taskForm.description.trim(),
      priority: taskForm.priority.toUpperCase(),
      category: taskForm.category.toUpperCase(),
      requiresPhoto: taskForm.requiresPhoto,
      assigneeId,
      dueDate: taskForm.dueDate,
      venueId,
    });

    if (res.success && res.data) {
      setTasks((prev) => [res.data, ...prev]);
      setCreateModalOpen(false);
      resetForm();
      toast.success("Task created successfully");
    } else {
      toast.error(res.error || "Failed to create task");
    }
    setIsCreating(false);
  };

  const handleUpdateTask = async () => {
    if (!selectedTask || !taskForm.title.trim()) return;

    const assigneeId =
      taskForm.assigneeId && taskForm.assigneeId !== "unassigned"
        ? Number(taskForm.assigneeId)
        : null;

    const res = await apiUpdateTask(selectedTask.id, {
      title: taskForm.title.trim(),
      description: taskForm.description.trim(),
      priority: taskForm.priority.toUpperCase(),
      category: taskForm.category.toUpperCase(),
      requiresPhoto: taskForm.requiresPhoto,
      assigneeId,
      dueDate: taskForm.dueDate,
    });

    if (res.success && res.data) {
      setTasks((prev) =>
        prev.map((t) => (t.id === selectedTask.id ? res.data : t))
      );
      setEditModalOpen(false);
      setSelectedTask(null);
      toast.success("Task updated");
    } else {
      toast.error(res.error || "Failed to update task");
    }
  };

  const resetForm = () => {
    setTaskForm({
      title: "",
      description: "",
      priority: "medium",
      category: "custom",
      assigneeId: "",
      dueDate: new Date().toISOString().split("T")[0],
      requiresPhoto: false,
    });
  };

  const openEditModal = (task: Task) => {
    setSelectedTask(task);
    setTaskForm({
      title: task.title,
      description: task.description || "",
      priority: task.priority.toLowerCase(),
      category: task.category.toLowerCase(),
      assigneeId: task.assigneeId ? String(task.assigneeId) : "",
      dueDate: task.dueDate || new Date().toISOString().split("T")[0],
      requiresPhoto: task.requiresPhoto || false,
    });
    setEditModalOpen(true);
  };

  const handleDeleteTask = async (taskId: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const res = await apiDeleteTask(taskId);
    if (res.success) {
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      toast.success("Task deleted");
      if (editModalOpen) setEditModalOpen(false);
    } else {
      toast.error(res.error || "Failed to delete task");
    }
  };

  const handleApplyTemplate = async (
    templateKey: string,
    type: "shift" | "other"
  ) => {
    if (!venueId) {
      toast.error("No venue selected");
      return;
    }
    setIsGenerating(true);

    let templateTasks: {
      title: string;
      description: string;
      priority: string;
      category: string;
      requiresPhoto: boolean;
    }[] = [];

    if (
      type === "shift" &&
      templateKey in SHIFT_TEMPLATES
    ) {
      templateTasks =
        SHIFT_TEMPLATES[templateKey as keyof typeof SHIFT_TEMPLATES].tasks;
    } else if (type === "other") {
      templateTasks = OTHER_TEMPLATES[templateKey] || [];
    }

    if (templateTasks.length === 0) {
      setIsGenerating(false);
      return;
    }

    const res = await createTasksBatch({
      venueId,
      templateName: templateKey,
      tasks: templateTasks,
    });

    if (res.success && res.data) {
      const newTasks = res.data;
      setTasks((prev) => [...newTasks, ...prev]);
      setOpsHubOpen(false);
      toast.success(`${res.data.length} tasks added from template`);
    } else {
      toast.error(res.error || "Failed to create tasks from template");
    }
    setIsGenerating(false);
  };

  const handlePhotoUpload = async () => {
    if (!selectedTask || !photoFile) {
      toast.error("Please select a photo first");
      return;
    }
    setIsUploadingPhoto(true);

    const res = await uploadTaskPhoto(selectedTask.id, photoFile, true);

    if (res.success && res.data) {
      setTasks((prev) =>
        prev.map((t) => (t.id === selectedTask.id ? res.data : t))
      );
      setPhotoModalOpen(false);
      setPhotoFile(null);
      toast.success("Photo attached & task completed");
    } else {
      toast.error(res.error || "Failed to upload photo");
    }
    setIsUploadingPhoto(false);
  };

  // ─── Drag & Drop ──────────────────────────────────────
  const onDragStart = (e: React.DragEvent, taskId: number) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.setData("taskId", String(taskId));
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const onDrop = async (e: React.DragEvent, status: string) => {
    e.preventDefault();
    const taskId = Number(e.dataTransfer.getData("taskId"));

    if (taskId) {
      const task = tasks.find((t) => t.id === taskId);
      if (
        status === "DONE" &&
        task?.requiresPhoto &&
        !task.photoUrl
      ) {
        setSelectedTask(task);
        setPhotoModalOpen(true);
        setDraggedTaskId(null);
        return;
      }

      // Optimistic update
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status } : t))
      );

      const res = await updateTaskStatus(taskId, status);
      if (!res.success) {
        // Revert on failure
        await loadAllTasks();
        toast.error("Failed to update status");
      }
    }
    setDraggedTaskId(null);
  };

  // ─── Filters ──────────────────────────────────────────
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (
        filterPriority !== "all" &&
        task.priority.toLowerCase() !== filterPriority
      )
        return false;
      if (
        filterCategory !== "all" &&
        task.category.toLowerCase() !== filterCategory
      )
        return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          task.title.toLowerCase().includes(q) ||
          (task.assigneeName || "").toLowerCase().includes(q) ||
          (task.description || "").toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [tasks, filterPriority, filterCategory, searchQuery]);

  // Group tasks by status for Kanban
  const kanbanColumns = useMemo(() => {
    const cols: Record<string, Task[]> = {
      TODO: [],
      IN_PROGRESS: [],
      DONE: [],
    };

    filteredTasks.forEach((task) => {
      const key = task.status.toUpperCase();
      if (cols[key]) {
        cols[key].push(task);
      } else {
        cols["TODO"].push(task);
      }
    });
    return cols;
  }, [filteredTasks]);

  // ─── Stats ────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = tasks.length;
    const todo = tasks.filter(
      (t) => t.status.toUpperCase() === "TODO"
    ).length;
    const inProgress = tasks.filter(
      (t) => t.status.toUpperCase() === "IN_PROGRESS"
    ).length;
    const done = tasks.filter(
      (t) => t.status.toUpperCase() === "DONE"
    ).length;
    const urgent = tasks.filter(
      (t) =>
        t.priority.toUpperCase() === "URGENT" &&
        t.status.toUpperCase() !== "DONE"
    ).length;
    return { total, todo, inProgress, done, urgent };
  }, [tasks]);

  // Assignee name resolver
  const getAssigneeName = (task: Task) => {
    if (task.assigneeName) return task.assigneeName;
    if (!task.assigneeId) return "Unassigned";
    const staffMember = staff.find((s) => s.id === task.assigneeId);
    return staffMember
      ? `${staffMember.firstName} ${staffMember.lastName}`
      : "Unassigned";
  };

  const getAssigneeInitials = (name: string) => {
    if (name === "Unassigned") return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tasks</h1>
          <p className="text-muted-foreground">
            Manage shift operations and HACCP protocols
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isPrivileged && (
            <>
              <Button
                variant="outline"
                className="gap-2 border-primary/20 hover:bg-primary/5"
                onClick={() => {
                  setSelectedShiftKey(null);
                  setOpsHubOpen(true);
                }}
              >
                <Briefcase className="h-4 w-4" />
                Operations Hub
              </Button>
              <Button
                className="gap-2"
                onClick={() => {
                  resetForm();
                  setCreateModalOpen(true);
                }}
              >
                <Plus className="h-4 w-4" />
                Create Task
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 shrink-0">
        {[
          {
            label: "Total",
            value: stats.total,
            icon: <ClipboardList className="h-4 w-4" />,
            color: "text-foreground",
          },
          {
            label: "To Do",
            value: stats.todo,
            icon: <Circle className="h-4 w-4" />,
            color: "text-slate-400",
          },
          {
            label: "In Progress",
            value: stats.inProgress,
            icon: <Clock className="h-4 w-4" />,
            color: "text-blue-400",
          },
          {
            label: "Done",
            value: stats.done,
            icon: <CheckCircle2 className="h-4 w-4" />,
            color: "text-green-400",
          },
          {
            label: "Urgent",
            value: stats.urgent,
            icon: <AlertCircle className="h-4 w-4" />,
            color: "text-red-400",
          },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-4 pb-3 px-4">
              <div className="flex items-center gap-2">
                <div className={stat.color}>{stat.icon}</div>
                <div>
                  <p className="text-xl font-bold text-foreground">
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 shrink-0">
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
          <Select
            value={filterPriority}
            onValueChange={(v) => setFilterPriority(v)}
          >
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
          <Select
            value={filterCategory}
            onValueChange={(v) => setFilterCategory(v)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categoryOptions.map((cat) => (
                <SelectItem key={cat.key} value={cat.key}>
                  {cat.emoji} {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Kanban Board */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="flex-1 overflow-x-auto min-h-0">
          <div className="flex h-full gap-4 min-w-[800px] pb-2">
            {KANBAN_STATUSES.map((status) => {
              const cfg = statusConfig[status];
              return (
                <div
                  key={status}
                  className="flex-1 flex flex-col min-w-[280px] bg-muted/30 rounded-xl border border-border/50"
                  onDragOver={onDragOver}
                  onDrop={(e) => onDrop(e, status)}
                >
                  {/* Column Header */}
                  <div
                    className={`p-3 border-b border-border/50 flex items-center justify-between ${
                      status === "TODO"
                        ? "bg-slate-500/5"
                        : status === "IN_PROGRESS"
                        ? "bg-blue-500/5"
                        : "bg-green-500/5"
                    } rounded-t-xl sticky top-0 backdrop-blur-sm z-10`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`p-1 rounded-full ${cfg?.color || ""}`}>
                        {(() => {
                          const Icon = cfg?.icon || Circle;
                          return <Icon className="h-4 w-4" />;
                        })()}
                      </div>
                      <h3 className="font-semibold text-sm">
                        {cfg?.label || status}
                      </h3>
                      <Badge
                        variant="secondary"
                        className="ml-1 h-5 px-1.5 text-[10px] min-w-[20px] justify-center"
                      >
                        {kanbanColumns[status]?.length || 0}
                      </Badge>
                    </div>
                  </div>

                  {/* Task Stack */}
                  <div className="flex-1 p-2 overflow-y-auto space-y-2">
                    {(kanbanColumns[status] || []).map((task) => {
                      const pCfg = priorityConfig[task.priority];
                      const cCfg = categoryConfig[task.category];
                      const assigneeName = getAssigneeName(task);

                      return (
                        <motion.div
                          layoutId={String(task.id)}
                          key={task.id}
                          draggable
                          onDragStart={(e: any) => onDragStart(e, task.id)}
                          onClick={() => {
                            if (
                              task.requiresPhoto &&
                              !task.photoUrl &&
                              task.status.toUpperCase() !== "DONE"
                            ) {
                              setSelectedTask(task);
                              setPhotoFile(null);
                              setPhotoModalOpen(true);
                            } else {
                              openEditModal(task);
                            }
                          }}
                          className={`
                            bg-card hover:bg-muted/50 border border-border rounded-lg p-3 shadow-sm cursor-grab active:cursor-grabbing group relative
                            ${task.requiresPhoto ? "border-l-4 border-l-purple-500" : ""}
                          `}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <h4
                              className={`text-sm font-medium leading-tight ${
                                task.status.toUpperCase() === "DONE"
                                  ? "line-through text-muted-foreground"
                                  : ""
                              }`}
                            >
                              {task.title}
                            </h4>
                            {isPrivileged && (
                              <button
                                onClick={(e) => handleDeleteTask(task.id, e)}
                                className="text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>

                          {task.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {task.description}
                            </p>
                          )}

                          {task.requiresPhoto && (
                            <div className="mt-2 flex items-center gap-1.5 text-[10px] font-medium text-purple-600 bg-purple-500/10 px-2 py-0.5 rounded w-fit">
                              <Camera className="h-3 w-3" />
                              {task.photoUrl
                                ? "Photo Verified ✓"
                                : "Photo Required"}
                            </div>
                          )}

                          <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                            <Badge
                              variant="outline"
                              className={`text-[10px] h-5 gap-1 border-0 ${
                                pCfg?.color || ""
                              } px-1.5`}
                            >
                              {pCfg?.label || task.priority}
                            </Badge>

                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                              {cCfg?.emoji} {cCfg?.label || task.category}
                            </div>
                          </div>

                          <div className="mt-2 flex items-center justify-between border-t border-border pt-2 border-dashed">
                            <div className="flex items-center gap-1.5">
                              <Avatar className="h-4 w-4">
                                <AvatarFallback className="text-[8px]">
                                  {getAssigneeInitials(assigneeName)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-[10px] text-muted-foreground truncate max-w-[80px]">
                                {assigneeName.split(" ")[0]}
                              </span>
                            </div>
                            {task.dueDate && (
                              <span className="text-[10px] text-muted-foreground">
                                {new Date(task.dueDate).toLocaleDateString(
                                  "de-DE",
                                  {
                                    day: "2-digit",
                                    month: "2-digit",
                                  }
                                )}
                              </span>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                    {(kanbanColumns[status] || []).length === 0 && (
                      <div className="h-24 flex items-center justify-center border-2 border-dashed border-border/50 rounded-lg text-xs text-muted-foreground">
                        Drop tasks here
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── Create/Edit Task Modal ────────────────────── */}
      <Dialog
        open={createModalOpen || editModalOpen}
        onOpenChange={(v) => {
          if (!v) {
            setCreateModalOpen(false);
            setEditModalOpen(false);
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editModalOpen ? "Edit Task" : "Create Task"}
            </DialogTitle>
            <DialogDescription>
              {editModalOpen
                ? "Modify task details."
                : "Add a new task manually."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={taskForm.title}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, title: e.target.value })
                }
                placeholder="e.g. Restock bar fridges"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={taskForm.description}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, description: e.target.value })
                }
                placeholder="Optional details"
              />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={taskForm.category}
                  onValueChange={(v) => {
                    const isHaccp = v === "haccp";
                    setTaskForm({
                      ...taskForm,
                      category: v,
                      requiresPhoto: isHaccp ? true : taskForm.requiresPhoto,
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((cat) => (
                      <SelectItem key={cat.key} value={cat.key}>
                        {cat.emoji} {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  value={taskForm.priority}
                  onValueChange={(v) =>
                    setTaskForm({ ...taskForm, priority: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Assign To</Label>
                <Select
                  value={taskForm.assigneeId || "unassigned"}
                  onValueChange={(v) =>
                    setTaskForm({ ...taskForm, assigneeId: v })
                  }
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
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, dueDate: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Requires Photo Toggle */}
            <div className="flex items-center space-x-3 p-3 rounded-lg border border-border bg-muted/30">
              <Checkbox
                id="requiresPhoto"
                checked={taskForm.requiresPhoto}
                onCheckedChange={(checked: boolean | "indeterminate") =>
                  setTaskForm({ ...taskForm, requiresPhoto: !!checked })
                }
              />
              <div>
                <Label
                  htmlFor="requiresPhoto"
                  className="text-sm font-medium cursor-pointer"
                >
                  Requires Photo Verification
                </Label>
                <p className="text-xs text-muted-foreground">
                  Mandatory photo upload before task can be marked as done
                </p>
              </div>
              <Camera className="h-4 w-4 text-purple-500 ml-auto" />
            </div>
          </div>
          <DialogFooter>
            {editModalOpen && isPrivileged && (
              <Button
                variant="destructive"
                className="mr-auto"
                onClick={() =>
                  selectedTask && handleDeleteTask(selectedTask.id)
                }
              >
                <Trash2 className="h-4 w-4 mr-2" /> Delete
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => {
                setCreateModalOpen(false);
                setEditModalOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={editModalOpen ? handleUpdateTask : handleCreateTask}
              disabled={isCreating}
            >
              {isCreating ? (
                <Loader2 className="animate-spin h-4 w-4" />
              ) : editModalOpen ? (
                "Save Changes"
              ) : (
                "Create Task"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Operations Hub Modal (2-Column) ──────────── */}
      <Dialog open={opsHubOpen} onOpenChange={setOpsHubOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader className="pb-2 border-b">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2 text-xl">
                <Briefcase className="h-5 w-5" />
                Operations Hub
              </DialogTitle>
              <div
                className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${currentShift.color} ${currentShift.bg}`}
              >
                <currentShift.icon className="h-3.5 w-3.5" />
                {currentShift.greeting}, Manager
              </div>
            </div>
          </DialogHeader>

          <div className="py-4">
            <div className="flex gap-6">
              {/* Left Column: Shift Selection */}
              <div className="w-2/5 space-y-3 pr-4 border-r border-border">
                <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Shift Templates
                </h4>
                <p className="text-xs text-muted-foreground">
                  Select a shift to load its tasks
                </p>
                {Object.entries(SHIFT_TEMPLATES).map(([key, shift]) => {
                  const isCurrentShift = key === currentShift.key;
                  const isSelected = selectedShiftKey === key;
                  return (
                    <motion.div
                      key={key}
                      className={`
                        relative group overflow-hidden rounded-xl border bg-card hover:shadow-md transition-all cursor-pointer p-4
                        ${isSelected ? "border-primary ring-2 ring-primary/20 shadow-md" : isCurrentShift ? "border-primary/40" : "border-border"}
                      `}
                      onClick={() => setSelectedShiftKey(key)}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{shift.icon}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-sm">
                              {shift.label}
                            </h3>
                            {isCurrentShift && (
                              <Badge
                                variant="secondary"
                                className="text-[10px] h-4 px-1.5"
                              >
                                Current
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {shift.tasks.length} tasks
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}

                {selectedShiftKey && (
                  <Button
                    className="w-full gap-2 mt-2"
                    onClick={() =>
                      handleApplyTemplate(selectedShiftKey, "shift")
                    }
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <Loader2 className="animate-spin h-4 w-4" />
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        Load{" "}
                        {
                          SHIFT_TEMPLATES[
                            selectedShiftKey as keyof typeof SHIFT_TEMPLATES
                          ]?.label
                        }
                      </>
                    )}
                  </Button>
                )}
              </div>

              {/* Right Column: Task Protocols */}
              <div className="flex-1 space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <LayoutTemplate className="h-4 w-4" />
                  Task Protocols
                </h4>
                <p className="text-xs text-muted-foreground">
                  Quick-add task sets by category
                </p>
                <div className="space-y-2">
                  {Object.entries(OTHER_TEMPLATES).map(
                    ([key, templateTasks]) => (
                      <motion.button
                        key={key}
                        onClick={() => handleApplyTemplate(key, "other")}
                        className="w-full flex items-center justify-between gap-3 p-3.5 rounded-xl border border-border bg-card hover:bg-muted/50 text-left transition-colors group"
                        disabled={isGenerating}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">
                            {categoryConfig[templateTasks[0].category]
                              ?.emoji || "📋"}
                          </span>
                          <div>
                            <p className="font-medium text-sm capitalize">
                              {key} Protocol
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {templateTasks.length} tasks
                              {key === "haccp" && (
                                <span className="text-purple-500 ml-1">
                                  • Photo required
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                        <Plus className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                      </motion.button>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── Photo Upload Modal (HACCP) ──────────────── */}
      <Dialog open={photoModalOpen} onOpenChange={setPhotoModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-purple-500" />
              Proof Required
            </DialogTitle>
            <DialogDescription>
              This is a mandatory HACCP task. Please upload a photo to verify
              completion.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border rounded-xl bg-muted/20 gap-4">
            {photoFile ? (
              <div className="text-center space-y-2">
                <div className="h-32 w-32 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                  <img
                    src={URL.createObjectURL(photoFile)}
                    alt="Preview"
                    className="h-full w-full object-cover rounded-lg"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {photoFile.name}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPhotoFile(null)}
                >
                  Remove
                </Button>
              </div>
            ) : (
              <>
                <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center">
                  <Camera className="h-10 w-10 text-muted-foreground" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">Click to select a photo</p>
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG up to 10MB
                  </p>
                </div>
              </>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setPhotoFile(file);
              }}
            />

            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="w-full gap-2"
            >
              <Upload className="h-4 w-4" />
              {photoFile ? "Change Photo" : "Select Photo"}
            </Button>
          </div>

          <DialogFooter className="sm:justify-between">
            <Button
              variant="ghost"
              onClick={() => {
                setPhotoModalOpen(false);
                setPhotoFile(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePhotoUpload}
              disabled={!photoFile || isUploadingPhoto}
              className="gap-2"
            >
              {isUploadingPhoto ? (
                <Loader2 className="animate-spin h-4 w-4" />
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Upload & Complete Task
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
