"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, EyeOff, UserPlus, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Mock invite data
const mockInvite = {
  venueName: "OSCHO Café & Bar",
  role: "STAFF",
  invitedBy: "Max Mustermann",
  email: "newstaff@oscho.de",
};

export default function JoinPage() {
  const params = useParams();
  const token = params.token as string;

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement join with token
    console.log("Join attempt:", { token, ...formData });
    window.location.href = "/dashboard";
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-50" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">K</span>
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-white mt-4">You&apos;re Invited!</h1>
          <p className="text-slate-400 mt-1">Join your team on KesselOps</p>
        </div>

        {/* Invite Info Card */}
        <motion.div
          className="bg-gradient-to-r from-orange-500/10 to-blue-500/10 border border-orange-500/30 rounded-xl p-4 mb-6"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🍸</span>
            </div>
            <div className="flex-1">
              <h3 className="text-white font-semibold">{mockInvite.venueName}</h3>
              <p className="text-slate-400 text-sm">Invited by {mockInvite.invitedBy}</p>
            </div>
            <Badge variant="secondary">{mockInvite.role}</Badge>
          </div>
        </motion.div>

        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white">Complete Your Profile</CardTitle>
            <CardDescription>
              Set up your account to join {mockInvite.venueName}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="text-sm font-medium text-slate-300">
                    First Name
                  </label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="lastName" className="text-sm font-medium text-slate-300">
                    Last Name
                  </label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-slate-300">
                  Email
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    id="email"
                    type="email"
                    value={mockInvite.email}
                    disabled
                    className="bg-slate-900/50 border-slate-600 text-slate-400"
                  />
                  <CheckCircle className="h-5 w-5 text-green-400 shrink-0" />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-slate-300">
                  Create Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-300">
                  Confirm Password
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
                  required
                />
              </div>

              <Button type="submit" className="w-full" size="lg">
                <UserPlus className="mr-2 h-4 w-4" />
                Join Team
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-slate-400 text-sm">
                By joining, you agree to our{" "}
                <Link href="/terms" className="text-orange-400 hover:text-orange-300">
                  Terms of Service
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </main>
  );
}
