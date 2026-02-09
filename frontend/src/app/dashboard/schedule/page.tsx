"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Sparkles,
  Users,
  Send,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { weeklyShifts, staff } from "@/lib/mock-data";

// Days of the week
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Shift colors by role
const roleColors: Record<string, string> = {
  MANAGER: "bg-purple-500",
  STAFF: "bg-blue-500",
  TRAINEE: "bg-green-500",
};

export default function SchedulePage() {
  const [currentWeek, setCurrentWeek] = useState(0);

  // Get week dates
  const getWeekDates = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1 + currentWeek * 7);

    return days.map((_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      return {
        day: days[i],
        date: date.getDate(),
        month: date.toLocaleDateString("en-US", { month: "short" }),
        isToday: date.toDateString() === today.toDateString(),
      };
    });
  };

  const weekDates = getWeekDates();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Shift Schedule</h1>
          <p className="text-muted-foreground">Plan and manage your team&apos;s shifts</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <Sparkles className="h-4 w-4" />
            Auto-Schedule AI
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Shift
          </Button>
        </div>
      </div>

      {/* Week Navigation */}
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
            {weekDates[0].month} {weekDates[0].date} - {weekDates[6].month} {weekDates[6].date}
          </h2>
          <p className="text-sm text-muted-foreground">
            {currentWeek === 0 ? "This Week" : currentWeek > 0 ? `+${currentWeek} weeks` : `${currentWeek} weeks`}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentWeek(currentWeek + 1)}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Schedule Grid */}
      <Card>
        <CardContent className="p-0">
          <div className="grid grid-cols-7 border-b border-border">
            {weekDates.map((d, i) => (
              <div
                key={i}
                className={`p-4 text-center border-r last:border-r-0 border-border ${
                  d.isToday ? "bg-primary/10" : ""
                }`}
              >
                <p className="text-xs text-muted-foreground uppercase">{d.day}</p>
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

          {/* Shift Blocks */}
          <div className="grid grid-cols-7 min-h-[400px]">
            {weeklyShifts.map((day, dayIndex) => (
              <div
                key={dayIndex}
                className="border-r last:border-r-0 border-border p-2 space-y-2"
              >
                {day.shifts.length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  day.shifts.map((shift, shiftIndex) => (
                    <motion.div
                      key={shiftIndex}
                      className="bg-slate-800 rounded-lg p-3 cursor-pointer hover:bg-slate-700 transition-colors"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: dayIndex * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-center gap-1 mb-2">
                        <Badge variant="secondary" className="text-xs">
                          {shift.type}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        {shift.staff.map((name, staffIndex) => {
                          const staffMember = staff.find(
                            (s) => s.firstName === name
                          );
                          return (
                            <div
                              key={staffIndex}
                              className="flex items-center gap-2"
                            >
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  roleColors[staffMember?.role || "STAFF"]
                                }`}
                              />
                              <span className="text-xs text-foreground truncate">
                                {name}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            ))}
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
                <p className="text-2xl font-bold text-foreground">142h</p>
                <p className="text-sm text-muted-foreground">Total Hours</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <span className="text-2xl">€</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">€2,840</p>
                <p className="text-sm text-muted-foreground">Estimated Cost</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <Send className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Schedule Status</p>
                <p className="font-medium text-foreground">Draft</p>
              </div>
            </div>
            <Button size="sm">Publish</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
