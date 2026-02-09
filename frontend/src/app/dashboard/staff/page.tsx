"use client";

import { useState } from "react";
import { 
  CheckSquare, 
  MessageSquare, 
  Bot, 
  ShieldAlert, 
  GraduationCap,
  Beer,
  Ban
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

export default function StaffDashboard() {
  // Mock state to toggle Apprentice Mode (In real app, this comes from User Context)
  const [isApprenticeMode, setIsApprenticeMode] = useState(true);

  return (
    <div className="space-y-8">
      {/* Dev Toggle for Demo */}
      <div className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-xl">
        <div className="flex items-center gap-3">
             <div className="p-2 bg-slate-800 rounded-lg">
                <ShieldAlert className="h-5 w-5 text-slate-400" />
             </div>
             <div>
                <p className="text-sm font-medium text-white">Simulation Control</p>
                <p className="text-xs text-slate-500">Toggle mode to see UI changes</p>
             </div>
        </div>
        <div className="flex items-center gap-2">
            <span className={`text-sm ${!isApprenticeMode ? "text-white" : "text-slate-500"}`}>Experienced</span>
            <Switch 
                checked={isApprenticeMode} 
                onCheckedChange={setIsApprenticeMode}
                className="data-[state=checked]:bg-violet-600"
            />
            <span className={`text-sm ${isApprenticeMode ? "text-violet-400 font-bold" : "text-slate-500"}`}>Apprentice Mode</span>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold tracking-tight text-white">Hey, Alex 👋</h1>
            {isApprenticeMode && (
                <Badge variant="default" className="bg-violet-600 hover:bg-violet-600 border-none text-white gap-1 pl-1 pr-2">
                    <Bot className="h-3 w-3" />
                    AI Copilot Active
                </Badge>
            )}
        </div>
        <p className="text-slate-400">
            {isApprenticeMode 
                ? "You are in Apprentice Mode. Sensitive actions are restricted and AI guidance is enabled." 
                : "Your shift started at 17:00. You are on Bar duty."}
        </p>
      </div>

      {/* AI Insight / Learning Card - Only for Apprentice */}
      {isApprenticeMode && (
          <Card className="bg-gradient-to-r from-violet-600/10 to-blue-600/10 border-violet-500/30">
            <CardHeader>
                <CardTitle className="text-violet-300 flex items-center gap-2 text-lg">
                    <GraduationCap className="h-5 w-5" />
                    Onboarding Focus: &quot;The Perfect Pour&quot;
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-slate-300 mb-4">
                    Manager Sarah has assigned you a quick refresh on Guinness pouring technique.
                </p>
                <div className="flex gap-3">
                    <Button size="sm" className="bg-violet-600 hover:bg-violet-700">Watch Video (2m)</Button>
                    <Button size="sm" variant="outline" className="text-violet-400 border-violet-500/30">Ask AI Assistant</Button>
                </div>
            </CardContent>
          </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-[#0f1629] border-[#1e293b]">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-emerald-400" />
              My Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
               {[
                 { task: "Restock Citrus Garnish", status: "pending", help: "Citrus kept in Fridge 2, Bottom Shelf" },
                 { task: "Wipe down station 2", status: "done" },
                 { task: "Check Keg temps", status: "pending", help: "Ideal temp: 3-5°C. Check gauge on cooler wall." }
               ].map((t, i) => (
                 <div key={i} className="group p-3 rounded-lg bg-[#1a1f3a] border border-[#2a2f4a] relative overflow-hidden">
                   <div className="flex items-center gap-3 relative z-10">
                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${t.status === 'done' ? 'bg-emerald-500 border-emerald-500' : 'border-slate-500'}`}>
                            {t.status === 'done' && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}
                        </div>
                        <span className={t.status === 'done' ? 'text-slate-500 line-through' : 'text-white'}>{t.task}</span>
                   </div>
                   
                   {/* AI Contextual Help for Apprentice */}
                   {isApprenticeMode && t.status !== 'done' && t.help && (
                       <div className="mt-3 pl-8 flex items-start gap-2">
                            <Bot className="h-4 w-4 text-violet-400 shrink-0 mt-0.5" />
                            <p className="text-xs text-violet-300 bg-violet-500/10 p-2 rounded-md border border-violet-500/20">
                                {t.help}
                            </p>
                       </div>
                   )}
                 </div>
               ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0f1629] border-[#1e293b]">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Beer className="h-5 w-5 text-amber-400" />
              Quick Actions
            </CardTitle>
            <CardDescription>Common floor operations</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 h-24 flex flex-col gap-2">
                    <MessageSquare className="h-6 w-6" />
                    Add Note
                </Button>
                
                {/* Restricted Action: 86 Item */}
                <Button 
                    variant="outline" 
                    className={`h-24 flex flex-col gap-2 relative ${
                        isApprenticeMode 
                        ? "border-red-900/30 bg-red-900/5 text-slate-500 cursor-not-allowed hover:bg-red-900/5" 
                        : "border-red-500/20 text-red-400 hover:bg-red-500/10"
                    }`}
                >
                    {isApprenticeMode ? <Ban className="h-6 w-6 text-slate-600" /> : <Ban className="h-6 w-6" />}
                    86 Item
                    {isApprenticeMode && (
                        <div className="absolute top-2 right-2">
                            <ShieldAlert className="h-4 w-4 text-slate-600" />
                        </div>
                    )}
                </Button>

                {/* Restricted Action: Void Bill */}
                <Button 
                    variant="outline" 
                    className={`h-24 flex flex-col gap-2 relative col-span-2 ${
                        isApprenticeMode 
                        ? "border-slate-800 bg-slate-900/50 text-slate-600 cursor-not-allowed" 
                        : "border-slate-700 text-slate-300 hover:bg-slate-800"
                    }`}
                >
                    Process Refund / Void
                    {isApprenticeMode && (
                        <span className="text-[10px] text-red-500/70 font-medium">Restricted in Apprentice Mode</span>
                    )}
                </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
