"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  ArrowRightLeft,
  AlertTriangle,
  MessageCircle,
  CheckCircle2,
  Clock,
  Send,
  Loader2,
  User as UserIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  useVenue,
} from "@/lib/venue-context";
import {
  useAuth,
} from "@/lib/auth-context";
import {
  getShifts,
  getIncomingHandover,
  getOutgoingHandover,
  createHandover,
  acknowledgeHandover,
  getUsers,
  type Shift,
  type Handover,
  type User,
} from "@/lib/api";
import { toast } from "sonner";

export default function HandoverPage() {
  const { user } = useAuth();
  const { selectedVenue } = useVenue();

  const [isLoading, setIsLoading] = useState(true);
  const [currentShift, setCurrentShift] = useState<Shift | null>(null);
  const [nextShift, setNextShift] = useState<Shift | null>(null);
  const [incomingHandover, setIncomingHandover] = useState<Handover | null>(null);
  const [outgoingHandover, setOutgoingHandover] = useState<Handover | null>(null);
  const [staffMap, setStaffMap] = useState<Record<number, User>>({});

  // Form State
  const [summary, setSummary] = useState("");
  const [issues, setIssues] = useState("");
  const [nextSteps, setNextSteps] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    if (!selectedVenue || !user) return;
    setIsLoading(true);
    try {
      // 1. Fetch Users (for names) & Shifts
      const [usersRes, shiftsRes] = await Promise.all([
        getUsers(selectedVenue.id),
        getShifts(selectedVenue.id),
      ]);

      const users = usersRes.data || [];
      const userMap: Record<number, User> = {};
      users.forEach((u) => (userMap[u.id] = u));
      setStaffMap(userMap);

      const allShifts = shiftsRes.data || [];
      // Flatten paginated response if needed, assuming array for simplicity based on previous usage
      // api.ts getShifts returns ApiResponse<Shift[] | Page<Shift>>?
      // Let's assume it returns array or content.
      const shiftList = Array.isArray(allShifts) ? allShifts : (allShifts as any).content || [];

      // 2. Identify Current Shift
      const now = new Date();
      // Find shift where user is assigned and now is within start/end (with some buffer?)
      // Or just the user's shift for "today".
      const today = new Date();
      today.setHours(0,0,0,0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const myShifts = shiftList.filter((s: Shift) => {
        const start = new Date(s.startTime);
        return String(s.userId) === String(user.id) && start >= today && start < tomorrow;
      });

      // Sort by start time, take the one closest to now?
      // For simplicity, take the last one started or the one currently active.
      const activeShift = myShifts.find((s: Shift) => {
        const start = new Date(s.startTime);
        const end = new Date(s.endTime);
        return now >= start && now <= end;
      }) || myShifts[0]; // Fallback to first found

      if (!activeShift) {
        setIsLoading(false);
        return;
      }
      setCurrentShift(activeShift);

      // 3. Identify Next Shift (of ANY staff) that starts after activeShift ends
      const currentEnd = new Date(activeShift.endTime);
      const futureShifts = shiftList.filter((s: Shift) => {
        const start = new Date(s.startTime);
        return start >= currentEnd && s.id !== activeShift.id;
      });
      futureShifts.sort((a: Shift, b: Shift) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
      
      const next = futureShifts[0];
      setNextShift(next || null);

      // 4. Fetch Handovers
      const [incomingRes, outgoingRes] = await Promise.all([
        getIncomingHandover(activeShift.id),
        getOutgoingHandover(activeShift.id),
      ]);

      if (incomingRes.success) setIncomingHandover(incomingRes.data);
      if (outgoingRes.success) setOutgoingHandover(outgoingRes.data);

    } catch (error) {
      console.error("Failed to load handover data", error);
      toast.error("Failed to load handover data");
    } finally {
      setIsLoading(false);
    }
  }, [selectedVenue, user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAcknowledge = async () => {
    if (!currentShift) return;
    try {
      const res = await acknowledgeHandover(currentShift.id);
      if (res.success) {
        setIncomingHandover(res.data);
        toast.success("Handover acknowledged");
      } else {
        toast.error("Failed to acknowledge");
      }
    } catch {
      toast.error("Error acknowledging handover");
    }
  };

  const handleSubmit = async () => {
    if (!currentShift) return;
    if (!nextShift) {
      toast.error("No next shift found to handover to!");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await createHandover(currentShift.id, {
        toShiftId: nextShift.id,
        summary,
        openIssues: issues,
        nextSteps,
      });

      if (res.success) {
        setOutgoingHandover(res.data);
        toast.success("Handover submitted successfully");
      } else {
        toast.error("Failed to submit handover");
      }
    } catch {
      toast.error("Error submitting handover");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!currentShift) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <Clock className="h-10 w-10 mb-4 opacity-50" />
        <h2 className="text-xl font-semibold mb-2">No Active Shift</h2>
        <p>You don&apos;t have a shift scheduled for today.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Shift Handover</h1>
        <p className="text-muted-foreground">Review incoming notes and log outgoing updates</p>
      </div>

      {/* Incoming Handover */}
      {incomingHandover ? (
        <Card className={`border-l-4 ${incomingHandover.acknowledgedAt ? 'border-l-green-500' : 'border-l-blue-500'}`}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ArrowRightLeft className={`h-5 w-5 ${incomingHandover.acknowledgedAt ? 'text-green-500' : 'text-blue-500'}`} />
              Incoming Handover
              {incomingHandover.acknowledgedAt && <Badge variant="success" className="ml-auto">Acknowledged</Badge>}
            </CardTitle>
            <CardDescription>
              From {staffMap[incomingHandover.authorUserId!] ? `${staffMap[incomingHandover.authorUserId!].firstName} ${staffMap[incomingHandover.authorUserId!].lastName}` : "Previous Shift"} 
              • {new Date(incomingHandover.createdAt).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted/40 rounded-lg border border-border">
              <p className="font-medium mb-1">Summary</p>
              <p className="text-foreground whitespace-pre-wrap">{incomingHandover.summary}</p>
            </div>

            {incomingHandover.openIssues && (
              <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
                <div className="flex items-center gap-2 mb-1 text-amber-600">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-medium">Open Issues</span>
                </div>
                <p className="text-foreground whitespace-pre-wrap">{incomingHandover.openIssues}</p>
              </div>
            )}
            
            {incomingHandover.nextSteps && (
               <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <p className="font-medium mb-1 text-blue-600">Next Steps</p>
                <p className="text-foreground whitespace-pre-wrap">{incomingHandover.nextSteps}</p>
              </div>
            )}

            {!incomingHandover.acknowledgedAt && (
              <Button className="w-full mt-2" onClick={handleAcknowledge}>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Acknowledge Handover
              </Button>
            )}
            {incomingHandover.acknowledgedAt && (
               <p className="text-xs text-center text-muted-foreground">
                 Acknowledged at {new Date(incomingHandover.acknowledgedAt).toLocaleTimeString()}
               </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-muted/30 border-dashed">
          <CardContent className="py-8 text-center">
             <p className="text-muted-foreground">No incoming handover notes found for this shift.</p>
          </CardContent>
        </Card>
      )}

      {/* Current Shift Context */}
      <Card>
          <CardHeader className="pb-3">
             <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Current Shift Context</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
             <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">{currentShift.type} Shift</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(currentShift.startTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} - 
                    {new Date(currentShift.endTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                  </p>
                </div>
             </div>
             {nextShift ? (
               <div className="text-right">
                  <p className="text-sm font-medium">Next: {staffMap[nextShift.userId!]?.firstName || 'Unknown'}</p>
                  <p className="text-xs text-muted-foreground">
                     Starts {new Date(nextShift.startTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                  </p>
               </div>
             ) : (
                <Badge variant="outline">No next shift scheduled</Badge>
             )}
          </CardContent>
      </Card>


      {/* Outgoing Handover */}
      {outgoingHandover ? (
        <Card className="border-green-500/30 bg-green-500/5">
           <CardHeader>
             <CardTitle className="flex items-center gap-2">
               <CheckCircle2 className="h-5 w-5 text-green-500" />
               Handover Submitted
             </CardTitle>
             <CardDescription>
               You submitted your notes at {new Date(outgoingHandover.createdAt).toLocaleTimeString()}
             </CardDescription>
           </CardHeader>
           <CardContent>
              <Button variant="outline" className="w-full" disabled>Edit Handover (Coming Soon)</Button>
           </CardContent>
        </Card>
      ) : (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              Your Handover Notes
            </CardTitle>
              <p className="text-muted-foreground">
                Draft notes for {nextShift ? `${staffMap[nextShift.userId!]?.firstName || 'the next staff'}` : "the next shift"}
              </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Summary of Shift</label>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="How did the shift go? Any major events?"
                className="w-full min-h-[100px] p-3 rounded-lg bg-background border border-input focus:ring-2 focus:ring-primary/20 resize-y"
              />
            </div>
             <div className="space-y-2">
              <label className="text-sm font-medium text-amber-600 flex items-center gap-2">
                 <AlertTriangle className="h-3 w-3" /> Flagged Issues (Optional)
              </label>
              <textarea
                value={issues}
                onChange={(e) => setIssues(e.target.value)}
                placeholder="Equipment broken? Complaint? Low stock?"
                className="w-full min-h-[80px] p-3 rounded-lg bg-background border border-input focus:ring-2 focus:ring-amber-500/20 resize-y"
              />
            </div>
             <div className="space-y-2">
              <label className="text-sm font-medium text-blue-600">Next Steps / To-Dos</label>
              <textarea
                value={nextSteps}
                onChange={(e) => setNextSteps(e.target.value)}
                placeholder="Tasks for the next person..."
                className="w-full min-h-[80px] p-3 rounded-lg bg-background border border-input focus:ring-2 focus:ring-blue-500/20 resize-y"
              />
            </div>

            <Button 
               className="w-full" 
               onClick={handleSubmit} 
               disabled={isSubmitting || !summary.trim() || !nextShift}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" /> Submit Handover
                </>
              )}
            </Button>
            {!nextShift && (
               <p className="text-xs text-center text-red-400">Cannot submit: No next shift scheduled to receive this handover.</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
