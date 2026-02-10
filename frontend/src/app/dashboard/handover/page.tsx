"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRightLeft,
  AlertTriangle,
  MessageCircle,
  CheckCircle2,
  Clock,
  Send,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { handover, todaysShift } from "@/lib/mock-data";

export default function HandoverPage() {
  const [notes, setNotes] = useState("");

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Shift Handover</h1>
        <p className="text-muted-foreground">Review incoming notes and log outgoing updates</p>
      </div>

      {/* Incoming Handover */}
      <Card className="border-blue-500/30 bg-blue-500/5">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5 text-blue-500" />
            Incoming Handover
          </CardTitle>
          <CardDescription>
            From {handover.incoming.from} • {new Date(handover.incoming.timestamp).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Notes */}
          <div className="p-4 bg-card rounded-lg border border-border">
            <div className="flex items-start gap-3 mb-3">
              <Avatar>
                <AvatarFallback>{handover.incoming.from.split(" ").map((n) => n[1]).join("")}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium text-foreground">{handover.incoming.from}</p>
                <p className="text-sm text-muted-foreground">Previous Shift</p>
              </div>
            </div>
            <p className="text-foreground">{handover.incoming.notes}</p>
          </div>

          {/* Issues */}
          {handover.incoming.issues.length > 0 && (
            <div>
              <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-warning" />
                Flagged Issues
              </h4>
              <div className="space-y-2">
                {handover.incoming.issues.map((issue, i) => (
                  <motion.div
                    key={i}
                    className="flex items-center gap-3 p-3 bg-warning/10 border border-warning/20 rounded-lg"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <AlertTriangle className="h-4 w-4 text-warning shrink-0" />
                    <p className="text-sm text-foreground">{issue}</p>
                    <Button size="sm" variant="ghost" className="ml-auto shrink-0">
                      Resolve
                    </Button>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Acknowledge Button */}
          <Button className="w-full">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Acknowledge Handover
          </Button>
        </CardContent>
      </Card>

      {/* Current Shift Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Current Shift
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <Badge variant="secondary">{todaysShift.type}</Badge>
              <p className="text-sm text-muted-foreground mt-1">
                {todaysShift.startTime} - {todaysShift.endTime}
              </p>
            </div>
            <div className="flex -space-x-2">
              {todaysShift.staff.map((member) => (
                <Avatar key={member.id} className="border-2 border-card">
                  <AvatarFallback>{member.firstName[0]}{member.lastName[0]}</AvatarFallback>
                </Avatar>
              ))}
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            Team: {todaysShift.staff.map((m) => m.firstName).join(", ")}
          </div>
        </CardContent>
      </Card>

      {/* Outgoing Handover */}
      <Card className="border-green-500/30 bg-green-500/5">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-green-500" />
            Your Handover Notes
          </CardTitle>
          <CardDescription>
            Leave notes for the next shift team
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g., VIP guests at Table 5 are celebrating an anniversary. Draft beer is running low..."
            className="w-full min-h-[120px] p-3 rounded-lg bg-background border border-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />

          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" className="flex-1">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Flag Issue
            </Button>
            <Button className="flex-1" disabled={!notes.trim()}>
              <Send className="h-4 w-4 mr-2" />
              Submit Handover
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
