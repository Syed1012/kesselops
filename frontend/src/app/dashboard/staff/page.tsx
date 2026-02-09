"use client";


import { CheckSquare, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";


export default function StaffDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Hey, Alex 👋</h1>
        <p className="text-slate-400">Your shift started at 17:00. You are on Bar duty.</p>
      </div>

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
                 { task: "Restock Citrus Garnish", status: "pending" },
                 { task: "Wipe down station 2", status: "done" },
                 { task: "Check Keg temps", status: "pending" }
               ].map((t, i) => (
                 <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-[#1a1f3a] border border-[#2a2f4a]">
                   <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${t.status === 'done' ? 'bg-emerald-500 border-emerald-500' : 'border-slate-500'}`}>
                      {t.status === 'done' && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}
                   </div>
                   <span className={t.status === 'done' ? 'text-slate-500 line-through' : 'text-white'}>{t.task}</span>
                 </div>
               ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0f1629] border-[#1e293b]">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-violet-400" />
              Handover Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-[#1a1f3a]/50 rounded-xl border border-[#2a2f4a]">
              <p className="text-sm text-slate-300 italic">&quot;Heads up, the dishwasher is making a weird noise in detailed cycle. Tech called for tomorrow.&quot;</p>
              <p className="text-xs text-slate-500 mt-2">- Morning Shift Lead</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
