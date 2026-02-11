"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Trophy,
  BookOpen,
  Briefcase,
  ChevronDown
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { trainingModules, recipes } from "@/lib/mock-data";

export default function LearnPage() {
  const [selectedRecipe, setSelectedRecipe] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<"STAFF" | "CHEF" | "MANAGER">("STAFF");

  // Calculate overall progress based on ALL modules (or could be scoped to role)
  const totalLessons = trainingModules.reduce((sum, m) => sum + m.totalLessons, 0);
  const completedLessons = trainingModules.reduce((sum, m) => sum + m.completedLessons, 0);
  const overallProgress = (completedLessons / totalLessons) * 100;

  // Filter modules based on selected role
  const filteredModules = useMemo(() => {
    return trainingModules.filter(module => 
      module.roles.includes(selectedRole)
    );
  }, [selectedRole]);

  const roleLabels = {
    "STAFF": "Waitstaff / Service",
    "CHEF": "Kitchen / Chef",
    "MANAGER": "Management"
  };

  return (
    <div className="space-y-6 relative pb-20">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Learning Center</h1>
          <p className="text-muted-foreground">Master your skills with AI-powered guidance</p>
        </div>

        {/* Role Selector Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-[200px] justify-between">
              <span className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                {roleLabels[selectedRole]}
              </span>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            <DropdownMenuItem onClick={() => setSelectedRole("STAFF")}>
              Waitstaff / Service
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelectedRole("CHEF")}>
              Kitchen / Chef
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelectedRole("MANAGER")}>
              Management
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Progress Overview */}
      <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/20">
        <CardContent className="pt-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center border-4 border-background shadow-lg">
                <Trophy className="h-8 w-8 text-yellow-500" />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
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

      {/* Main Content Grid - Full Width */}
      <div className="grid grid-cols-1 gap-6">
          
          {/* Training Modules & Recipes Section */}
          <div className="space-y-6">
                {/* Training Modules */}
                <div>
                    <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-primary" /> 
                        Training Modules ({filteredModules.length})
                    </h2>
                    
                    {filteredModules.length === 0 ? (
                        <div className="text-center py-10 border rounded-lg bg-muted/20">
                            <p className="text-muted-foreground">No training modules available for this role yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredModules.map((module, i) => (
                            <Link href={`/dashboard/learn/${module.id}`} key={module.id}>
                                <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                >
                                <Card className="h-full hover:border-primary/50 transition-all cursor-pointer group hover:shadow-lg hover:shadow-primary/5">
                                    <CardContent className="pt-6">
                                    <div className="flex items-start gap-4">
                                        <div className="text-4xl group-hover:scale-110 transition-transform duration-300">{module.badge}</div>
                                        <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{module.title}</h3>
                                            {module.progress === 100 && (
                                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                            {/* @ts-ignore - description exists in new data */}
                                            {module.description || `${module.completedLessons}/${module.totalLessons} lessons`}
                                        </p>
                                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                                            <span>{module.completedLessons}/{module.totalLessons} lessons</span>
                                            <span>{module.progress}%</span>
                                        </div>
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
                                    </div>
                                    </CardContent>
                                </Card>
                                </motion.div>
                            </Link>
                        ))}
                        </div>
                    )}
                </div>

                {/* Recipe Cards - Only show for relevant roles if needed, kept for now */}
                <div>
                    <h2 className="font-semibold text-foreground mb-4">Recipe Cards</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recipes.map((recipe, i) => (
                        <motion.div
                        key={recipe.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        >
                        <Card
                            className={`cursor-pointer transition-all ${selectedRecipe === recipe.id ? 'border-primary ring-1 ring-primary' : 'hover:border-primary/30'}`}
                            onClick={() => setSelectedRecipe(selectedRecipe === recipe.id ? null : recipe.id)}
                        >
                            <CardContent className="pt-6">
                            <div className="flex items-center justify-between mb-2">
                                <div>
                                <h3 className="font-semibold text-foreground">{recipe.name}</h3>
                                <p className="text-sm text-muted-foreground">
                                    {recipe.glass} • {recipe.method}
                                </p>
                                </div>
                                <Badge variant="secondary">{recipe.garnish}</Badge>
                            </div>

                            <AnimatePresence>
                                {selectedRecipe === recipe.id && (
                                    <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="border-t border-border pt-4 mt-4 overflow-hidden"
                                    >
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Ingredients</h4>
                                            <ul className="space-y-1">
                                                {recipe.ingredients.map((ing, j) => (
                                                <li key={j} className="text-sm text-foreground flex justify-between">
                                                    <span>{ing.name}</span>
                                                    <span className="text-muted-foreground">{ing.amount}</span>
                                                </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Method</h4>
                                            <p className="text-sm text-foreground">{recipe.instructions}</p>
                                        </div>
                                    </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            </CardContent>
                        </Card>
                        </motion.div>
                    ))}
                    </div>
                </div>
          </div>
      </div>
    </div>
  );
}

