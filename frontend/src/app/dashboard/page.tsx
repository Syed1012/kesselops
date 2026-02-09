"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Package,
  ClipboardCheck,
  Users as UsersIcon,
  Sparkles,
  ArrowRight,
  Clock,
  Calendar,
  DollarSign,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { revenueData, alerts, todaysShift, tasks, reservations, currentVenue } from "@/lib/mock-data";

// Revenue Card
function RevenueCard() {
  const percentOfTarget = (revenueData.today / revenueData.target) * 100;
  const vsYesterday = ((revenueData.today - revenueData.yesterday) / revenueData.yesterday) * 100;

  return (
    <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-orange-500" />
          Today&apos;s Revenue
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between mb-4">
          <div>
            <motion.p
              className="text-4xl font-bold text-foreground"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              €{revenueData.today.toLocaleString("de-DE", { minimumFractionDigits: 2 })}
            </motion.p>
            <p className="text-sm text-muted-foreground">
              Target: €{revenueData.target.toLocaleString("de-DE")}
            </p>
          </div>
          <div className={`flex items-center gap-1 text-sm ${vsYesterday >= 0 ? "text-green-500" : "text-red-500"}`}>
            {vsYesterday >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            {Math.abs(vsYesterday).toFixed(1)}% vs yesterday
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-orange-500 to-orange-400"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(percentOfTarget, 100)}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1">{percentOfTarget.toFixed(0)}% of daily target</p>
      </CardContent>
    </Card>
  );
}

// Alerts Card
function AlertsCard() {
  const getAlertIcon = (category: string) => {
    switch (category) {
      case "inventory":
        return <Package className="h-4 w-4" />;
      case "tasks":
        return <ClipboardCheck className="h-4 w-4" />;
      case "staff":
        return <UsersIcon className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <span className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Alerts
          </span>
          <Badge variant="warning">{alerts.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map((alert, i) => (
          <motion.div
            key={alert.id}
            className={`flex items-start gap-3 p-3 rounded-lg ${
              alert.type === "danger" ? "bg-danger/10" : "bg-warning/10"
            }`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <span className={alert.type === "danger" ? "text-danger" : "text-warning"}>
              {getAlertIcon(alert.category)}
            </span>
            <p className="text-sm text-foreground">{alert.message}</p>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}

// Shift Status Card
function ShiftStatusCard() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-500" />
          Current Shift
        </CardTitle>
        <CardDescription>
          {todaysShift.type} • {todaysShift.startTime} - {todaysShift.endTime}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {todaysShift.staff.map((member, i) => (
            <motion.div
              key={member.id}
              className="flex items-center justify-between"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar fallback={`${member.firstName[0]}${member.lastName[0]}`} />
                  <span
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card ${
                      member.status === "ACTIVE" ? "bg-green-500" : "bg-yellow-500"
                    }`}
                  />
                </div>
                <div>
                  <p className="font-medium text-sm text-foreground">
                    {member.firstName} {member.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">{member.role}</p>
                </div>
              </div>
              <Badge variant={member.status === "ACTIVE" ? "success" : "warning"}>
                {member.status === "ACTIVE" ? "Clocked In" : "Pending"}
              </Badge>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// AI Insight Card
function AIInsightCard() {
  return (
    <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/5 border-purple-500/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          AI Insight
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-foreground mb-4">
          &quot;Friday nights typically peak at 22:00. You have <strong>2 bookings pending</strong> confirmation.
          Consider adding 1 extra runner for the VIP event at 18:00.&quot;
        </p>
        <Button variant="outline" size="sm" className="w-full">
          View Recommendations
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}

// Tasks Overview Card
function TasksOverviewCard() {
  const completedTasks = tasks.filter((t) => t.completed).length;
  const totalTasks = tasks.length;
  const progress = (completedTasks / totalTasks) * 100;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <span className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-green-500" />
            Today&apos;s Tasks
          </span>
          <span className="text-sm font-normal text-muted-foreground">
            {completedTasks}/{totalTasks}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Progress Ring */}
        <div className="flex items-center gap-4 mb-4">
          <div className="relative w-16 h-16">
            <svg className="w-16 h-16 transform -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                className="text-muted"
              />
              <motion.circle
                cx="32"
                cy="32"
                r="28"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
                className="text-green-500"
                initial={{ strokeDasharray: "0 176" }}
                animate={{ strokeDasharray: `${(progress / 100) * 176} 176` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold">
              {progress.toFixed(0)}%
            </span>
          </div>
          <div className="flex-1">
            <p className="font-medium text-foreground">{completedTasks} Completed</p>
            <p className="text-sm text-muted-foreground">{totalTasks - completedTasks} remaining</p>
          </div>
        </div>

        <Button variant="outline" size="sm" className="w-full">
          View All Tasks
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}

// Reservations Card
function ReservationsCard() {
  const todaysReservations = reservations.filter((r) => r.date === "2026-02-09");

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-500" />
            Today&apos;s Reservations
          </span>
          <Badge variant="secondary">{todaysReservations.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {todaysReservations.map((res, i) => (
          <motion.div
            key={res.id}
            className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div>
              <p className="font-medium text-sm text-foreground">{res.guestName}</p>
              <p className="text-xs text-muted-foreground">
                {res.time} • {res.partySize} guests {res.table && `• ${res.table}`}
              </p>
            </div>
            <Badge variant={res.status === "CONFIRMED" ? "success" : "warning"}>
              {res.status}
            </Badge>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}

// Main Dashboard Page
export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Demo Role Switcher */}
      <div className="p-4 bg-violet-500/10 border border-violet-500/20 rounded-xl mb-4">
        <p className="text-sm text-violet-300 mb-3 font-medium">👀 Demo Mode: View as...</p>
        <div className="flex flex-wrap gap-2">
          <Link href="/dashboard/owner">
            <Button size="sm" variant="outline" className="border-violet-500/30 text-violet-300 hover:bg-violet-500/20">Owner</Button>
          </Link>
          <Link href="/dashboard/manager">
            <Button size="sm" variant="outline" className="border-violet-500/30 text-violet-300 hover:bg-violet-500/20">Manager</Button>
          </Link>
          <Link href="/dashboard/staff">
            <Button size="sm" variant="outline" className="border-violet-500/30 text-violet-300 hover:bg-violet-500/20">Staff</Button>
          </Link>
          <Link href="/dashboard/trainee">
            <Button size="sm" variant="outline" className="border-violet-500/30 text-violet-300 hover:bg-violet-500/20">Trainee</Button>
          </Link>
        </div>
      </div>

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Good Evening, Max! 👋</h1>
        <p className="text-muted-foreground">
          Here&apos;s what&apos;s happening at {currentVenue.name} today.
        </p>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Revenue - Full width on mobile, 2 cols on desktop */}
        <div className="lg:col-span-2 xl:col-span-1">
          <RevenueCard />
        </div>

        {/* Alerts */}
        <AlertsCard />

        {/* Shift Status */}
        <ShiftStatusCard />

        {/* Tasks Overview */}
        <TasksOverviewCard />

        {/* Reservations */}
        <ReservationsCard />

        {/* AI Insight */}
        <AIInsightCard />
      </div>
    </div>
  );
}
