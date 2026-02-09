"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Plus,
  Mail,
  Phone,
  MoreVertical,
  UserPlus,
  Copy,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { staff } from "@/lib/mock-data";

// Role badge config
const roleConfig: Record<string, { color: string; label: string }> = {
  OWNER: { color: "bg-purple-500", label: "Owner" },
  MANAGER: { color: "bg-blue-500", label: "Manager" },
  STAFF: { color: "bg-green-500", label: "Staff" },
  TRAINEE: { color: "bg-yellow-500", label: "Trainee" },
};

export default function TeamPage() {
  const [searchQuery, setSearchQuery] = useState("");
  // const [inviteModalOpen, setInviteModalOpen] = useState(false);

  // Filter staff
  const filteredStaff = staff.filter((member) => {
    const fullName = `${member.firstName} ${member.lastName}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase());
  });

  // Stats by role
  const roleStats = staff.reduce(
    (acc, member) => {
      acc[member.role] = (acc[member.role] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Team</h1>
          <p className="text-muted-foreground">Manage your venue staff and roles</p>
        </div>
        <Button className="gap-2" onClick={() => {}}>
          <UserPlus className="h-4 w-4" />
          Invite Team Member
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Object.entries(roleConfig).map(([role, config]) => (
          <Card key={role}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${config.color}`} />
                <div>
                  <p className="text-2xl font-bold text-foreground">{roleStats[role] || 0}</p>
                  <p className="text-sm text-muted-foreground">{config.label}s</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search team members..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 max-w-md"
        />
      </div>

      {/* Team Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStaff.map((member, i) => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="group hover:border-primary/30 transition-colors">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Avatar
                    fallback={`${member.firstName[0]}${member.lastName[0]}`}
                    className="h-12 w-12"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground truncate">
                        {member.firstName} {member.lastName}
                      </h3>
                      <div
                        className={`w-2 h-2 rounded-full ${roleConfig[member.role]?.color || "bg-gray-500"}`}
                      />
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {roleConfig[member.role]?.label || member.role}
                    </Badge>
                  </div>
                  <Button size="icon" variant="ghost" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
                  <Button variant="ghost" size="sm" className="flex-1 gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </Button>
                  <Button variant="ghost" size="sm" className="flex-1 gap-2">
                    <Phone className="h-4 w-4" />
                    Call
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {/* Invite Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: filteredStaff.length * 0.05 }}
        >
          <Card
            className="h-full flex items-center justify-center border-dashed hover:border-primary/50 cursor-pointer transition-colors"
            onClick={() => {}}
          >
            <CardContent className="text-center py-12">
              <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="font-medium text-foreground">Invite New Member</p>
              <p className="text-sm text-muted-foreground">
                Send an invitation link
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Pending Invitations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Pending Invitations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <p className="font-medium text-foreground">newstaff@oscho.de</p>
                <p className="text-sm text-muted-foreground">Invited 2 days ago • Staff</p>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" className="gap-1">
                  <Copy className="h-4 w-4" />
                  Copy Link
                </Button>
                <Button size="sm" variant="ghost" className="text-danger">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
