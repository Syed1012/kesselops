"use client";

import { motion } from "framer-motion";
import { TrendingUp, Users, DollarSign, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function OwnerDashboard() {
  const stats = [
    { label: "Total Revenue", value: "€124,592", change: "+14%", icon: DollarSign, color: "text-emerald-400" },
    { label: "Labor Cost", value: "28%", change: "-2%", icon: Users, color: "text-blue-400" },
    { label: "Net Profit", value: "€32,400", change: "+8%", icon: TrendingUp, color: "text-violet-400" },
    { label: "Op. Efficiency", value: "94%", change: "+1%", icon: Activity, color: "text-pink-400" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Owner Overview</h1>
        <p className="text-slate-400">Financial health and high-level metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="bg-[#0f1629] border-[#1e293b]">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">{stat.label}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <p className={`text-xs ${stat.change.startsWith('+') ? 'text-emerald-400' : 'text-emerald-400'}`}>
                  {stat.change} vs last month
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-[#0f1629] border-[#1e293b] h-[300px]">
          <CardHeader>
            <CardTitle className="text-white">Revenue vs Labor</CardTitle>
          </CardHeader>
          <CardContent className="h-full flex items-center justify-center text-slate-500">
            [Chart Placeholder]
          </CardContent>
        </Card>
        <Card className="bg-[#0f1629] border-[#1e293b] h-[300px]">
          <CardHeader>
            <CardTitle className="text-white">Venue Performance</CardTitle>
          </CardHeader>
          <CardContent className="h-full flex items-center justify-center text-slate-500">
            [Chart Placeholder]
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
