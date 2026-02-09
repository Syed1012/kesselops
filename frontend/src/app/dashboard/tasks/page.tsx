"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Circle,
  Camera,
  Hash,
  Clock,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { tasks } from "@/lib/mock-data";

// Task type icons
const typeIcons: Record<string, React.ReactNode> = {
  checkbox: <CheckCircle2 className="h-5 w-5" />,
  photo: <Camera className="h-5 w-5" />,
  input: <Hash className="h-5 w-5" />,
};

// Group tasks by category
const groupedTasks = tasks.reduce(
  (acc, task) => {
    if (!acc[task.category]) acc[task.category] = [];
    acc[task.category].push(task);
    return acc;
  },
  {} as Record<string, typeof tasks>
);

export default function TasksPage() {
  const [taskState, setTaskState] = useState<Record<string, boolean>>(
    tasks.reduce((acc, t) => ({ ...acc, [t.id]: t.completed }), {})
  );

  const toggleTask = (id: string) => {
    setTaskState((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const completedCount = Object.values(taskState).filter(Boolean).length;
  const totalCount = tasks.length;
  const progress = (completedCount / totalCount) * 100;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Today&apos;s Tasks</h1>
        <p className="text-muted-foreground">Complete your shift tasks</p>
      </div>

      {/* Progress Card */}
      <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20">
              <svg className="w-20 h-20 transform -rotate-90">
                <circle
                  cx="40"
                  cy="40"
                  r="35"
                  stroke="currentColor"
                  strokeWidth="6"
                  fill="none"
                  className="text-muted"
                />
                <motion.circle
                  cx="40"
                  cy="40"
                  r="35"
                  stroke="currentColor"
                  strokeWidth="6"
                  fill="none"
                  strokeLinecap="round"
                  className="text-green-500"
                  initial={{ strokeDasharray: "0 220" }}
                  animate={{ strokeDasharray: `${(progress / 100) * 220} 220` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-foreground">
                {progress.toFixed(0)}%
              </span>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {completedCount}/{totalCount}
              </p>
              <p className="text-muted-foreground">Tasks Completed</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Task Categories */}
      <div className="space-y-6">
        {Object.entries(groupedTasks).map(([category, categoryTasks]) => {
          const categoryCompleted = categoryTasks.filter((t) => taskState[t.id]).length;
          return (
            <div key={category}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-foreground">{category}</h2>
                <Badge variant="secondary">
                  {categoryCompleted}/{categoryTasks.length}
                </Badge>
              </div>
              <div className="space-y-2">
                {categoryTasks.map((task, i) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Card
                      className={`cursor-pointer transition-all ${
                        taskState[task.id] ? "bg-green-500/5 border-green-500/20" : ""
                      }`}
                      onClick={() => toggleTask(task.id)}
                    >
                      <CardContent className="py-4 flex items-center gap-4">
                        {/* Checkbox */}
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                            taskState[task.id]
                              ? "bg-green-500 border-green-500 text-white"
                              : "border-muted-foreground"
                          }`}
                        >
                          {taskState[task.id] && <CheckCircle2 className="h-4 w-4" />}
                        </div>

                        {/* Task Info */}
                        <div className="flex-1">
                          <p
                            className={`font-medium ${
                              taskState[task.id] ? "line-through text-muted-foreground" : "text-foreground"
                            }`}
                          >
                            {task.title}
                          </p>
                          {task.value && (
                            <p className="text-sm text-muted-foreground">
                              Value: {task.value}
                            </p>
                          )}
                        </div>

                        {/* Type Icon */}
                        <div className="text-muted-foreground">
                          {typeIcons[task.type] || <Circle className="h-5 w-5" />}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Submit Button */}
      <div className="fixed bottom-20 lg:bottom-6 left-0 right-0 p-4 lg:pl-64 bg-gradient-to-t from-background to-transparent">
        <div className="max-w-4xl mx-auto">
          <Button size="lg" className="w-full" disabled={completedCount < totalCount}>
            <Clock className="h-4 w-4 mr-2" />
            {completedCount < totalCount
              ? `Complete ${totalCount - completedCount} remaining tasks`
              : "Submit Shift Checklist"}
          </Button>
        </div>
      </div>
    </div>
  );
}
