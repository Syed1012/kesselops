"use client";


import { Users, AlertCircle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ManagerDashboard() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Floor Management</h1>
          <p className="text-slate-400">Live operations, shift supervision, and inventory.</p>
        </div>
        <Button className="bg-violet-600">Create Shift Report</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-[#0f1629] border-[#1e293b]">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-400" />
              Staff on Shift (8)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {['Alex M. (Bar)', 'Sarah K. (Floor)', 'Mike T. (Runner)'].map((name, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-white">{name}</span>
                  <span className="text-emerald-400 text-xs px-2 py-0.5 bg-emerald-500/10 rounded-full">Active</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-[#0f1629] border-[#1e293b]">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-400" />
              Urgent Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                <p className="text-sm text-amber-300 font-medium">Ice Machine 2 Breakdown</p>
                <p className="text-xs text-amber-400/70">Reported 10m ago</p>
              </div>
              <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                <p className="text-sm text-red-300 font-medium">Low Stock: Gin</p>
                <p className="text-xs text-red-400/70">Only 2 bottles left</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0f1629] border-[#1e293b]">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Clock className="h-4 w-4 text-violet-400" />
              Shift Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
             <div className="space-y-4 relative border-l border-slate-700 ml-2 pl-4">
                {[
                  { time: '18:00', event: 'Dinner Service Start' },
                  { time: '20:00', event: 'Peak Hours' },
                  { time: '22:00', event: 'Kitchen Close' }
                ].map((item, i) => (
                  <div key={i} className="relative">
                    <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-slate-600" />
                    <p className="text-xs text-slate-400">{item.time}</p>
                    <p className="text-sm text-white">{item.event}</p>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
