import { AlertCircle, ArrowUp, ArrowRight, ArrowDown, Circle, Clock, CheckCircle2 } from "lucide-react";

// ─── Types ────────────────────────────────────────────────
export type Priority = "urgent" | "high" | "medium" | "low";
export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskCategory = 
  | "morning_shift" 
  | "afternoon_shift" 
  | "evening_shift" 
  | "opening" 
  | "closing" 
  | "cleaning" 
  | "inventory" 
  | "service" 
  | "kitchen" 
  | "haccp"
  | "custom";

export interface Task {
  id: number;
  title: string;
  description: string;
  priority: string;
  status: string;
  category: string;
  requiresPhoto: boolean;
  photoUrl: string | null;
  assigneeId: number | null;
  assigneeName: string | null;
  dueDate: string | null;
  venueId: number;
  createdByUserId: number;
  createdFromTemplate: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Config ───────────────────────────────────────────────
export const priorityConfig: Record<string, { label: string; color: string; icon: any }> = {
  URGENT: { label: "Urgent", color: "text-red-500 bg-red-500/10 border-red-500/20", icon: AlertCircle },
  urgent: { label: "Urgent", color: "text-red-500 bg-red-500/10 border-red-500/20", icon: AlertCircle },
  HIGH: { label: "High", color: "text-orange-500 bg-orange-500/10 border-orange-500/20", icon: ArrowUp },
  high: { label: "High", color: "text-orange-500 bg-orange-500/10 border-orange-500/20", icon: ArrowUp },
  MEDIUM: { label: "Medium", color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20", icon: ArrowRight },
  medium: { label: "Medium", color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20", icon: ArrowRight },
  LOW: { label: "Low", color: "text-blue-500 bg-blue-500/10 border-blue-500/20", icon: ArrowDown },
  low: { label: "Low", color: "text-blue-500 bg-blue-500/10 border-blue-500/20", icon: ArrowDown },
};

export const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  TODO: { label: "To Do", color: "text-slate-400 bg-slate-500/10", icon: Circle },
  todo: { label: "To Do", color: "text-slate-400 bg-slate-500/10", icon: Circle },
  IN_PROGRESS: { label: "In Progress", color: "text-blue-400 bg-blue-500/10", icon: Clock },
  in_progress: { label: "In Progress", color: "text-blue-400 bg-blue-500/10", icon: Clock },
  DONE: { label: "Done", color: "text-green-400 bg-green-500/10", icon: CheckCircle2 },
  done: { label: "Done", color: "text-green-400 bg-green-500/10", icon: CheckCircle2 },
};

export const categoryConfig: Record<string, { label: string; emoji: string }> = {
  MORNING_SHIFT: { label: "Morning Shift", emoji: "🌅" },
  morning_shift: { label: "Morning Shift", emoji: "🌅" },
  AFTERNOON_SHIFT: { label: "Afternoon Shift", emoji: "☀️" },
  afternoon_shift: { label: "Afternoon Shift", emoji: "☀️" },
  EVENING_SHIFT: { label: "Evening Shift", emoji: "🌙" },
  evening_shift: { label: "Evening Shift", emoji: "🌙" },
  OPENING: { label: "Opening", emoji: "🔓" },
  opening: { label: "Opening", emoji: "🔓" },
  CLOSING: { label: "Closing", emoji: "🔒" },
  closing: { label: "Closing", emoji: "🔒" },
  CLEANING: { label: "Cleaning", emoji: "🧹" },
  cleaning: { label: "Cleaning", emoji: "🧹" },
  INVENTORY: { label: "Inventory", emoji: "📦" },
  inventory: { label: "Inventory", emoji: "📦" },
  SERVICE: { label: "Service", emoji: "🍽️" },
  service: { label: "Service", emoji: "🍽️" },
  KITCHEN: { label: "Kitchen", emoji: "👨‍🍳" },
  kitchen: { label: "Kitchen", emoji: "👨‍🍳" },
  CUSTOM: { label: "Custom", emoji: "📌" },
  custom: { label: "Custom", emoji: "📌" },
  HACCP: { label: "HACCP", emoji: "🌡️" },
  haccp: { label: "HACCP", emoji: "🌡️" },
};

// Category select options (lowercase keys for forms)
export const categoryOptions: { key: string; label: string; emoji: string }[] = [
  { key: "morning_shift", label: "Morning Shift", emoji: "🌅" },
  { key: "afternoon_shift", label: "Afternoon Shift", emoji: "☀️" },
  { key: "evening_shift", label: "Evening Shift", emoji: "🌙" },
  { key: "opening", label: "Opening", emoji: "🔓" },
  { key: "closing", label: "Closing", emoji: "🔒" },
  { key: "cleaning", label: "Cleaning", emoji: "🧹" },
  { key: "inventory", label: "Inventory", emoji: "📦" },
  { key: "service", label: "Service", emoji: "🍽️" },
  { key: "kitchen", label: "Kitchen", emoji: "👨‍🍳" },
  { key: "haccp", label: "HACCP", emoji: "🌡️" },
  { key: "custom", label: "Custom", emoji: "📌" },
];

// ─── Templates ────────────────────────────────────────────
export const SHIFT_TEMPLATES = {
  morning: {
    label: "Morning Shift Plan",
    icon: "🌅",
    description: "Prepare the venue for the day ahead.",
    tasks: [
      { title: "Turn on lights & signage", description: "Switch on all interior/exterior lights.", priority: "high", category: "morning_shift", requiresPhoto: false },
      { title: "Review reservations", description: "Check bookings for lunch service.", priority: "high", category: "morning_shift", requiresPhoto: false },
      { title: "Boot POS systems", description: "Ensure all terminals are online.", priority: "urgent", category: "morning_shift", requiresPhoto: false },
      { title: "Inspect restrooms", description: "Verify cleanliness and stock supplies.", priority: "medium", category: "cleaning", requiresPhoto: false },
      { title: "Accept deliveries", description: "Check incoming stock against invoices.", priority: "medium", category: "inventory", requiresPhoto: false },
    ]
  },
  afternoon: {
    label: "Afternoon Shift Plan",
    icon: "☀️",
    description: "Transition from lunch to dinner service.",
    tasks: [
      { title: "Restock bar wells", description: "Refill ice, fruit, and spirits.", priority: "high", category: "afternoon_shift", requiresPhoto: false },
      { title: "Wipe down tables", description: "Clean all tables after lunch rush.", priority: "medium", category: "cleaning", requiresPhoto: false },
      { title: "Check bathrooms", description: "Mid-day cleanliness check.", priority: "medium", category: "cleaning", requiresPhoto: false },
      { title: "Prep dinner menus", description: "Ensure menus are clean and substantial.", priority: "low", category: "service", requiresPhoto: false },
      { title: "Verify reservation seating", description: "Plan table assignments for evening.", priority: "high", category: "afternoon_shift", requiresPhoto: false },
    ]
  },
  evening: {
    label: "Evening Shift Plan",
    icon: "🌙",
    description: "Manage dinner service and closing duties.",
    tasks: [
      { title: "Adjust lighting", description: "Dim lights for evening ambiance.", priority: "medium", category: "evening_shift", requiresPhoto: false },
      { title: "Check music volume", description: "Set appropriate volume for dinner.", priority: "low", category: "service", requiresPhoto: false },
      { title: "Monitor floor sections", description: "Ensure coverage for all sections.", priority: "high", category: "service", requiresPhoto: false },
      { title: "86 List Update", description: "Update staff on sold-out items.", priority: "urgent", category: "kitchen", requiresPhoto: false },
      { title: "Closing duties assign", description: "Assign closing tasks to staff.", priority: "high", category: "closing", requiresPhoto: false },
    ]
  }
};

export const OTHER_TEMPLATES: Record<string, { title: string; description: string; category: string; priority: string; requiresPhoto: boolean }[]> = {
  haccp: [
    { title: "Record Fridge Temps", description: "Log temperatures for all cooling units.", category: "haccp", priority: "urgent", requiresPhoto: true },
    { title: "Verify Dishwasher Temp", description: "Ensure rinse cycle meets 82°C.", category: "haccp", priority: "high", requiresPhoto: true },
    { title: "Label Date Codes", description: "Check all prepped food for valid dates.", category: "haccp", priority: "high", requiresPhoto: true },
    { title: "Cooling Log Check", description: "Verify blast chiller logs.", category: "haccp", priority: "high", requiresPhoto: true },
    { title: "Sanitizer Concentration", description: "Test chemical ppm levels.", category: "haccp", priority: "urgent", requiresPhoto: true },
    { title: "Probe Calibration", description: "Test thermometer accuracy with ice water.", category: "haccp", priority: "medium", requiresPhoto: true },
  ],
  cleaning: [
    { title: "Deep clean espresso machine", description: "Run backflush cycle, clean wands.", category: "cleaning", priority: "medium", requiresPhoto: false },
    { title: "Mop floors", description: "Thoroughly mop FOH and BOH.", category: "cleaning", priority: "high", requiresPhoto: false },
    { title: "Clean glass washer", description: "Empty and sanitize washer.", category: "cleaning", priority: "medium", requiresPhoto: false },
  ],
  inventory: [
    { title: "Count spirits", description: "Full inventory of open bottles.", category: "inventory", priority: "medium", requiresPhoto: false },
    { title: "Check expiry dates", description: "Review perishable stock.", category: "inventory", priority: "high", requiresPhoto: false },
    { title: "Order supplies", description: "Place orders for low stock items.", category: "inventory", priority: "high", requiresPhoto: false },
  ],
};
