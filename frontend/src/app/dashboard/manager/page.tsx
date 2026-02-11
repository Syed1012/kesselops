"use client";

import { motion } from "framer-motion";
import {
  Users,
  AlertCircle,
  Clock,
  ClipboardList,
  Ban, // Replaced UtensilsOff
  MessageSquare,
  Armchair,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  ChefHat,
  Search,
  Plus,
  MoreVertical,
  X
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { revenueData, alerts, todaysShift, reservations, tasks } from "@/lib/mock-data";
import { trainingModules } from "@/lib/mock-data";
import { getTraineeLearningProgress, type TraineeLearningProgress } from "@/lib/api";
import { useVenue } from "@/lib/venue-context";

// ─── Extended Mock Data for Manager View ───────────────────────────────────

const FLOOR_STATUS = {
  capacity: 120,
  currentGuests: 84,
  reserved: 24,
  openTables: 8
};

const SHIFT_TIMELINE = [
  { time: "17:30", event: "Staff Briefing", type: "routine", completed: true },
  { time: "18:00", event: "Dinner Service Start", type: "milestone", completed: true },
  { time: "19:00", event: "VIP: Ludwig Heer (T3)", type: "vip", completed: true },
  { time: "20:00", event: "Peak Capacity Expected", type: "alert", completed: false },
  { time: "21:30", event: "Kitchen Last Call", type: "routine", completed: false },
  { time: "22:00", event: "Live Music Start", type: "entertainment", completed: false },
];

const INITIAL_LOGBOOK = [
  { id: 1, author: "Tom W.", time: "17:45", text: "Ice machine 2 is acting up again. Maintenance called for tomorrow.", type: "maintenance" },
  { id: 2, author: "Anna S.", time: "18:20", text: "We are 86 on Sea Bass. Chef offers Salmon as sub.", type: "86" },
  { id: 3, author: "Max M.", time: "19:15", text: "Guest at T4 complained about draft. Moved them to T6.", type: "guest" },
];

const INITIAL_86_ITEMS = [
  { id: "1", name: "Sea Bass", category: "Food", time: "18:20", author: "Chef" },
  { id: "2", name: "Mint Leaves", category: "Bar", time: "19:05", author: "Bar Mgr" },
];

const TRAINEE_MODULES = trainingModules.filter((module) => module.roles.includes("TRAINEE"));
const TRAINEE_MODULE_META = TRAINEE_MODULES.map((module) => ({
  id: module.id,
  title: module.title,
  totalLessons: Array.isArray(module.chapters) ? module.chapters.length : module.totalLessons,
}));
const TRAINEE_TOTAL_LESSONS = TRAINEE_MODULE_META.reduce((sum, module) => sum + module.totalLessons, 0);

function formatLastActive(lastCompletedAt: string | null): string {
  if (!lastCompletedAt) return "No activity yet";
  const date = new Date(lastCompletedAt);
  if (Number.isNaN(date.getTime())) return "No activity yet";
  return `${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })} ${date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`;
}

function computeTraineeStats(row: TraineeLearningProgress) {
  const moduleStats = TRAINEE_MODULE_META.map((module) => {
    const completedSet = new Set(row.completedByModule?.[module.id] || []);
    const completed = Math.min(completedSet.size, module.totalLessons);
    const percent = module.totalLessons > 0 ? (completed / module.totalLessons) * 100 : 0;
    return {
      ...module,
      completed,
      percent,
      done: module.totalLessons > 0 && completed >= module.totalLessons,
    };
  });

  const completedLessons = moduleStats.reduce((sum, module) => sum + module.completed, 0);
  const progressPercent = TRAINEE_TOTAL_LESSONS > 0 ? (completedLessons / TRAINEE_TOTAL_LESSONS) * 100 : 0;
  const completedModules = moduleStats.filter((module) => module.done).length;

  return {
    moduleStats,
    completedLessons,
    progressPercent,
    completedModules,
    level: completedModules,
    atRisk: progressPercent < 30,
  };
}

// ─── Components ────────────────────────────────────────────────────────────

function KPITicker() {
  const laborPercent = 24.5; // Dummy logic
  const capacityPercent = (FLOOR_STATUS.currentGuests / FLOOR_STATUS.capacity) * 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="bg-card/50 border-border">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground font-medium">Revenue Pace</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">€{revenueData.today.toLocaleString()}</span>
              <span className="text-xs text-emerald-500 font-medium">+12% vs Target</span>
            </div>
          </div>
          <TrendingUp className="h-8 w-8 text-emerald-500/20" />
        </CardContent>
      </Card>
      
      <Card className="bg-card/50 border-border">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground font-medium">Labor Cost</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">{laborPercent}%</span>
              <span className="text-xs text-amber-500 font-medium">Approaching Limit</span>
            </div>
          </div>
          <Users className="h-8 w-8 text-amber-500/20" />
        </CardContent>
      </Card>

      <Card className="bg-card/50 border-border">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground font-medium">Headcount</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">{FLOOR_STATUS.currentGuests}/{FLOOR_STATUS.capacity}</span>
              <span className="text-xs text-blue-500 font-medium">{capacityPercent.toFixed(0)}% Full</span>
            </div>
          </div>
          <Armchair className="h-8 w-8 text-blue-500/20" />
        </CardContent>
      </Card>
    </div>
  );
}

function FloorPulseWidget() {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Armchair className="h-4 w-4 text-blue-500" /> 
          Floor Pulse
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Capacity Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Capacity</span>
              <span className="font-medium text-foreground">{((FLOOR_STATUS.currentGuests / FLOOR_STATUS.capacity) * 100).toFixed(0)}%</span>
            </div>
            <Progress value={(FLOOR_STATUS.currentGuests / FLOOR_STATUS.capacity) * 100} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-primary" /> Seated ({FLOOR_STATUS.currentGuests})</span>
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-muted" /> Open ({FLOOR_STATUS.capacity - FLOOR_STATUS.currentGuests})</span>
            </div>
          </div>

          {/* Upcoming Reservations */}
          <div>
             <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-3 flex items-center justify-between">
               Incoming VIPs 
               <Badge variant="outline" className="text-[10px] h-5">Today: {reservations.length}</Badge>
             </h4>
             <div className="space-y-3">
               {reservations.filter(r => r.table === 'VIP' || r.partySize > 6).map((res, i) => (
                 <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-violet-500/10 border border-violet-500/20 transition-all hover:bg-violet-500/20">
                   <div className="flex flex-col items-center justify-center w-10 h-10 rounded bg-background border border-border">
                     <span className="text-xs font-bold text-foreground">{res.time}</span>
                   </div>
                   <div className="flex-1">
                     <p className="text-sm font-medium text-foreground truncate">{res.guestName}</p>
                     <p className="text-xs text-muted-foreground">{res.partySize} Guests • T-{Math.floor(Math.random() * 10) + 1}</p>
                   </div>
                   <Badge className="bg-violet-500 text-white hover:bg-violet-600">VIP</Badge>
                 </div>
               ))}
               {reservations.filter(r => r.table !== 'VIP' && r.partySize <= 6).slice(0, 2).map((res, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-all">
                     <div className="text-xs font-medium text-muted-foreground w-10 text-center">{res.time}</div>
                     <div className="flex-1">
                       <p className="text-sm text-foreground">{res.guestName}</p>
                       <p className="text-xs text-muted-foreground">{res.partySize} Pax</p>
                     </div>
                  </div>
               ))}
             </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RosterAndAlerts() {
  return (
    <div className="space-y-6">
      {/* Urgent Alerts Only */}
      <Card className="border-red-500/20 bg-red-500/5">
        <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base text-red-500">
               <AlertTriangle className="h-4 w-4" /> Urgent Attention
            </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
            {alerts.filter(a => a.type === 'danger').map(alert => (
                <div key={alert.id} className="flex items-start gap-2 text-sm p-2 bg-background/50 rounded border border-red-500/10">
                   <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                   <span className="text-foreground">{alert.message}</span>
                </div>
            ))}
             <div className="flex items-start gap-2 text-sm p-2 bg-background/50 rounded border border-amber-500/10">
                   <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                   <span className="text-foreground">Ice Machine 2 requires maintenance</span>
             </div>
        </CardContent>
      </Card>

      {/* Staff Roster */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-base">
            <span className="flex items-center gap-2"><Users className="h-4 w-4 text-emerald-500" /> Active Roster</span>
            <Badge variant="outline">{todaysShift.staff.filter(s => s.status === 'ACTIVE').length}/{todaysShift.staff.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {todaysShift.staff.map((staff, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">{staff.firstName[0]}{staff.lastName[0]}</AvatarFallback>
                    </Avatar>
                    <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-background ${staff.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium leading-none">{staff.firstName} {staff.lastName}</p>
                    <p className="text-xs text-muted-foreground">{staff.role}</p>
                  </div>
                </div>
                <div className="text-right">
                   {staff.status === 'ACTIVE' ? (
                     <span className="text-xs text-muted-foreground font-mono">In: {todaysShift.startTime}</span>
                   ) : (
                     <Badge variant="secondary" className="text-[10px] h-5">Break</Badge>
                   )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Daily Tasks Progress */}
      <Card>
         <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center justify-between">
               <span className="flex items-center gap-2"><ClipboardList className="h-4 w-4 text-blue-400" /> Checklist</span>
               <span className="text-xs font-normal text-muted-foreground">{tasks.filter(t => t.completed).length}/{tasks.length} Done</span>
            </CardTitle>
         </CardHeader>
         <CardContent>
            <Progress value={(tasks.filter(t => t.completed).length / tasks.length) * 100} className="h-2 mb-3" />
            <div className="space-y-2">
               {tasks.slice(0,3).map(task => (
                  <div key={task.id} className="flex items-center gap-2 text-sm">
                     {task.completed ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <div className="w-4 h-4 rounded-full border border-muted-foreground" />}
                     <span className={task.completed ? "text-muted-foreground line-through" : "text-foreground"}>{task.title}</span>
                  </div>
               ))}
               <Button variant="ghost" size="sm" className="w-full text-xs h-6">View All Tasks</Button>
            </div>
         </CardContent>
      </Card>
    </div>
  );
}

function ManagerTools() {
  const [logbook, setLogbook] = useState(INITIAL_LOGBOOK);
  const [items86, setItems86] = useState(INITIAL_86_ITEMS);

  return (
    <div className="space-y-6">
       {/* Shift Timeline */}
       <Card className="bg-card/40">
         <CardHeader className="pb-2 px-4 pt-4">
             <CardTitle className="text-sm font-medium uppercase text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" /> Shift Timeline
             </CardTitle>
         </CardHeader>
         <CardContent className="px-4 pb-4">
            <div className="space-y-0 relative border-l border-border ml-1.5 pl-4 py-1">
               {SHIFT_TIMELINE.map((item, i) => (
                  <div key={i} className="relative mb-4 last:mb-0">
                     <span className={cn(
                        "absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full border-2 border-background",
                        item.completed ? "bg-emerald-500" : "bg-slate-600"
                     )} />
                     <p className="text-xs font-mono text-muted-foreground">{item.time}</p>
                     <p className={cn(
                        "text-sm font-medium",
                        item.type === 'vip' ? 'text-violet-400' : 
                        item.type === 'alert' ? 'text-amber-400' : 'text-foreground'
                     )}>{item.event}</p>
                  </div>
               ))}
            </div>
         </CardContent>
       </Card>

       {/* The 86 Board */}
       <Card className="border-red-500/20">
          <CardHeader className="pb-2 px-4 pt-4 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium uppercase text-red-400 flex items-center gap-2">
                 <Ban className="h-4 w-4" /> The 86 Board
              </CardTitle>
              <Button size="icon" variant="ghost" className="h-6 w-6"><Plus className="h-4 w-4" /></Button>
          </CardHeader>
          <CardContent className="px-4 pb-4">
              <div className="flex flex-wrap gap-2">
                 {items86.map(item => (
                    <Badge key={item.id} variant="secondary" className="bg-red-500/10 text-red-400 hover:bg-red-500/20 pr-1 gap-1">
                       {item.name}
                       <button onClick={() => setItems86(items86.filter(i => i.id !== item.id))} className="hover:text-red-300"><X className="h-3 w-3" /></button>
                    </Badge>
                 ))}
                 {items86.length === 0 && <span className="text-xs text-muted-foreground italic">No items 86'd</span>}
              </div>
          </CardContent>
       </Card>

       {/* Manager Logbook */}
       <Card className="flex-1 flex flex-col">
          <CardHeader className="pb-2 px-4 pt-4">
              <CardTitle className="text-sm font-medium uppercase text-muted-foreground flex items-center gap-2">
                 <MessageSquare className="h-4 w-4" /> Manager Log
              </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 flex-1 flex flex-col gap-3">
              <div className="flex-1 space-y-3 min-h-[200px]">
                 {logbook.map(log => (
                    <div key={log.id} className="text-sm p-2 bg-muted/30 rounded border border-border/50">
                       <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span className="font-semibold text-foreground">{log.author}</span>
                          <span className="font-mono">{log.time}</span>
                       </div>
                       <p className="text-foreground/90">{log.text}</p>
                    </div>
                 ))}
              </div>
              <div className="relative">
                 <input 
                   placeholder="Add a quick note..." 
                   className="w-full bg-background border border-border rounded-md pl-3 pr-10 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                 />
                 <Button size="icon" variant="ghost" className="absolute right-1 top-1 h-7 w-7"><CheckCircle2 className="h-4 w-4 text-emerald-500" /></Button>
              </div>
          </CardContent>
       </Card>
    </div>
  );
}

function LearningProgressTracker({
  trainees,
  loading,
  error,
}: {
  trainees: TraineeLearningProgress[];
  loading: boolean;
  error: string | null;
}) {
  const traineeCards = useMemo(() => {
    return trainees.map((trainee) => ({
      trainee,
      stats: computeTraineeStats(trainee),
    })).sort((a, b) => a.stats.progressPercent - b.stats.progressPercent);
  }, [trainees]);

  const summary = useMemo(() => {
    if (traineeCards.length === 0) {
      return {
        avgProgress: 0,
        masteredModules: 0,
        atRiskCount: 0,
      };
    }

    const avgProgress =
      traineeCards.reduce((sum, row) => sum + row.stats.progressPercent, 0) / traineeCards.length;
    const masteredModules = traineeCards.reduce((sum, row) => sum + row.stats.completedModules, 0);
    const atRiskCount = traineeCards.filter((row) => row.stats.atRisk).length;

    return { avgProgress, masteredModules, atRiskCount };
  }, [traineeCards]);

  return (
    <Card className="border-indigo-500/30 bg-indigo-500/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-indigo-400" />
          Trainee Learning Tracker
        </CardTitle>
        <CardDescription>
          Detailed module completion analytics for each trainee.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="rounded-lg border border-border bg-background/40 p-3">
            <p className="text-xs uppercase text-muted-foreground">Trainees Tracked</p>
            <p className="text-xl font-bold text-foreground">{traineeCards.length}</p>
          </div>
          <div className="rounded-lg border border-border bg-background/40 p-3">
            <p className="text-xs uppercase text-muted-foreground">Avg Progress</p>
            <p className="text-xl font-bold text-foreground">{summary.avgProgress.toFixed(0)}%</p>
          </div>
          <div className="rounded-lg border border-border bg-background/40 p-3">
            <p className="text-xs uppercase text-muted-foreground">Modules Mastered</p>
            <p className="text-xl font-bold text-foreground">{summary.masteredModules}</p>
          </div>
          <div className="rounded-lg border border-border bg-background/40 p-3">
            <p className="text-xs uppercase text-muted-foreground">Need Attention</p>
            <p className="text-xl font-bold text-amber-400">{summary.atRiskCount}</p>
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
            <Clock className="h-4 w-4 mr-2 animate-spin" />
            Loading trainee learning progress...
          </div>
        )}

        {!loading && error && (
          <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {!loading && !error && traineeCards.length === 0 && (
          <div className="rounded-md border border-border bg-background/30 p-4 text-sm text-muted-foreground">
            No trainees found for this venue yet.
          </div>
        )}

        {!loading && !error && traineeCards.length > 0 && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {traineeCards.map(({ trainee, stats }) => (
              <div key={trainee.userId} className="rounded-lg border border-border bg-background/40 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {trainee.firstName[0]}{trainee.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-foreground">{trainee.firstName} {trainee.lastName}</p>
                      <p className="text-xs text-muted-foreground">{trainee.email}</p>
                    </div>
                  </div>
                  <Badge className={stats.atRisk ? "bg-amber-500/20 text-amber-300 border-0" : "bg-emerald-500/20 text-emerald-300 border-0"}>
                    Lv.{stats.level}
                  </Badge>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Overall Progress</span>
                    <span>{stats.completedLessons}/{TRAINEE_TOTAL_LESSONS} lessons ({stats.progressPercent.toFixed(0)}%)</span>
                  </div>
                  <Progress value={stats.progressPercent} className="h-2" />
                  <p className="text-[11px] text-muted-foreground">
                    Modules mastered: {stats.completedModules}/{TRAINEE_MODULE_META.length} · Last activity: {formatLastActive(trainee.lastCompletedAt)}
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Module Breakdown</p>
                  <div className="grid grid-cols-1 gap-2 max-h-44 overflow-y-auto pr-1">
                    {stats.moduleStats.map((module) => (
                      <div key={`${trainee.userId}-${module.id}`} className="rounded-md border border-border/80 p-2">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-foreground">{module.title}</span>
                          <span className="text-muted-foreground">
                            {module.completed}/{module.totalLessons}
                          </span>
                        </div>
                        <Progress value={module.percent} className="h-1.5" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────

export default function ManagerDashboard() {
  const { selectedVenue } = useVenue();
  const [traineeProgress, setTraineeProgress] = useState<TraineeLearningProgress[]>([]);
  const [learningLoading, setLearningLoading] = useState(true);
  const [learningError, setLearningError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadTraineeProgress = async () => {
      setLearningLoading(true);
      setLearningError(null);
      const response = await getTraineeLearningProgress(selectedVenue?.id);

      if (!isMounted) return;

      if (response.success && response.data) {
        setTraineeProgress(response.data);
      } else {
        setTraineeProgress([]);
        setLearningError(response.error || "Failed to load trainee learning progress");
      }
      setLearningLoading(false);
    };

    void loadTraineeProgress();
    const intervalId = window.setInterval(() => {
      void loadTraineeProgress();
    }, 30000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, [selectedVenue?.id]);

  return (
    <div className="space-y-6">
       {/* Header */}
       <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <ChefHat className="h-6 w-6 text-slate-400" />
            Manager Station
          </h1>
          <p className="text-slate-400">Monday, Feb 9 • Evening Shift • <span className="text-emerald-400 font-medium">Live Service</span></p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2"><Search className="h-4 w-4" /> Find Booking</Button>
          <Button className="bg-violet-600 hover:bg-violet-700 gap-2"><Plus className="h-4 w-4" /> New Walk-in</Button>
        </div>
      </div>

      {/* Top Level Stats */}
      <KPITicker />

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
         
         {/* Left Column: Floor & Flow (4 cols) */}
         <div className="lg:col-span-4 space-y-6 h-full">
            <FloorPulseWidget />
         </div>

         {/* Center Column: Roster & Alerts (4 cols) */}
         <div className="lg:col-span-4 space-y-6 h-full">
            <RosterAndAlerts />
         </div>

         {/* Right Column: Manager Tools (4 cols) */}
         <div className="lg:col-span-4 space-y-6 h-full">
            <ManagerTools />
         </div>

      </div>

      <LearningProgressTracker
        trainees={traineeProgress}
        loading={learningLoading}
        error={learningError}
      />
    </div>
  );
}
