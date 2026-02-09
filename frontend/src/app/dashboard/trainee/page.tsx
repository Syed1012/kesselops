"use client";


import { Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function TraineeDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Learning Center</h1>
        <p className="text-slate-400">Complete your onboarding modules to unlock shifts.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-[#0f1629] border-[#1e293b] opacity-100">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              Module 1: Safety
              <span className="text-emerald-400 text-xs px-2 py-1 bg-emerald-500/10 rounded-full">Complete</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
             <p className="text-sm text-slate-400 mb-4">Fire safety protocols and emergency exits.</p>
             <Button variant="outline" className="w-full border-emerald-500/30 text-emerald-400" disabled>Review</Button>
          </CardContent>
        </Card>
        
        <Card className="bg-[#0f1629] border-violet-500/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-violet-500/10 blur-2xl" />
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              Module 2: Menu
              <span className="text-violet-400 text-xs px-2 py-1 bg-violet-500/10 rounded-full animate-pulse">In Progress</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
             <p className="text-sm text-slate-400 mb-4">Learn the cocktail ingredients and allergens.</p>
             <Button className="w-full bg-violet-600 hover:bg-violet-700">Continue</Button>
          </CardContent>
        </Card>

        <Card className="bg-[#0f1629]/50 border-[#1e293b]">
          <CardHeader>
            <CardTitle className="text-slate-500 flex items-center justify-between">
              Module 3: POS
              <Lock className="h-4 w-4" />
            </CardTitle>
          </CardHeader>
          <CardContent>
             <p className="text-sm text-slate-600 mb-4">How to operate the register and split bills.</p>
             <Button variant="ghost" className="w-full text-slate-600" disabled>Locked</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
