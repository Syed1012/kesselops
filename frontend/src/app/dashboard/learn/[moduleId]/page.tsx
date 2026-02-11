"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from 'next/dynamic';
import {
  ArrowLeft,
  CheckCircle2,
  PlayCircle,
  MessageSquare,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { trainingModules } from "@/lib/mock-data";
import { getLearningProgress, updateLearningModuleProgress } from "@/lib/api";
import { AIChatPanel } from "@/components/AIChatPanel";

// Dynamic import for ReactPlayer to avoid SSR issues
const ReactPlayer = dynamic(() => import("react-player"), { ssr: false }) as any;

type QuizResult = {
  score: number;
  total: number;
  percent: number;
  passed: boolean;
};

export default function CoursePlayerPage() {
  const params = useParams();
  const router = useRouter();
  const moduleId = params.moduleId as string;

  const [module, setModule] = useState<any>(null);
  const [activeChapter, setActiveChapter] = useState<string | null>(null);
  const [showAiChat, setShowAiChat] = useState(false);
  
  // Progress State
  const [completedChapters, setCompletedChapters] = useState<string[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [isProgressReady, setIsProgressReady] = useState(false);
  const hasInitializedProgress = useRef(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);

  useEffect(() => {
    let isMounted = true;
    setIsClient(true);
    setIsProgressReady(false);
    setCompletedChapters([]);
    hasInitializedProgress.current = false;

    // Find module and init
    const foundModule = trainingModules.find(m => m.id === moduleId);
    if (!foundModule) {
      if (isMounted) {
        setModule(null);
        setIsProgressReady(true);
      }
      return () => {
        isMounted = false;
      };
    }

    setModule(foundModule);
    if (foundModule.chapters?.length > 0) {
      setActiveChapter(foundModule.chapters[0].id);
    }

    const loadProgress = async () => {
      let resolvedChapters: string[] = [];
      let shouldBackfillServer = false;
      const progressResponse = await getLearningProgress();
      const localSavedRaw = localStorage.getItem(`kesselops-progress-${moduleId}`);
      let localSaved: string[] = [];

      if (localSavedRaw) {
        try {
          const parsed = JSON.parse(localSavedRaw);
          localSaved = Array.isArray(parsed) ? parsed : [];
        } catch {
          localSaved = [];
        }
      }

      if (progressResponse.success && progressResponse.data) {
        const savedForModule = progressResponse.data[moduleId];
        if (Array.isArray(savedForModule)) {
          resolvedChapters = savedForModule;
        } else if (localSaved.length > 0) {
          // One-time migration path: user has local progress from previous builds.
          resolvedChapters = localSaved;
          shouldBackfillServer = true;
        }
      } else {
        resolvedChapters = localSaved;
      }

      if (isMounted) {
        try {
          const chapterIdSet = new Set(foundModule.chapters?.map((chapter: any) => chapter.id) || []);
          setCompletedChapters(resolvedChapters.filter((chapterId) => chapterIdSet.has(chapterId)));
        } catch {
          setCompletedChapters([]);
        }
        setIsProgressReady(true);
      }

      if (shouldBackfillServer && resolvedChapters.length > 0) {
        await updateLearningModuleProgress(moduleId, resolvedChapters);
      }
    };

    void loadProgress();

    return () => {
      isMounted = false;
    };
  }, [moduleId]);

  // Save progress whenever it changes
  useEffect(() => {
    if (!moduleId || !isProgressReady) return;
    if (!hasInitializedProgress.current) {
      hasInitializedProgress.current = true;
      return;
    }

    localStorage.setItem(`kesselops-progress-${moduleId}`, JSON.stringify(completedChapters));
    const persist = async () => {
      const response = await updateLearningModuleProgress(moduleId, completedChapters);
      if (response.success) {
        window.dispatchEvent(new Event("kesselops:learn-progress-updated"));
      }
    };

    void persist();
  }, [completedChapters, moduleId, isProgressReady]);

  useEffect(() => {
    setVideoError(null);
    setQuizAnswers({});
    setQuizResult(null);
  }, [activeChapter]);

  if (!isClient || !module) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const activeLesson = module.chapters?.find((c: any) => c.id === activeChapter) || module.chapters?.[0];
  const isQuizLesson = activeLesson?.type === "QUIZ";
  const quizQuestions = isQuizLesson && Array.isArray(activeLesson?.quizQuestions) ? activeLesson.quizQuestions : [];
  const quizPassPercent = isQuizLesson ? Number(activeLesson?.passPercent ?? 70) : 0;
  const lessonVideoUrl: string = activeLesson?.videoUrl || "";
  const isDirectVideoFile = /\.(mp4|webm|ogg)(\?.*)?$/i.test(lessonVideoUrl);

  const handleVideoCompleted = () => {
    if (isQuizLesson) return;
    if (activeChapter && !completedChapters.includes(activeChapter)) {
      setCompletedChapters(prev => [...prev, activeChapter]);
    }
  };

  const handleManualComplete = () => {
    if (isQuizLesson) return;
    if (activeChapter && !completedChapters.includes(activeChapter)) {
      setCompletedChapters(prev => [...prev, activeChapter]);
    }
  };

  const handleSelectQuizAnswer = (questionId: string, optionIndex: number) => {
    setQuizAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmitQuiz = () => {
    if (!isQuizLesson || !activeChapter || quizQuestions.length === 0) return;

    const allAnswered = quizQuestions.every((q: any) => Number.isInteger(quizAnswers[q.id]));
    if (!allAnswered) return;

    const correctAnswers = quizQuestions.reduce((count: number, q: any) => {
      return count + (quizAnswers[q.id] === q.correctAnswer ? 1 : 0);
    }, 0);

    const percent = (correctAnswers / quizQuestions.length) * 100;
    const passed = percent >= quizPassPercent;

    setQuizResult({
      score: correctAnswers,
      total: quizQuestions.length,
      percent,
      passed,
    });

    if (passed && !completedChapters.includes(activeChapter)) {
      setCompletedChapters((prev) => [...prev, activeChapter]);
    }
  };

  const handleRetryQuiz = () => {
    setQuizAnswers({});
    setQuizResult(null);
  };

  const progressPercentage = module.chapters.length > 0
    ? (completedChapters.length / module.chapters.length) * 100
    : 0;

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col lg:flex-row gap-6">
      {/* LEFT: Main Content (Video & Details) */}
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto lg:overflow-visible space-y-4">
        {/* Back Button */}
        <div>
          <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/learn")} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Learning Center
          </Button>
        </div>

        {/* Lesson Content */}
        {isQuizLesson ? (
          <Card className="border-white/10 bg-card/60">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{activeLesson?.title}</span>
                <Badge variant="outline">Final Quiz</Badge>
              </CardTitle>
              <CardDescription>
                Answer all 10 questions. Passing score: {quizPassPercent}%.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {quizQuestions.map((q: any, index: number) => {
                const selected = quizAnswers[q.id];
                const isAnswered = Number.isInteger(selected);
                return (
                  <div key={q.id} className="space-y-2 rounded-lg border border-border bg-background/40 p-3">
                    <p className="text-sm font-medium text-foreground">
                      {index + 1}. {q.question}
                    </p>
                    <div className="grid grid-cols-1 gap-2">
                      {q.options.map((option: string, optionIndex: number) => {
                        const isSelected = selected === optionIndex;
                        return (
                          <button
                            key={`${q.id}-${optionIndex}`}
                            type="button"
                            onClick={() => handleSelectQuizAnswer(q.id, optionIndex)}
                            className={`text-left text-sm px-3 py-2 rounded-md border transition-colors ${
                              isSelected
                                ? "border-primary bg-primary/10 text-foreground"
                                : "border-border hover:bg-muted/40 text-muted-foreground"
                            }`}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>
                    {!isAnswered && (
                      <p className="text-xs text-muted-foreground">Choose one answer</p>
                    )}
                    {quizResult && (
                      <p className="text-xs text-muted-foreground">{q.explanation}</p>
                    )}
                  </div>
                );
              })}

              {quizResult && (
                <div className={`rounded-md border p-3 text-sm ${
                  quizResult.passed
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                    : "border-amber-500/40 bg-amber-500/10 text-amber-300"
                }`}>
                  Score: {quizResult.score}/{quizResult.total} ({quizResult.percent.toFixed(0)}%)
                  {quizResult.passed ? " - Passed" : " - Not passed, retry to complete module."}
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={handleSubmitQuiz}
                  disabled={quizQuestions.some((q: any) => !Number.isInteger(quizAnswers[q.id]))}
                  className="gap-2"
                >
                  Submit Quiz
                </Button>
                <Button variant="outline" onClick={handleRetryQuiz}>
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="aspect-video bg-black rounded-xl overflow-hidden relative group shadow-2xl border border-white/10">
            {lessonVideoUrl ? (
              isClient && isDirectVideoFile ? (
                <video
                  key={activeLesson?.id || lessonVideoUrl}
                  src={lessonVideoUrl}
                  className="w-full h-full"
                  controls
                  preload="metadata"
                  playsInline
                  onEnded={handleVideoCompleted}
                  onError={() => setVideoError("This lesson video could not be loaded.")}
                />
              ) : isClient ? (
                <ReactPlayer
                  key={activeLesson?.id || lessonVideoUrl}
                  url={lessonVideoUrl}
                  width="100%"
                  height="100%"
                  controls
                  playing={false}
                  onReady={() => console.log('Player ready', lessonVideoUrl)}
                  onError={(e: any) => {
                    console.error('Player error', e, lessonVideoUrl);
                    setVideoError("This lesson video could not be loaded.");
                  }}
                  onEnded={handleVideoCompleted}
                  config={{
                    youtube: {
                      playerVars: { showinfo: 1 }
                    } as any
                  }}
                />
              ) : (
               <div className="w-full h-full flex items-center justify-center bg-slate-900">
                  <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
               </div>
              )
            ) : (
              <div className="w-full h-full bg-slate-900 flex items-center justify-center text-slate-500">
                <p>Video not available</p>
              </div>
            )}
            {videoError && (
              <div className="absolute inset-x-3 bottom-3 bg-red-500/20 border border-red-500/40 text-red-100 rounded-md p-2 text-xs">
                {videoError}
              </div>
            )}
          </div>
        )}

        {/* Lesson Details */}
        <Card className="flex-1">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="text-xl">{activeLesson?.title}</CardTitle>
                        <CardDescription className="mt-1">{module.description}</CardDescription>
                    </div>
                    <Button 
                      onClick={() => setShowAiChat(!showAiChat)} 
                      variant={showAiChat ? "default" : "outline"} 
                      className="gap-2"
                    >
                        <MessageSquare className="h-4 w-4" />
                        {showAiChat ? "Hide Assistant" : "Ask AI Assistant"}
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="prose dark:prose-invert max-w-none">
                    <h3>Lesson Overview</h3>
                    <p>
                        In this lesson, we cover the essential aspects of <strong>{activeLesson?.title}</strong>. 
                        {isQuizLesson
                          ? " Complete the final assessment to finish this module."
                          : " Please watch the video carefully. The system effectively tracks your progress as you complete each video."}
                    </p>
                </div>
            </CardContent>
        </Card>
      </div>

      {/* RIGHT: Sidebar (Course Content & AI Chat) */}
      <div className="w-full lg:w-[350px] flex flex-col gap-4 min-h-0">
        
        {/* Course Progress Card */}
        <Card className="flex flex-col max-h-[50vh] lg:max-h-none flex-1">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center justify-between">
                    Course Content
                    <Badge variant="outline">{module.chapters?.length} Lessons</Badge>
                </CardTitle>
                <div className="w-full bg-secondary h-2 rounded-full mt-2 overflow-hidden">
                    <div 
                        className="bg-primary h-full transition-all duration-500" 
                        style={{ width: `${progressPercentage}%` }} 
                    />
                </div>
                <p className="text-xs text-muted-foreground mt-1 text-right">{progressPercentage.toFixed(0)}% Complete</p>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0">
                <ScrollArea className="h-full">
                    <div className="flex flex-col">
                        {module.chapters?.map((chapter: any, index: number) => {
                            const isCompleted = completedChapters.includes(chapter.id);
                            const isActive = activeChapter === chapter.id;

                            return (
                                <button
                                    key={chapter.id}
                                    onClick={() => setActiveChapter(chapter.id)}
                                    className={`flex items-center gap-3 p-4 text-left transition-colors border-b last:border-0 hover:bg-muted/50 ${
                                        isActive ? "bg-muted/50 border-l-4 border-l-primary" : "border-l-4 border-l-transparent"
                                    }`}
                                >
                                    <div className="flex-shrink-0 mt-0.5">
                                        {isCompleted ? (
                                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                                        ) : isActive ? (
                                            <PlayCircle className="h-5 w-5 text-primary" />
                                        ) : (
                                            <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center text-[10px] text-muted-foreground">
                                                {index + 1}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-medium truncate ${isActive ? "text-primary" : "text-foreground"}`}>
                                            {chapter.title}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                          {chapter.type === "QUIZ" ? "Final Quiz · 10 Questions" : chapter.duration}
                                        </p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </ScrollArea>
            </CardContent>
            <div className="p-4 border-t bg-muted/10">
                <Button 
                  className="w-full" 
                  onClick={handleManualComplete}
                  disabled={isQuizLesson || completedChapters.includes(activeChapter!)}
                  variant={completedChapters.includes(activeChapter!) ? "outline" : "default"}
                >
                    <CheckCircle2 className="mr-2 h-4 w-4" /> 
                    {isQuizLesson
                      ? "Complete Quiz to Finish"
                      : completedChapters.includes(activeChapter!)
                      ? "Completed"
                      : "Mark Lesson Complete"}
                </Button>
            </div>
        </Card>

        {/* AI Chat Overlay / Panel */}
        <AnimatePresence>
            {showAiChat && (
                <motion.div
                    initial={{ opacity: 0, y: 20, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "400px" }}
                    exit={{ opacity: 0, y: 20, height: 0 }}
                    className="border rounded-xl shadow-lg bg-card overflow-hidden flex flex-col"
                >
                    <AIChatPanel 
                      context={`Lesson: ${activeLesson?.title}`} 
                      initialMessage={`I'm watching "${activeLesson?.title}" with you. Any questions about this topic?`}
                    />
                </motion.div>
            )}
        </AnimatePresence>

      </div>
    </div>
  );
}
