"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Building2, ArrowRight, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { register, login, createVenue, storeTokens } from "@/lib/api";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    venueName: "",
    venueType: "BAR",
    venueAddress: "",
    city: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step === 1) {
      // Validate passwords match
      if (formData.password !== formData.confirmPassword) {
        toast.error("Passwords don't match");
        return;
      }
      if (formData.password.length < 6) {
        toast.error("Password must be at least 6 characters");
        return;
      }
      setStep(2);
    } else {
      // Register user, then login, then create venue
      setIsSubmitting(true);
      
      try {
        // Step 1: Register user
        const registerRes = await register({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
        });
        
        if (!registerRes.success) {
          toast.error(registerRes.error || "Registration failed");
          setIsSubmitting(false);
          return;
        }
        
        // Step 2: Login to get tokens
        const loginRes = await login(formData.email, formData.password);
        if (!loginRes.success || !loginRes.data) {
          toast.error("Registration successful but login failed. Please login manually.");
          router.push("/login");
          return;
        }
        
        storeTokens(loginRes.data.accessToken, loginRes.data.refreshToken);
        
        // Step 3: Create venue
        const venueRes = await createVenue({
          name: formData.venueName,
          address: formData.venueAddress || formData.city,
          city: formData.city,
          type: formData.venueType,
        });
        
        if (!venueRes.success) {
          toast.warning("Account created but venue creation failed. You can create a venue later.");
        } else {
          toast.success("Welcome to KesselOps!");
        }
        
        router.push("/dashboard");
      } catch {
        toast.error("Registration failed. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0a0f1a] p-6">
      {/* Subtle gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-violet-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/3 right-1/4 w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-[100px]" />
      </div>

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">K</span>
            </div>
            <span className="text-white font-semibold text-xl">KesselOps</span>
          </Link>
          <h1 className="text-2xl font-bold text-white mt-6">Create Your Account</h1>
          <p className="text-slate-400 mt-1">Start your free trial today</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className={`flex items-center gap-2 ${step >= 1 ? "text-violet-400" : "text-slate-500"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= 1 ? "bg-violet-500 text-white" : "bg-[#1a1f3a] text-slate-400"}`}>
              {step > 1 ? <Check className="h-4 w-4" /> : "1"}
            </div>
            <span className="text-sm hidden sm:inline">Account</span>
          </div>
          <div className="w-12 h-px bg-[#2a2f4a]" />
          <div className={`flex items-center gap-2 ${step >= 2 ? "text-violet-400" : "text-slate-500"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= 2 ? "bg-violet-500 text-white" : "bg-[#1a1f3a] text-slate-400"}`}>
              2
            </div>
            <span className="text-sm hidden sm:inline">Venue</span>
          </div>
        </div>

        <Card className="bg-[#0f1629] border-[#1e293b] backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white">
              {step === 1 ? "Create Account" : "Set Up Your Venue"}
            </CardTitle>
            <CardDescription className="text-slate-400">
              {step === 1
                ? "Enter your details and create a password"
                : "Tell us about your hospitality venue"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {step === 1 ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label htmlFor="firstName" className="text-sm font-medium text-slate-300">
                        First Name
                      </label>
                      <Input
                        id="firstName"
                        type="text"
                        placeholder="Max"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="bg-[#1a1f3a] border-[#2a2f4a] text-white placeholder:text-slate-500 focus:border-violet-500"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="lastName" className="text-sm font-medium text-slate-300">
                        Last Name
                      </label>
                      <Input
                        id="lastName"
                        type="text"
                        placeholder="Müller"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="bg-[#1a1f3a] border-[#2a2f4a] text-white placeholder:text-slate-500 focus:border-violet-500"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-slate-300">
                      Email
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@venue.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="bg-[#1a1f3a] border-[#2a2f4a] text-white placeholder:text-slate-500 focus:border-violet-500"
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium text-slate-300">
                      Password
                    </label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="bg-[#1a1f3a] border-[#2a2f4a] text-white placeholder:text-slate-500 pr-10 focus:border-violet-500"
                        required
                        disabled={isSubmitting}
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
                      className="bg-[#1a1f3a] border-[#2a2f4a] text-white placeholder:text-slate-500 focus:border-violet-500"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <label htmlFor="venueName" className="text-sm font-medium text-slate-300">
                      Venue Name
                    </label>
                    <Input
                      id="venueName"
                      type="text"
                      placeholder="OSCHO Café & Bar"
                      value={formData.venueName}
                      onChange={(e) => setFormData({ ...formData, venueName: e.target.value })}
                      className="bg-[#1a1f3a] border-[#2a2f4a] text-white placeholder:text-slate-500 focus:border-violet-500"
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="venueType" className="text-sm font-medium text-slate-300">
                      Venue Type
                    </label>
                    <select
                      id="venueType"
                      value={formData.venueType}
                      onChange={(e) => setFormData({ ...formData, venueType: e.target.value })}
                      className="flex h-10 w-full rounded-md border border-[#2a2f4a] bg-[#1a1f3a] px-3 py-2 text-sm text-white ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
                      disabled={isSubmitting}
                    >
                      <option value="BAR">Bar / Cocktail Bar</option>
                      <option value="RESTAURANT">Restaurant</option>
                      <option value="CAFE">Café</option>
                      <option value="CLUB">Club / Nightlife</option>
                      <option value="HOTEL">Hotel</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="venueAddress" className="text-sm font-medium text-slate-300">
                      Address
                    </label>
                    <Input
                      id="venueAddress"
                      type="text"
                      placeholder="Theodor-Heuss-Straße 4"
                      value={formData.venueAddress}
                      onChange={(e) => setFormData({ ...formData, venueAddress: e.target.value })}
                      className="bg-[#1a1f3a] border-[#2a2f4a] text-white placeholder:text-slate-500 focus:border-violet-500"
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="city" className="text-sm font-medium text-slate-300">
                      City
                    </label>
                    <Input
                      id="city"
                      type="text"
                      placeholder="Stuttgart"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="bg-[#1a1f3a] border-[#2a2f4a] text-white placeholder:text-slate-500 focus:border-violet-500"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-2">
                {step === 2 && (
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 border-[#2a2f4a] text-slate-300 hover:bg-[#1a1f3a]"
                    onClick={() => setStep(1)}
                    disabled={isSubmitting}
                  >
                    Back
                  </Button>
                )}
                <Button 
                  type="submit" 
                  className="flex-1 bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700" 
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : step === 1 ? (
                    <>
                      Next
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  ) : (
                    <>
                      <Building2 className="mr-2 h-4 w-4" />
                      Create Venue
                    </>
                  )}
                </Button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-slate-400">
                Already have an account?{" "}
                <Link href="/login" className="text-violet-400 hover:text-violet-300 font-medium">
                  Sign In
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </main>
  );
}
