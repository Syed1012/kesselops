"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  PlayCircle,
  MessageSquare,
  ChevronRight,
  ChevronDown,
  Send,
  Loader2,
  BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { trainingModules } from "@/lib/mock-data";

export default function CoursePlayerPage() {
  const params = useParams();
  const router = useRouter();
  const moduleId = params.moduleId as string;

  const [module, setModule] = useState<any>(null);
  const [activeChapter, setActiveChapter] = useState<string | null>(null);
  const [showAiChat, setShowAiChat] = useState(false);
  const [aiMessage, setAiMessage] = useState("");
  const [aiHistory, setAiHistory] = useState<{role: 'user' | 'assistant', content: string}[]>([
    { role: 'assistant', content: "Hi! I'm your training assistant. Ask me anything about this lesson!" }
  ]);
  const [isAiTyping, setIsAiTyping] = useState(false);

  useEffect(() => {
    // Find module from mock data
    const foundModule = trainingModules.find(m => m.id === moduleId);
    if (foundModule) {
      setModule(foundModule);
      if (foundModule.chapters?.length > 0) {
        setActiveChapter(foundModule.chapters[0].id);
      }
    }
  }, [moduleId]);

  if (!module) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const activeLesson = module.chapters?.find((c: any) => c.id === activeChapter) || module.chapters?.[0];

  const handleSendMessage = () => {
    if (!aiMessage.trim()) return;
    
    const newHistory = [...aiHistory, { role: 'user', content: aiMessage } as const];
    setAiHistory(newHistory);
    setAiMessage("");
    setIsAiTyping(true);

    // Simulate AI response
    setTimeout(() => {
      setAiHistory([
        ...newHistory,
        { role: 'assistant', content: `That's a great question about "${activeLesson?.title}". Based on standard procedures, you should focused on consistency and following safety protocols. Is there anything specific you'd like to dive deeper into?` }
      ]);
      setIsAiTyping(false);
    }, 1500);
  };

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

        {/* Video Player Placeholder */}
        <div className="aspect-video bg-black rounded-xl overflow-hidden relative group">
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 group-hover:bg-black/40 transition-colors">
                <PlayCircle className="h-16 w-16 text-white opacity-80 group-hover:opacity-100 transition-opacity scale-95 group-hover:scale-105 transform duration-300 cursor-pointer" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                <h2 className="text-white font-semibold text-lg">{activeLesson?.title}</h2>
                <p className="text-white/70 text-sm">{activeLesson?.duration} • {module.title}</p>
            </div>
            {/* Visual placeholder for video content */}
            <div className="w-full h-full bg-slate-900 flex items-center justify-center text-slate-700">
                <p>Video Player Integration</p>
            </div>
        </div>

        {/* Lesson Details */}
        <Card className="flex-1">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="text-xl">{activeLesson?.title}</CardTitle>
                        <CardDescription className="mt-1">{module.description}</CardDescription>
                    </div>
                    <Button onClick={() => setShowAiChat(!showAiChat)} variant={showAiChat ? "secondary" : "outline"} className="gap-2">
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
                        Please watch the video carefully and take notes on the key procedures.
                    </p>
                    <ul>
                        <li>Key takeaway 1</li>
                        <li>Important safety check</li>
                        <li>Standard operating procedure</li>
                    </ul>
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
                        style={{ width: `${module.progress}%` }} 
                    />
                </div>
                <p className="text-xs text-muted-foreground mt-1 text-right">{module.progress}% Complete</p>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0">
                <ScrollArea className="h-full">
                    <div className="flex flex-col">
                        {module.chapters?.map((chapter: any, index: number) => (
                            <button
                                key={chapter.id}
                                onClick={() => setActiveChapter(chapter.id)}
                                className={`flex items-center gap-3 p-4 text-left transition-colors border-b last:border-0 hover:bg-muted/50 ${
                                    activeChapter === chapter.id ? "bg-muted/50 border-l-4 border-l-primary" : "border-l-4 border-l-transparent"
                                }`}
                            >
                                <div className="flex-shrink-0 mt-0.5">
                                    {chapter.completed ? (
                                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                                    ) : activeChapter === chapter.id ? (
                                        <PlayCircle className="h-5 w-5 text-primary" />
                                    ) : (
                                        <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center text-[10px] text-muted-foreground">
                                            {index + 1}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-medium truncate ${activeChapter === chapter.id ? "text-primary" : "text-foreground"}`}>
                                        {chapter.title}
                                    </p>
                                    <p className="text-xs text-muted-foreground">{chapter.duration}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
            <div className="p-4 border-t bg-muted/10">
                <Button className="w-full" disabled={!activeChapter}>
                    <CheckCircle2 className="mr-2 h-4 w-4" /> Mark Lesson Complete
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
                    <div className="p-3 border-b bg-muted/30 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-sm font-medium">AI Training Assistant</span>
                    </div>
                    <ScrollArea className="flex-1 p-4">
                        <div className="space-y-4">
                            {aiHistory.map((msg, i) => (
                                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] rounded-lg p-3 text-sm ${
                                        msg.role === 'user' 
                                            ? 'bg-primary text-primary-foreground rounded-tr-none' 
                                            : 'bg-muted text-muted-foreground rounded-tl-none'
                                    }`}>
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                            {isAiTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-muted rounded-lg rounded-tl-none p-3 flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                        <div className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                        <div className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                    <div className="p-3 border-t bg-background">
                        <div className="flex gap-2">
                            <Textarea 
                                value={aiMessage}
                                onChange={(e) => setAiMessage(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage();
                                    }
                                }}
                                placeholder="Ask about this video..." 
                                className="min-h-[40px] max-h-[80px] resize-none"
                            />
                            <Button size="icon" onClick={handleSendMessage} disabled={!aiMessage.trim() || isAiTyping}>
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

      </div>
    </div>
  );
}
