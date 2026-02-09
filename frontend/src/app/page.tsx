"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useMemo } from "react";
import Link from "next/link";
import {
  Zap,
  BarChart3,
  Users,
  Package,
  ClipboardCheck,
  Sparkles,
  ArrowRight,
  Check,
  MessageSquare,
  TrendingUp,
  Shield,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

// ============================================
// ANIMATED BACKGROUND ORBS
// ============================================
function AnimatedOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Primary violet orb */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(124, 58, 237, 0.15) 0%, transparent 70%)",
          left: "20%",
          top: "10%",
        }}
        animate={{
          scale: [1, 1.1, 1],
          x: [0, 30, 0],
          y: [0, -20, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      {/* Cyan accent orb */}
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(6, 182, 212, 0.12) 0%, transparent 70%)",
          right: "15%",
          bottom: "20%",
        }}
        animate={{
          scale: [1, 1.15, 1],
          x: [0, -20, 0],
          y: [0, 25, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />
      {/* Small accent orb */}
      <motion.div
        className="absolute w-[200px] h-[200px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(124, 58, 237, 0.1) 0%, transparent 70%)",
          left: "60%",
          top: "40%",
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}

// ============================================
// FLOATING DASHBOARD MOCKUP
// ============================================
function FloatingDashboardMockup() {
  return (
    <motion.div
      className="relative w-full max-w-lg"
      initial={{ opacity: 0, y: 60, rotateX: 10 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 1, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {/* Glow effect behind card */}
      <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-cyan-500/20 blur-3xl scale-110" />
      
      {/* Main Dashboard Card */}
      <motion.div 
        className="relative bg-[#0f1629]/90 backdrop-blur-xl border border-[#1e293b]/80 rounded-2xl p-6 shadow-2xl"
        whileHover={{ y: -5 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <motion.div 
              className="w-10 h-10 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl flex items-center justify-center"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <span className="text-white font-bold">K</span>
            </motion.div>
            <div>
              <p className="text-sm text-slate-400">Good evening,</p>
              <p className="font-semibold text-white">The Midnight Lounge</p>
            </div>
          </div>
          <motion.span 
            className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded-full border border-emerald-500/30"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            OPEN NOW
          </motion.span>
        </div>

        {/* Stats Grid with staggered animation */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Today's Revenue", value: "€2,847", trend: "+12%", color: "text-emerald-400" },
            { label: "Active Orders", value: "23", trend: "", color: "" },
            { label: "Low Stock Items", value: "4", trend: "Needs attention", color: "text-amber-400" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              className="bg-[#1a1f3a]/80 backdrop-blur rounded-xl p-4 border border-[#2a2f4a]/50"
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.7 + i * 0.15, duration: 0.5 }}
            >
              <motion.p 
                className="text-2xl font-bold text-white"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 + i * 0.1 }}
              >
                {stat.value}
              </motion.p>
              <p className="text-xs text-slate-400">{stat.label}</p>
              {stat.trend && (
                <span className={`text-xs ${stat.color}`}>{stat.trend}</span>
              )}
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2">
          <motion.button 
            className="flex-1 bg-gradient-to-r from-violet-500 to-violet-600 text-white text-sm font-medium py-3 rounded-xl hover:shadow-lg hover:shadow-violet-500/25 transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            View Dashboard
          </motion.button>
          <motion.button 
            className="flex-1 bg-[#1a1f3a] text-slate-300 text-sm font-medium py-3 rounded-xl border border-[#2a2f4a] hover:bg-[#252b4a] transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Manage Menu
          </motion.button>
        </div>
      </motion.div>

      {/* Floating notification cards */}
      <motion.div
        className="absolute -left-16 top-4 bg-[#0f1629]/95 backdrop-blur-xl border border-[#1e293b] rounded-xl p-3 shadow-xl"
        initial={{ opacity: 0, x: -40, scale: 0.8 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ delay: 1.2, duration: 0.5, type: "spring" }}
      >
        <div className="flex items-center gap-3">
          <motion.div 
            className="w-9 h-9 bg-violet-500/20 rounded-lg flex items-center justify-center"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          >
            <MessageSquare className="h-4 w-4 text-violet-400" />
          </motion.div>
          <div>
            <p className="text-xs font-medium text-white">New Reservation</p>
            <p className="text-xs text-slate-400">Table for 4 at 8pm</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="absolute -right-12 bottom-20 bg-[#0f1629]/95 backdrop-blur-xl border border-[#1e293b] rounded-xl p-3 shadow-xl"
        initial={{ opacity: 0, x: 40, scale: 0.8 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ delay: 1.4, duration: 0.5, type: "spring" }}
      >
        <div className="flex items-center gap-3">
          <motion.div 
            className="w-9 h-9 bg-emerald-500/20 rounded-lg flex items-center justify-center"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          </motion.div>
          <div>
            <p className="text-xs font-medium text-white">Sales Up</p>
            <p className="text-xs text-slate-400">+23% vs last week</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ============================================
// HERO SECTION WITH PREMIUM ANIMATIONS
// ============================================
function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-[#0a0f1a]">
      <AnimatedOrbs />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
        }}
      />

      {/* Animated scan line */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-violet-500/5 to-transparent"
        animate={{ x: ["-100%", "200%"] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-32 grid lg:grid-cols-2 gap-16 items-center">
        {/* Left: Copy */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.span 
              className="inline-flex items-center gap-2 px-4 py-2 bg-violet-500/10 border border-violet-500/20 rounded-full text-violet-400 text-sm font-medium mb-8"
              animate={{ boxShadow: ["0 0 20px rgba(124,58,237,0)", "0 0 20px rgba(124,58,237,0.3)", "0 0 20px rgba(124,58,237,0)"] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Sparkles className="h-4 w-4" />
              The future of hospitality ops
            </motion.span>
          </motion.div>

          <motion.h1
            className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-8 leading-[1.1]"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            Run your venue
            <motion.span 
              className="block text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-violet-300 to-cyan-400"
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
              style={{ backgroundSize: "200% 200%" }}
            >
              like never before.
            </motion.span>
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl text-slate-400 max-w-lg mb-10 leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            The all-in-one operating system for bars, restaurants, and cafés.
            Real-time insights. Seamless scheduling. AI-powered decisions.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <Link href="/register">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  size="lg" 
                  className="text-base px-8 h-14 bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700 shadow-lg shadow-violet-500/25 border-0"
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            </Link>
            <Link href="/login">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-base px-8 h-14 border-[#2a2f4a] text-slate-300 hover:bg-[#1a1f3a] hover:text-white hover:border-violet-500/50"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Watch Demo
                </Button>
              </motion.div>
            </Link>
          </motion.div>

          {/* Social proof with animated avatars */}
          <motion.div
            className="mt-14 flex items-center gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="flex -space-x-3">
              {["A", "B", "C", "D", "E"].map((letter, i) => (
                <motion.div
                  key={i}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 border-2 border-[#0a0f1a] flex items-center justify-center text-white text-sm font-medium shadow-lg"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + i * 0.1, type: "spring" }}
                  whileHover={{ y: -4, zIndex: 10 }}
                />
              ))}
            </div>
            <div>
              <p className="text-white font-semibold">Trusted by 500+ venues</p>
              <p className="text-slate-400 text-sm">across Germany & Europe</p>
            </div>
          </motion.div>
        </div>

        {/* Right: Floating Dashboard */}
        <div className="hidden lg:flex justify-center perspective-1000">
          <FloatingDashboardMockup />
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 10, 0] }}
        transition={{ opacity: { delay: 1.5 }, y: { duration: 2, repeat: Infinity } }}
      >
        <div className="w-7 h-11 border-2 border-slate-600 rounded-full flex justify-center pt-2">
          <motion.div 
            className="w-1.5 h-3 bg-gradient-to-b from-violet-400 to-cyan-400 rounded-full"
            animate={{ y: [0, 8, 0], opacity: [1, 0.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </section>
  );
}

// ============================================
// FEATURES SECTION WITH HOVER EFFECTS
// ============================================
function FeaturesSection() {
  const features = [
    {
      icon: <ClipboardCheck className="h-6 w-6" />,
      title: "Digital Checklists",
      description:
        "HACCP-compliant task management with photo uploads, temp logs, and instant audits.",
      gradient: "from-emerald-500 to-emerald-600",
    },
    {
      icon: <Package className="h-6 w-6" />,
      title: "Smart Inventory",
      description:
        "Track every drop. AI suggests reorders before you run out.",
      gradient: "from-blue-500 to-blue-600",
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Shift Scheduling",
      description:
        "Drag-and-drop scheduling with auto-suggestions based on demand.",
      gradient: "from-purple-500 to-purple-600",
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Real-Time Analytics",
      description:
        "Sales, profit margins, and COGS at your fingertips. Always.",
      gradient: "from-amber-500 to-amber-600",
    },
    {
      icon: <Sparkles className="h-6 w-6" />,
      title: "AI Assistant",
      description:
        "Generate descriptions, predict demand, get automated summaries.",
      gradient: "from-pink-500 to-pink-600",
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Instant 86",
      description:
        "One tap to mark items unavailable. Syncs to digital menu instantly.",
      gradient: "from-red-500 to-red-600",
    },
  ];

  return (
    <section className="relative py-32 bg-[#0a0f1a]">
      {/* Subtle background gradient */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-violet-500/5 rounded-full blur-[150px]" />
      </div>

      <div className="relative max-w-6xl mx-auto px-6">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <motion.span 
            className="text-violet-400 text-sm font-semibold uppercase tracking-wider"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            viewport={{ once: true }}
          >
            Powerful Features
          </motion.span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mt-4 mb-6">
            Everything you need to
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">
              {" "}
              run the show
            </span>
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            From opening to close, from cellar to register — one platform to
            rule them all.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              className="group relative bg-[#0f1629] border border-[#1e293b] rounded-2xl p-8 hover:border-violet-500/50 transition-all duration-500 overflow-hidden"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -8 }}
            >
              {/* Hover gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <motion.div 
                className={`relative w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg`}
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {feature.icon}
              </motion.div>
              <h3 className="relative text-xl font-semibold text-white mb-3">
                {feature.title}
              </h3>
              <p className="relative text-slate-400 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================
// HOW IT WORKS SECTION
// ============================================
function HowItWorksSection() {
  const steps = [
    {
      step: "01",
      title: "Create your venue",
      description:
        "Set up your venue profile, add your team, and configure your menu in minutes.",
    },
    {
      step: "02",
      title: "Connect your workflow",
      description:
        "Import inventory, set up checklists, and create your shift templates.",
    },
    {
      step: "03",
      title: "Run like a pro",
      description:
        "Monitor everything in real-time, get AI insights, and watch your venue thrive.",
    },
  ];

  return (
    <section className="relative py-32 bg-gradient-to-b from-[#0a0f1a] to-[#0f1629]">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="text-violet-400 text-sm font-semibold uppercase tracking-wider">
            How it works
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mt-4">
            Up and running in <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">minutes</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-12">
          {steps.map((item, i) => (
            <motion.div
              key={i}
              className="relative text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              viewport={{ once: true }}
            >
              <motion.div 
                className="text-7xl font-bold bg-gradient-to-br from-violet-500/20 to-cyan-500/20 text-transparent bg-clip-text mb-6"
                whileHover={{ scale: 1.1 }}
              >
                {item.step}
              </motion.div>
              <h3 className="text-xl font-semibold text-white mb-3">
                {item.title}
              </h3>
              <p className="text-slate-400">{item.description}</p>

              {/* Animated connector line */}
              {i < steps.length - 1 && (
                <motion.div 
                  className="hidden md:block absolute top-10 left-full w-full h-0.5"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  transition={{ delay: 0.5 + i * 0.2, duration: 0.8 }}
                  viewport={{ once: true }}
                  style={{ transformOrigin: "left" }}
                >
                  <div className="h-full bg-gradient-to-r from-violet-500/50 to-transparent -translate-x-1/2" />
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================
// CTA SECTION
// ============================================
function CTASection() {
  return (
    <section className="relative py-32 bg-[#0f1629] overflow-hidden">
      {/* Animated gradient orbs */}
      <motion.div 
        className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-violet-500/20 rounded-full blur-[120px]"
        animate={{ scale: [1, 1.2, 1], x: [0, 30, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div 
        className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-cyan-500/15 rounded-full blur-[100px]"
        animate={{ scale: [1, 1.3, 1], y: [0, -20, 0] }}
        transition={{ duration: 10, repeat: Infinity, delay: 1 }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8">
            Ready to transform your
            <motion.span 
              className="block text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-400 to-cyan-400"
              animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
              transition={{ duration: 5, repeat: Infinity }}
              style={{ backgroundSize: "200% 200%" }}
            >
              venue operations?
            </motion.span>
          </h2>

          <p className="text-lg text-slate-400 mb-12 max-w-xl mx-auto">
            Join hundreds of venues already using KesselOps to streamline their
            operations, reduce costs, and delight their guests.
          </p>

          <Link href="/register">
            <motion.div 
              className="inline-block"
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.98 }}
            >
              <Button
                size="lg"
                className="text-lg px-12 py-7 h-auto bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700 shadow-xl shadow-violet-500/30 border-0"
              >
                Start Free Trial
                <ArrowRight className="ml-3 h-5 w-5" />
              </Button>
            </motion.div>
          </Link>

          {/* Trust badges */}
          <motion.div 
            className="mt-14 flex flex-wrap justify-center gap-8 text-slate-400 text-sm"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            viewport={{ once: true }}
          >
            {[
              { icon: <Check className="h-4 w-4" />, text: "No credit card required" },
              { icon: <Shield className="h-4 w-4" />, text: "GDPR compliant" },
              { icon: <Zap className="h-4 w-4" />, text: "Setup in 5 minutes" },
            ].map((badge, i) => (
              <motion.div 
                key={i} 
                className="flex items-center gap-2"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                viewport={{ once: true }}
              >
                <span className="text-emerald-400">{badge.icon}</span>
                <span>{badge.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================
// NAVBAR
// ============================================
function Navbar() {
  return (
    <motion.nav 
      className="fixed top-0 left-0 right-0 z-50 bg-[#0a0f1a]/80 backdrop-blur-xl border-b border-[#1e293b]/50"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <motion.div 
            className="w-9 h-9 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/25"
            whileHover={{ scale: 1.1, rotate: 5 }}
          >
            <span className="text-white font-bold text-sm">K</span>
          </motion.div>
          <span className="text-white font-semibold text-xl">KesselOps</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {["Features", "Pricing", "About"].map((item) => (
            <Link
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-slate-400 hover:text-white transition-colors relative group"
            >
              {item}
              <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-violet-500 group-hover:w-full transition-all duration-300" />
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link href="/login">
            <Button variant="ghost" className="text-slate-300 hover:text-white">
              Log In
            </Button>
          </Link>
          <Link href="/register">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button className="bg-violet-500 hover:bg-violet-600 shadow-lg shadow-violet-500/25">
                Get Started
              </Button>
            </motion.div>
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}

// ============================================
// FOOTER
// ============================================
function Footer() {
  return (
    <footer className="bg-[#0a0f1a] border-t border-[#1e293b] py-12">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-violet-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">K</span>
            </div>
            <span className="text-white font-semibold">KesselOps</span>
          </div>

          <p className="text-slate-500 text-sm">
            © 2026 KesselOps. Made for the hospitality industry.
          </p>

          <div className="flex gap-6 text-sm text-slate-400">
            {["Privacy", "Terms", "Contact"].map((link) => (
              <Link key={link} href="#" className="hover:text-white transition-colors">
                {link}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

// ============================================
// MAIN PAGE
// ============================================
export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#0a0f1a]">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <CTASection />
      <Footer />
    </main>
  );
}
