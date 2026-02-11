"use client";

import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Trophy,
  BookOpen,
  Briefcase,
  ChevronDown,
  Sparkles
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { trainingModules, recipes } from "@/lib/mock-data";
import { getLearningProgress, type LearningProgressMap } from "@/lib/api";
import { AIChatPanel } from "@/components/AIChatPanel";

type LearnRole = "STAFF" | "CHEF" | "MANAGER";

type ModuleProgress = {
  completedLessons: number;
  totalLessons: number;
  percent: number;
  completedModule: boolean;
};

function getModuleLessonTotal(module: any): number {
  const chapterCount = Array.isArray(module.chapters) ? module.chapters.length : 0;
  return chapterCount > 0 ? chapterCount : module.totalLessons;
}

function getSavedChapterIds(moduleId: string): string[] {
  try {
    const saved = localStorage.getItem(`kesselops-progress-${moduleId}`);
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function getLocalProgressMap(): LearningProgressMap {
  const map: LearningProgressMap = {};
  trainingModules.forEach((module) => {
    map[module.id] = getSavedChapterIds(module.id);
  });
  return map;
}

function buildProgressSnapshot(progressByModule: LearningProgressMap): Record<string, ModuleProgress> {
  const snapshot: Record<string, ModuleProgress> = {};

  trainingModules.forEach((module) => {
    const totalLessons = getModuleLessonTotal(module);
    const savedIds = progressByModule[module.id] || [];

    // Keep only known chapter IDs and de-duplicate to avoid invalid counts.
    const validChapterIds = new Set(
      savedIds.filter((id) => module.chapters?.some((chapter: any) => chapter.id === id))
    );

    const completedLessons = Math.min(validChapterIds.size, totalLessons);
    const percent = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

    snapshot[module.id] = {
      completedLessons,
      totalLessons,
      percent,
      completedModule: totalLessons > 0 && completedLessons >= totalLessons,
    };
  });

  return snapshot;
}

export default function LearnPage() {
  const [selectedRole, setSelectedRole] = useState<LearnRole>("STAFF");
  const [progressData, setProgressData] = useState<Record<string, ModuleProgress>>({});

  useEffect(() => {
    let isMounted = true;

    const refreshProgress = async () => {
      const fallbackProgress = getLocalProgressMap();
      const response = await getLearningProgress();

      let rawProgress: LearningProgressMap = fallbackProgress;
      if (response.success && response.data) {
        rawProgress = { ...fallbackProgress, ...response.data };
      }

      if (isMounted) {
        setProgressData(buildProgressSnapshot(rawProgress));
      }
    };

    const handleRefresh = () => {
      void refreshProgress();
    };

    void refreshProgress();
    window.addEventListener("focus", handleRefresh);
    window.addEventListener("storage", handleRefresh);
    window.addEventListener("kesselops:learn-progress-updated", handleRefresh as EventListener);

    return () => {
      isMounted = false;
      window.removeEventListener("focus", handleRefresh);
      window.removeEventListener("storage", handleRefresh);
      window.removeEventListener("kesselops:learn-progress-updated", handleRefresh as EventListener);
    };
  }, []);

  // Filter modules based on selected role
  const filteredModules = useMemo(() => {
    return trainingModules.filter(module => 
      module.roles.includes(selectedRole)
    );
  }, [selectedRole]);

  const filteredModuleProgress = useMemo(
    () =>
      filteredModules.map((module) => {
        return (
          progressData[module.id] ?? {
            completedLessons: 0,
            totalLessons: getModuleLessonTotal(module),
            percent: 0,
            completedModule: false,
          }
        );
      }),
    [filteredModules, progressData]
  );

  const totalLessons = useMemo(
    () => filteredModuleProgress.reduce((sum, module) => sum + module.totalLessons, 0),
    [filteredModuleProgress]
  );

  const completedLessons = useMemo(
    () => filteredModuleProgress.reduce((sum, module) => sum + module.completedLessons, 0),
    [filteredModuleProgress]
  );

  const overallProgress = useMemo(() => {
    if (totalLessons === 0) return 0;
    return (completedLessons / totalLessons) * 100;
  }, [completedLessons, totalLessons]);

  const completedModules = useMemo(
    () => filteredModuleProgress.filter((module) => module.completedModule).length,
    [filteredModuleProgress]
  );

  // Rule: each fully completed module gives one level.
  const currentLevel = completedModules;

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
                Lv.{currentLevel}
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
                {completedLessons}/{totalLessons} lessons completed ({overallProgress.toFixed(0)}%) · {completedModules}/{filteredModules.length} modules mastered
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
                        {filteredModules.map((module, i) => {
                          const moduleProgress =
                            progressData[module.id] ?? {
                              completedLessons: 0,
                              totalLessons: getModuleLessonTotal(module),
                              percent: 0,
                              completedModule: false,
                            };

                          return (
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
                                          {moduleProgress.completedModule && (
                                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                                          )}
                                        </div>
                                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                          {/* @ts-ignore - description exists in new data */}
                                          {module.description || `${module.completedLessons}/${module.totalLessons} lessons`}
                                        </p>
                                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                                          <span>{moduleProgress.completedLessons}/{moduleProgress.totalLessons} lessons</span>
                                          <span>{moduleProgress.percent.toFixed(0)}%</span>
                                        </div>
                                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                                          <motion.div
                                            className={`h-full ${
                                              moduleProgress.completedModule
                                                ? "bg-green-500"
                                                : "bg-gradient-to-r from-orange-500 to-yellow-500"
                                            }`}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${moduleProgress.percent}%` }}
                                            transition={{ delay: i * 0.1 + 0.5 }}
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              </motion.div>
                            </Link>
                          );
                        })}
                        </div>
                    )}
                </div>

                {/* Recipe Cards */}
                <div>
                    <h2 className="font-semibold text-foreground mb-4">Signature Recipes & Standards</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recipes.map((recipe, i) => {
                        // @ts-ignore - new fields are in mock data
                        const isSignature = recipe.isSignature;
                        // @ts-ignore
                        const category = recipe.category;
                        // @ts-ignore
                        const difficulty = recipe.difficulty;

                        return (
                        <Dialog key={recipe.id}>
                          <DialogTrigger asChild>
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: i * 0.05 }}
                              className="h-full"
                            >
                              <div className={`
                                group relative h-full rounded-xl overflow-hidden cursor-pointer transition-all duration-300
                                border bg-card hover:shadow-xl
                                ${isSignature ? 'border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.1)]' : 'border-border/50 hover:border-primary/30'}
                              `}>
                                {/* Card Internal Gradient (Subtle) */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${isSignature ? 'from-amber-500/5 via-transparent to-transparent' : 'from-primary/5 via-transparent to-transparent'} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                                <CardContent className="p-6 h-full flex flex-col relative z-10">
                                  {/* Header: Badges & Name */}
                                  <div className="flex justify-between items-start mb-4">
                                      <div className="space-y-1">
                                          <div className="flex gap-2 mb-2">
                                              {isSignature && (
                                                  <Badge variant="default" className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-sm text-[10px] uppercase tracking-wider font-bold">
                                                      Signature
                                                  </Badge>
                                              )}
                                              <Badge variant="secondary" className="text-[10px] uppercase tracking-wider font-medium text-muted-foreground bg-muted/50">
                                                  {category}
                                              </Badge>
                                          </div>
                                          <h3 className={`font-bold text-xl leading-tight group-hover:text-primary transition-colors ${isSignature ? 'text-amber-500' : 'text-foreground'}`}>
                                              {recipe.name}
                                          </h3>
                                      </div>
                                      <div className="flex flex-col items-end text-xs text-muted-foreground font-mono bg-muted/30 p-2 rounded-lg border border-border/50">
                                          <span>{recipe.glass}</span>
                                          <span className="font-semibold text-foreground">{recipe.method}</span>
                                      </div>
                                  </div>

                                  {/* Divider */}
                                  <div className="w-full h-px bg-border/40 my-2" />

                                  {/* Quick glance details */}
                                  <div className="flex-1 space-y-3 mt-2">
                                      <div className="flex justify-between text-sm">
                                          <span className="text-muted-foreground">Difficulty</span>
                                          <span className={`font-medium ${
                                              difficulty === 'Hard' ? 'text-red-400' : 
                                              difficulty === 'Medium' ? 'text-blue-400' : 'text-green-400'
                                          }`}>
                                              {difficulty}
                                          </span>
                                      </div>
                                      <div className="flex justify-between text-sm">
                                          <span className="text-muted-foreground">Garnish</span>
                                          <span className="text-foreground text-right max-w-[60%] truncate">{recipe.garnish}</span>
                                      </div>
                                  </div>

                                  {/* Footer Hint */}
                                  <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground group-hover:text-primary transition-colors">
                                      <div className="w-full h-px bg-current opacity-20 flex-1" />
                                      <span>View Recipe</span>
                                  </div>
                                </CardContent>
                              </div>
                            </motion.div>
                          </DialogTrigger>

                          {/* Simplified Premium Modal */}
                          <DialogContent className="max-w-2xl bg-card/95 backdrop-blur-xl border-border shadow-2xl p-0 overflow-hidden">
                            {/* Modal Header */}
                            <div className={`p-6 border-b ${isSignature ? 'bg-gradient-to-r from-amber-950/20 to-transparent' : 'bg-muted/30'}`}>
                                <div className="flex items-center gap-2 mb-2">
                                     {isSignature && <Sparkles className="h-4 w-4 text-amber-500" />}
                                     <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">{category} Recipe</span>
                                </div>
                                <DialogTitle className="text-3xl font-bold mb-2">{recipe.name}</DialogTitle>
                                <DialogDescription className="text-base flex items-center gap-4">
                                    <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-primary" /> {recipe.glass}</span>
                                    <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-primary" /> {recipe.method}</span>
                                    <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-primary" /> {recipe.garnish}</span>
                                </DialogDescription>
                            </div>
                            
                            <div className="p-6 space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Left: Ingredients */}
                                    <div className="space-y-4">
                                        <h4 className="font-semibold text-lg flex items-center gap-2 text-primary">
                                            Ingredients
                                        </h4>
                                        <ul className="space-y-3">
                                            {recipe.ingredients.map((ing, j) => (
                                            <li key={j} className="flex justify-between items-center text-sm p-3 bg-muted/30 rounded-lg border border-border/50">
                                                <span className="font-medium">{ing.name}</span>
                                                <span className="text-muted-foreground font-mono bg-background px-2 py-0.5 rounded border text-xs">{ing.amount}</span>
                                            </li>
                                            ))}
                                        </ul>
                                    </div>
                                    
                                    {/* Right: Instructions */}
                                    <div className="space-y-4">
                                        <h4 className="font-semibold text-lg flex items-center gap-2 text-primary">
                                            Preparation
                                        </h4>
                                        <div className="text-sm leading-relaxed space-y-4 text-muted-foreground">
                                            {recipe.instructions.split('. ').map((step, idx) => (
                                                step.trim() && (
                                                    <div key={idx} className="flex gap-3">
                                                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold mt-0.5">{idx + 1}</span>
                                                        <p>{step.trim()}{!step.endsWith('.') && '.'}</p>
                                                    </div>
                                                )
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Action */}
                                <div className="pt-6 border-t flex items-center justify-between bg-muted/10 -mx-6 -mb-6 p-6">
                                    <p className="text-sm text-muted-foreground italic">
                                        Tip: Always taste before serving to ensure quality.
                                    </p>
                                    <Button 
                                        size="lg"
                                        onClick={() => {
                                        window.dispatchEvent(new CustomEvent('kesselops:open-ai-mentor', { 
                                            detail: { message: `I have a question about the ${recipe.name} recipe.` }
                                        }));
                                        }}
                                        className="gap-2 shadow-lg hover:shadow-xl transition-all"
                                    >
                                        <Sparkles className="h-4 w-4" />
                                        Ask AI Assistant
                                    </Button>
                                </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                    );
                    })}
                    </div>
                </div>
          </div>
      </div>
    </div>
  );
}
