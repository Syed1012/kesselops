"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Activity,
  Wine,
  Utensils,
  Star,
  Zap,
  BarChart3,
  PieChart,
  ShoppingBag,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Filter,
  Download,
  X,
  Clock,
  Target,
  AlertTriangle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { getReviewFeed, type ReviewFeed } from "@/lib/api";

// ─── Mock Data & Types ─────────────────────────────────────────────────────

type TimeFilter = "daily" | "weekly" | "monthly" | "quarterly" | "yearly";

const LIVE_METRICS = [
  { 
    id: "sales",
    label: "Live Sales", 
    value: "€3,240", 
    change: "+12%", 
    trend: "up", 
    icon: DollarSign, 
    color: "text-emerald-400",
    modalTitle: "Live Sales Pulse",
    modalDesc: "Real-time transaction heartbeat & sales breakdown."
  },
  { 
    id: "labor",
    label: "Labor Cost", 
    value: "24.5%", 
    change: "-1.2%", 
    trend: "down", 
    icon: Users, 
    color: "text-blue-400",
    modalTitle: "Labor Cost Analysis",
    modalDesc: "Cost vs Revenue trends and overtime risk alerts."
  },
  { 
    id: "guests",
    label: "Guest Count", 
    value: "84", 
    change: "+8", 
    trend: "up", 
    icon: Users, 
    color: "text-violet-400",
    modalTitle: "Guest Traffic Heatmap",
    modalDesc: "Peak hours and customer retention rates."
  },
  { 
    id: "spend",
    label: "Avg Spend", 
    value: "€42.50", 
    change: "+€2.10", 
    trend: "up", 
    icon: TrendingUp, 
    color: "text-amber-400",
    modalTitle: "Spend Distribution",
    modalDesc: "Average ticket size and target performance."
  },
];

type DashboardReview = {
  id: number;
  source: string;
  rating: number;
  staffBehaviorRating: number;
  text: string;
  author: string;
  time: string;
};

const ANALYTICS_DATA = {
  income: {
    total: "€124,590",
    change: "+14.2%",
    breakdown: [
      { label: "Food", value: "€68,400", color: "bg-violet-500" },
      { label: "Beverage", value: "€42,100", color: "bg-blue-500" },
      { label: "Events", value: "€14,090", color: "bg-emerald-500" },
    ],
  },
  spending: {
    total: "€86,200",
    change: "-2.4%",
    breakdown: [
      { label: "COGS", value: "€32,400", color: "bg-red-500" },
      { label: "Labor", value: "€38,100", color: "bg-orange-500" },
      { label: "Overhead", value: "€15,700", color: "bg-slate-500" },
    ],
  },
  inventory: {
    total: "€12,450", 
    change: "+5.1%",
    breakdown: [
      { label: "Spirits", value: "€5,200", color: "bg-amber-500" },
      { label: "Wine", value: "€4,150", color: "bg-rose-500" },
      { label: "Food", value: "€3,100", color: "bg-green-500" },
    ],
  },
  staff: {
    total: "€38,100", 
    change: "+1.2%",
    breakdown: [
      { label: "FOH", value: "€21,000", color: "bg-indigo-500" },
      { label: "BOH", value: "€12,500", color: "bg-cyan-500" },
      { label: "Mgmt", value: "€4,600", color: "bg-purple-500" },
    ],
  }
};

const TOP_DISHES = [
  { name: "Truffle Fries", count: 42, revenue: "€340" },
  { name: "Spicy Margarita", count: 38, revenue: "€418" },
  { name: "Wagyu Sliders", count: 25, revenue: "€450" },
  { name: "Burrata", count: 18, revenue: "€270" },
];

// ─── Helper Functions ──────────────────────────────────────────────────────

const getXAxisLabels = (filter: TimeFilter) => {
  switch (filter) {
    case "daily": return Array.from({ length: 12 }, (_, i) => `${i * 2}:00`);
    case "weekly": return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    case "monthly": return ["Week 1", "Week 2", "Week 3", "Week 4"];
    case "quarterly": return ["Month 1", "Month 2", "Month 3"];
    case "yearly": return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    default: return [];
  }
};

const getBarData = (filter: TimeFilter, type: string) => {
  // Returns dummy height percentages for bars
  const count = getXAxisLabels(filter).length;
  return Array.from({ length: count }, () => 20 + Math.random() * 70);
};

const formatRelativeTime = (timestamp: string) => {
  const parsedTime = new Date(timestamp).getTime();
  if (Number.isNaN(parsedTime)) return "just now";

  const diffMs = Date.now() - parsedTime;
  if (diffMs < 60_000) return "just now";

  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

// ─── Components ────────────────────────────────────────────────────────────

function MetricModal({ metric, isOpen, onClose }: { metric: any, isOpen: boolean, onClose: () => void }) {
  if (!metric) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <metric.icon className={`h-6 w-6 ${metric.color}`} />
            {metric.modalTitle}
          </DialogTitle>
          <DialogDescription>{metric.modalDesc}</DialogDescription>
        </DialogHeader>
        
        <div className="mt-4 space-y-6">
          {/* Custom Visualization based on Metric ID */}
          {metric.id === "sales" && (
            <div className="space-y-6">
              {/* Equalizer Graph */}
              <div className="h-48 bg-muted/20 rounded-xl overflow-hidden relative flex items-end justify-between px-4 pb-4 gap-1 border border-border/50">
                 {Array.from({ length: 30 }).map((_, i) => (
                    <motion.div
                      key={i}
                      className="flex-1 bg-emerald-500/80 rounded-t-sm"
                      animate={{
                        height: [
                          `${10 + Math.random() * 40}%`,
                          `${30 + Math.random() * 60}%`,
                          `${10 + Math.random() * 40}%`
                        ]
                      }}
                      transition={{
                        duration: 0.4 + Math.random() * 0.4,
                        repeat: Infinity,
                        repeatType: "mirror",
                        ease: "easeInOut"
                      }}
                    />
                 ))}
                 <div className="absolute top-2 right-2 flex items-center gap-2">
                   <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                   </span>
                   <span className="text-xs text-emerald-400 font-medium tracking-wider uppercase">Live Activity</span>
                 </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold mb-3 text-sm uppercase text-muted-foreground tracking-wider">Top Categories</h4>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm"><span className="text-muted-foreground">Signature Cocktails</span> <span className="font-medium">42%</span></div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden"><div className="h-full bg-emerald-500 w-[42%]" /></div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm"><span className="text-muted-foreground">Starters</span> <span className="font-medium">28%</span></div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden"><div className="h-full bg-blue-500 w-[28%]" /></div>
                    </div>
                  </div>
                </div>

                <div>
                   <h4 className="font-semibold mb-3 text-sm uppercase text-muted-foreground tracking-wider">Top Selling Items</h4>
                   <div className="space-y-3">
                        {TOP_DISHES.map((dish, i) => (
                           <div key={i} className="flex items-center justify-between text-sm pb-2 border-b border-border/50 last:border-0 last:pb-0">
                               <span className="font-medium text-foreground">{dish.name}</span>
                               <div className="flex gap-3 text-muted-foreground text-xs">
                                   <span>{dish.count} orders</span>
                                   <span className="text-foreground font-medium">{dish.revenue}</span>
                               </div>
                           </div>
                        ))}
                   </div>
                </div>
              </div>
            </div>
          )}

          {metric.id === "labor" && (
             <div className="space-y-4">
               <div className="h-40 flex items-end justify-between px-2 gap-2 border-b border-border pb-2">
                 {/* Cost Trend Bars */}
                 {[40, 60, 45, 80, 55, 65, 50].map((h, i) => (
                   <div key={i} className="flex-1 bg-blue-500/20 hover:bg-blue-500/40 rounded-t h-full relative group">
                      <div style={{ height: `${h}%` }} className="absolute bottom-0 w-full bg-blue-500 rounded-t" />
                   </div>
                 ))}
               </div>
               <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-start gap-3">
                 <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                 <div>
                   <h4 className="font-medium text-red-400">Overtime Risk Alert</h4>
                   <p className="text-sm text-muted-foreground">3 staff members are approaching 40h this week. Review schedule to avoid overtime premiums.</p>
                 </div>
               </div>
             </div>
          )}

          {metric.id === "guests" && (
            <div className="space-y-4">
              <div className="grid grid-cols-7 gap-1 h-32">
                {/* Heatmap Simulation */}
                {Array.from({ length: 7 * 5 }).map((_, i) => (
                  <div key={i} className={`rounded-sm ${Math.random() > 0.7 ? 'bg-violet-500' : Math.random() > 0.4 ? 'bg-violet-500/50' : 'bg-violet-500/20'}`} />
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted/30 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">New Guests</p>
                  <p className="text-xl font-bold text-foreground">34%</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">Returning</p>
                  <p className="text-xl font-bold text-violet-400">66%</p>
                </div>
              </div>
            </div>
          )}

          {metric.id === "spend" && (
            <div className="space-y-4">
               <div className="relative h-32 bg-muted/20 rounded-xl flex items-center justify-center">
                 {/* Gauge Simulation */}
                 <div className="w-48 h-24 overflow-hidden relative">
                    <div className="w-48 h-48 rounded-full border-[12px] border-muted border-t-transparent border-l-transparent border-r-transparent absolute top-0" />
                    <div className="w-48 h-48 rounded-full border-[12px] border-amber-500 border-b-transparent border-l-transparent border-r-transparent absolute top-0 rotate-[45deg]" />
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-2xl font-bold">€42.50</div>
                    <p className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-muted-foreground">Target: €40.00</p>
                 </div>
               </div>
               <div>
                  <h4 className="font-semibold mb-2">Spend Distribution</h4>
                  <div className="flex items-end justify-between h-20 gap-1">
                     {[10, 25, 40, 60, 30, 15, 5].map((h, i) => (
                       <div key={i} className="flex-1 bg-amber-500/20 rounded-t" style={{height: `${h}%`}} />
                     ))}
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>€10</span>
                    <span>€100+</span>
                  </div>
               </div>
            </div>
          )}

        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────

export default function OwnerDashboard() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("daily");
  const [activeTab, setActiveTab] = useState("income");
  const [selectedMetric, setSelectedMetric] = useState<any>(null);
  const [reviewFeed, setReviewFeed] = useState<ReviewFeed | null>(null);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);

  const currentData = ANALYTICS_DATA[activeTab as keyof typeof ANALYTICS_DATA];
  const xAxisLabels = getXAxisLabels(timeFilter);
  const barData = getBarData(timeFilter, activeTab);

  useEffect(() => {
    let isActive = true;

    (async () => {
      setIsLoadingReviews(true);
      const response = await getReviewFeed(4);
      if (isActive && response.success && response.data) {
        setReviewFeed(response.data);
      }
      if (isActive) {
        setIsLoadingReviews(false);
      }
    })();

    return () => {
      isActive = false;
    };
  }, []);

  const reviewItems = useMemo(() => {
    if (!reviewFeed?.reviews?.length) {
      return [] as DashboardReview[];
    }

    return reviewFeed.reviews.map((review) => ({
      id: review.id,
      source: review.source || "QR",
      rating: review.rating,
      staffBehaviorRating: review.staffBehaviorRating,
      text: review.comment,
      author: review.reviewerName || "Guest",
      time: formatRelativeTime(review.createdAt),
    }));
  }, [reviewFeed]);

  const averageRating = useMemo(() => {
    return reviewFeed?.averageRating ?? 0;
  }, [reviewFeed]);

  return (
    <div className="space-y-8">
      {/* ─── Header Section ───────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            Owner Command Center
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </h1>
          <p className="text-slate-400 mt-1">Real-time overview of your venue&apos;s financial health.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" /> Export
          </Button>
          <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-lg shadow-violet-500/20">
            <Zap className="mr-2 h-4 w-4" /> Generate Report
          </Button>
        </div>
      </div>

      {/* ─── KPI Grid (Interactive) ───────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {LIVE_METRICS.map((metric, i) => (
          <motion.div
            key={metric.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => setSelectedMetric(metric)}
            className="cursor-pointer group"
          >
            <Card className="bg-card/50 backdrop-blur border-border group-hover:border-primary/50 transition-all group-hover:shadow-[0_0_20px_-5px_hsl(var(--primary)/0.3)]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2 rounded-lg bg-background/50 ${metric.color} group-hover:scale-110 transition-transform`}>
                    <metric.icon className="h-5 w-5" />
                  </div>
                  <Badge variant="secondary" className={`${metric.trend === 'up' ? 'text-emerald-400 bg-emerald-400/10' : 'text-red-400 bg-red-400/10'} border-0`}>
                    {metric.change}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <h3 className="text-2xl font-bold text-foreground">{metric.value}</h3>
                  <p className="text-sm text-muted-foreground group-hover:text-primary transition-colors">{metric.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Metric Detail Modal */}
      <MetricModal 
        metric={selectedMetric} 
        isOpen={!!selectedMetric} 
        onClose={() => setSelectedMetric(null)} 
      />

      {/* ─── Main Content Grid ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ─── Left Column: Advanced Analytics ────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-card border-border overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle>Financial Analytics</CardTitle>
                  <CardDescription>Deep dive into revenue, expenses, and operational costs.</CardDescription>
                </div>
                
                {/* Time Filter with Hidden Scrollbar */}
                <div className="flex bg-muted rounded-lg p-1 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {(["daily", "weekly", "monthly", "quarterly", "yearly"] as const).map((tf) => (
                    <button
                      key={tf}
                      onClick={() => setTimeFilter(tf)}
                      className={cn(
                        "px-3 py-1 text-xs font-medium rounded-md transition-all capitalize whitespace-nowrap",
                        timeFilter === tf
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="income" onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-8">
                  <TabsTrigger value="income" className="gap-2 text-xs sm:text-sm"><DollarSign className="h-4 w-4 hidden sm:block" /> Income</TabsTrigger>
                  <TabsTrigger value="spending" className="gap-2 text-xs sm:text-sm"><TrendingDown className="h-4 w-4 hidden sm:block" /> Spending</TabsTrigger>
                  <TabsTrigger value="inventory" className="gap-2 text-xs sm:text-sm"><ShoppingBag className="h-4 w-4 hidden sm:block" /> Inventory</TabsTrigger>
                  <TabsTrigger value="staff" className="gap-2 text-xs sm:text-sm"><Users className="h-4 w-4 hidden sm:block" /> Staff</TabsTrigger>
                </TabsList>
                
                {/* Analytics Content */}
                <div className="space-y-8">
                  {/* Summary Header */}
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground uppercase font-semibold tracking-wider">Total {activeTab}</p>
                      <div className="flex items-baseline gap-3">
                        <h2 className="text-4xl font-bold text-foreground">{currentData.total}</h2>
                        <span className={cn(
                          "flex items-center text-sm font-medium",
                          currentData.change.startsWith('+') ? 'text-emerald-500' : 'text-red-500'
                        )}>
                          {currentData.change.startsWith('+') ? <ArrowUpRight className="h-4 w-4 mr-1" /> : <ArrowDownRight className="h-4 w-4 mr-1" />}
                          {currentData.change}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Chart Area */}
                  <div className="h-[300px] w-full bg-muted/20 rounded-xl relative overflow-hidden flex flex-col justify-end px-4 sm:px-8 pb-4 pt-8 border border-border/50">
                    <div className="flex items-end justify-between gap-2 h-full w-full">
                      {barData.map((height, i) => (
                        <div key={i} className="flex-1 flex flex-col justify-end gap-2 group h-full">
                          <div className="relative w-full h-full flex items-end">
                             <motion.div 
                                className={cn(
                                  "w-full rounded-t-sm transition-all relative",
                                  activeTab === 'spending' ? 'bg-red-500/20 group-hover:bg-red-500/40' : 
                                  activeTab === 'inventory' ? 'bg-amber-500/20 group-hover:bg-amber-500/40' :
                                  'bg-violet-500/20 group-hover:bg-violet-500/40'
                                )}
                                initial={{ height: 0 }}
                                animate={{ height: `${height}%` }}
                                transition={{ duration: 0.5, delay: i * 0.05 }}
                              >
                                {/* Tooltip / Value Label - Permanently Visible */}
                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground font-medium px-1 py-0.5 whitespace-nowrap z-10">
                                  €{(height * 120).toFixed(0)}
                                </div>
                              </motion.div>
                          </div>
                          {/* X-Axis Label */}
                          <span className="text-[10px] text-muted-foreground text-center truncate w-full block">
                            {xAxisLabels[i]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Breakdown Legend */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {currentData.breakdown.map((item) => (
                      <div key={item.label} className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border">
                        <span className={`w-3 h-3 rounded-full ${item.color}`} />
                        <div>
                          <p className="text-sm font-medium text-foreground">{item.label}</p>
                          <p className="text-xs text-muted-foreground">{item.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Tabs>
            </CardContent>
          </Card>

          {/* Quick Actions (Preserved) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Update Menu", icon: Utensils, color: "violet" },
              { label: "Staff Schedule", icon: Users, color: "blue" },
              { label: "Inventory", icon: Wine, color: "emerald" },
              { label: "Reports", icon: Activity, color: "amber" }
            ].map((action) => (
              <Button key={action.label} variant="outline" className={`h-auto py-4 flex flex-col gap-2 hover:bg-${action.color}-500/10 hover:text-${action.color}-400 hover:border-${action.color}-500/50 transition-all`}>
                <action.icon className="h-6 w-6" />
                <span>{action.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* ─── Right Column: Feed ─────────────────────────────────────── */}
        <div className="space-y-6">
          
          {/* Recent Reviews (Top Priority) */}
          <Card className="bg-card border-border h-fit">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Recent Reviews
                </CardTitle>
                <Badge variant="outline" className="text-xs font-normal">
                  {averageRating.toFixed(1)} Avg
                </Badge>
              </div>
              <CardDescription>
                {reviewFeed?.totalReviews
                  ? `${reviewFeed.totalReviews} total reviews from QR feedback`
                  : "Latest customer feedback."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingReviews && (
                <p className="text-xs text-muted-foreground">Loading latest reviews...</p>
              )}
              {!isLoadingReviews && reviewItems.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  No reviews submitted yet. Scan the QR and submit feedback to see entries here.
                </p>
              )}
              {reviewItems.map((review) => (
                <div key={review.id} className="border-b border-border last:border-0 pb-4 last:pb-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-3 w-3 ${i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-slate-600'}`} 
                        />
                      ))}
                    </div>
                    <Badge variant="outline" className="text-[10px] uppercase">{review.source}</Badge>
                  </div>
                  <p className="text-sm text-foreground italic line-clamp-2">"{review.text}"</p>
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                    <span className="font-medium text-foreground">{review.author}</span> • {review.time}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Staff behavior: {review.staffBehaviorRating}/5
                  </p>
                </div>
              ))}
              <Button variant="ghost" className="w-full text-xs text-muted-foreground hover:text-foreground">
                View All Reviews
              </Button>
            </CardContent>
          </Card>

          {/* Business Health (Strategic View) */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-500" />
                Business Health
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Kitchen Efficiency</span>
                  <span className="text-foreground font-medium">92%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[92%]" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Table Turnover</span>
                  <span className="text-foreground font-medium">1h 15m</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 w-[78%]" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Staff Utilization</span>
                  <span className="text-foreground font-medium">85%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-violet-500 w-[85%]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
