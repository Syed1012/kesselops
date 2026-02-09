"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  GraduationCap,
  BookOpen,
  CheckCircle2,
  Lock,
  Star,
  ArrowRight,
  Trophy,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trainingModules, recipes } from "@/lib/mock-data";

export default function LearnPage() {
  const [selectedRecipe, setSelectedRecipe] = useState<string | null>(null);

  // Calculate overall progress
  const totalLessons = trainingModules.reduce((sum, m) => sum + m.totalLessons, 0);
  const completedLessons = trainingModules.reduce((sum, m) => sum + m.completedLessons, 0);
  const overallProgress = (completedLessons / totalLessons) * 100;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Learning Center</h1>
        <p className="text-muted-foreground">Complete training modules and earn badges</p>
      </div>

      {/* Progress Overview */}
      <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/20">
        <CardContent className="pt-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                <Trophy className="h-8 w-8 text-yellow-500" />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                Lv.3
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-1">Training Progress</h3>
              <div className="h-3 bg-muted rounded-full overflow-hidden mb-2">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${overallProgress}%` }}
                  transition={{ duration: 1 }}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                {completedLessons}/{totalLessons} lessons completed ({overallProgress.toFixed(0)}%)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Training Modules */}
      <div>
        <h2 className="font-semibold text-foreground mb-4">Training Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {trainingModules.map((module, i) => (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="h-full hover:border-primary/30 transition-colors cursor-pointer group">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">{module.badge}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">{module.title}</h3>
                        {module.progress === 100 && (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {module.completedLessons}/{module.totalLessons} lessons
                      </p>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full ${
                            module.progress === 100
                              ? "bg-green-500"
                              : "bg-gradient-to-r from-orange-500 to-yellow-500"
                          }`}
                          initial={{ width: 0 }}
                          animate={{ width: `${module.progress}%` }}
                          transition={{ delay: i * 0.1 + 0.5 }}
                        />
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={module.progress === 100 ? "outline" : "default"}
                      className="shrink-0"
                    >
                      {module.progress === 100 ? "Review" : "Continue"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recipe Cards */}
      <div>
        <h2 className="font-semibold text-foreground mb-4">Recipe Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recipes.map((recipe, i) => (
            <motion.div
              key={recipe.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card
                className="cursor-pointer hover:border-primary/30 transition-colors"
                onClick={() => setSelectedRecipe(selectedRecipe === recipe.id ? null : recipe.id)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-foreground">{recipe.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {recipe.glass} • {recipe.method}
                      </p>
                    </div>
                    <Badge variant="secondary">{recipe.garnish}</Badge>
                  </div>

                  {selectedRecipe === recipe.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="border-t border-border pt-4 mt-4"
                    >
                      <h4 className="font-medium text-foreground mb-2">Ingredients</h4>
                      <ul className="space-y-1 mb-4">
                        {recipe.ingredients.map((ing, j) => (
                          <li key={j} className="text-sm text-muted-foreground">
                            • {ing.amount} {ing.name}
                          </li>
                        ))}
                      </ul>
                      <h4 className="font-medium text-foreground mb-2">Method</h4>
                      <p className="text-sm text-muted-foreground">{recipe.instructions}</p>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
