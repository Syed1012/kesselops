"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Plus,
  Mail,
  MoreVertical,
  UserPlus,
  Copy,
  Trash2,
  Loader2,
  Check,
  Send,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { getUsers, inviteUser, deleteUser, type User, type InviteResponse } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

// Role badge config
const roleConfig: Record<string, { color: string; label: string }> = {
  OWNER: { color: "bg-purple-500", label: "Owner" },
  MANAGER: { color: "bg-blue-500", label: "Manager" },
  CHEF: { color: "bg-orange-500", label: "Chef" },
  STAFF: { color: "bg-green-500", label: "Staff" },
  TRAINEE: { color: "bg-yellow-500", label: "Trainee" },
};

export default function TeamPage() {
  const { user: currentUser } = useAuth();
  const [staff, setStaff] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Invite Modal State
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    firstName: "",
    lastName: "",
    role: "STAFF" as "MANAGER" | "CHEF" | "STAFF" | "TRAINEE",
  });

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Credentials Modal State
  const [credentialsModalOpen, setCredentialsModalOpen] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState<InviteResponse | null>(null);

  // Use a ref to track if component is mounted to prevent state updates after unmount
  // const isMounted = useRef(true); // Removed unused variable

  useEffect(() => {
    loadTeam();
    // return () => { isMounted.current = false; }; // Cleanup
  }, []);

  const loadTeam = async () => {
    setIsLoading(true);
    try {
      const response = await getUsers();
      if (response.success && response.data) {
        setStaff(response.data);
      } else {
        toast.error("Failed to load team members");
      }
    } catch {
      toast.error("Failed to load team members");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsInviting(true);
    
    try {
      const response = await inviteUser({
        firstName: inviteForm.firstName,
        lastName: inviteForm.lastName,
        role: inviteForm.role,
      });

      if (response.success && response.data) {
        setGeneratedCredentials(response.data);
        setInviteModalOpen(false);
        setCredentialsModalOpen(true);
        loadTeam(); // Refresh list
        // Reset form
        setInviteForm({ firstName: "", lastName: "", role: "STAFF" });
      } else {
        toast.error(response.error || "Failed to invite user");
      }
    } catch {
      toast.error("Failed to invite user");
    } finally {
      setIsInviting(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const sendCredentialsViaMail = () => {
    if (!generatedCredentials) return;
    
    const subject = "Welcome to KesselOps - Your Login Credentials";
    const body = `Hello ${generatedCredentials.user.firstName},\n\n` +
      `You have been invited to join KesselOps.\n\n` +
      `Here are your login details:\n` +
      `Email: ${generatedCredentials.email}\n` +
      `Password: ${generatedCredentials.password}\n\n` +
      `Please log in at: ${window.location.origin}/login\n\n` +
      `Best regards,\n${currentUser?.firstName} ${currentUser?.lastName}`;
      
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleDeleteClick = (member: User) => {
    setUserToDelete(member);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    try {
      const response = await deleteUser(userToDelete.id);
      if (response.success) {
        toast.success(`${userToDelete.firstName} ${userToDelete.lastName} has been removed`);
        loadTeam();
        setDeleteModalOpen(false);
        setUserToDelete(null);
      } else {
        toast.error(response.error || "Failed to delete user");
      }
    } catch {
      toast.error("Failed to delete user");
    } finally {
      setIsDeleting(false);
    }
  };

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
        <Button className="gap-2" onClick={() => setInviteModalOpen(true)}>
          <UserPlus className="h-4 w-4" />
          Add Team Member
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

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        /* Team Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStaff.map((member, i) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="group hover:border-primary/30 transition-colors h-full">
                <CardContent className="pt-6 flex flex-col h-full">
                  <div className="flex items-start gap-4 mb-4">
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
                      <p className="text-xs text-muted-foreground mt-1 truncate">{member.email}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-auto flex items-center gap-2 pt-4 border-t border-border">
                    <Button variant="ghost" size="sm" className="flex-1 gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </Button>
                    {member.role !== 'OWNER' && member.id !== currentUser?.id && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                        onClick={() => handleDeleteClick(member)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Invite Modal */}
      <Dialog open={inviteModalOpen} onOpenChange={setInviteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>
              Enter details to generate an account with secure credentials.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleInvite} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={inviteForm.firstName}
                  onChange={(e) => setInviteForm({ ...inviteForm, firstName: e.target.value })}
                  placeholder="Max"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={inviteForm.lastName}
                  onChange={(e) => setInviteForm({ ...inviteForm, lastName: e.target.value })}
                  placeholder="Mustermann"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select 
                value={inviteForm.role} 
                onValueChange={(value: any) => setInviteForm({ ...inviteForm, role: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MANAGER">Manager</SelectItem>
                  <SelectItem value="CHEF">Chef</SelectItem>
                  <SelectItem value="STAFF">Staff</SelectItem>
                  <SelectItem value="TRAINEE">Trainee</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-muted/50 p-3 rounded-lg text-sm text-muted-foreground">
              <p className="flex items-start gap-2">
                <span className="mt-0.5">💡</span>
                <span>
                  The system will automatically generate a unique email ID (e.g., m.mustermann@kesselops.de) and a secure password.
                </span>
              </p>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setInviteModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isInviting} className="gap-2">
                {isInviting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    Generate ID & Password
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Credentials Modal */}
      <Dialog open={credentialsModalOpen} onOpenChange={setCredentialsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Credentials Generated! 🎉</DialogTitle>
            <DialogDescription>
              Share these login details with your team member securely.
            </DialogDescription>
          </DialogHeader>
          
          {generatedCredentials && (
            <div className="space-y-4 py-4">
              <div className="bg-muted p-4 rounded-lg space-y-4">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">Email ID</Label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-background p-2 rounded border border-border font-mono text-sm">
                      {generatedCredentials.email}
                    </code>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => copyToClipboard(generatedCredentials.email, "Email")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">Password</Label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-background p-2 rounded border border-border font-mono text-sm">
                      {generatedCredentials.password}
                    </code>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => copyToClipboard(generatedCredentials.password, "Password")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-lg text-sm text-yellow-500">
                ⚠️ Make sure to save these credentials now. You won&apos;t be able to see the password again.
              </div>

              <Button onClick={sendCredentialsViaMail} className="w-full gap-2" size="lg">
                <Send className="h-4 w-4" />
                Forward via Mail
              </Button>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setCredentialsModalOpen(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Team Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete {userToDelete?.firstName} {userToDelete?.lastName}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-lg">
            <p className="text-sm text-red-500 flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              This will permanently remove this user from the system.
            </p>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="gap-2"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Delete Permanently
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
