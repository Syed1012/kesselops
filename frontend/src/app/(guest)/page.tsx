"use client";

import { motion, useScroll, useTransform, useMotionValue, useMotionTemplate } from "framer-motion";

import Link from "next/link";
import {
  Zap,
  BarChart3,
  Users,
  Package,
  ClipboardCheck,
  MessageSquare,
  TrendingUp,
  ArrowRight,
  Shield,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

// ============================================
// MOUSE FOLLOWER EFFECT
// ============================================
function MouseSpotlight() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <div
      className="absolute inset-0 z-0 overflow-hidden pointer-events-none"
      onMouseMove={handleMouseMove}
    >
      <motion.div
        className="absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              rgba(124, 58, 237, 0.1),
              transparent 80%
            )
          `,
        }}
      />
    </div>
  );
}

// ============================================
// ANIMATED BACKGROUND ORBS
// ============================================
function AnimatedOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Primary violet orb */}
      <motion.div
        className="absolute w-[800px] h-[800px] rounded-full blur-[120px] opacity-20"
        style={{
          background: "radial-gradient(circle, #7c3aed 0%, transparent 70%)",
          left: "-10%",
          top: "-20%",
        }}
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 50, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      {/* Cyan accent orb */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full blur-[100px] opacity-20"
        style={{
          background: "radial-gradient(circle, #06b6d4 0%, transparent 70%)",
          right: "-5%",
          top: "20%",
        }}
        animate={{
          scale: [1, 1.3, 1],
          x: [0, -30, 0],
          y: [0, 50, 0],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />
    </div>
  );
}

// ============================================
// FLOATING DASHBOARD MOCKUP
// ============================================
function FloatingDashboardMockup() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 50]);
  const rotateX = useTransform(scrollY, [0, 500], [0, 5]);

  return (
    <div className="relative w-full max-w-[600px] perspective-1000 h-[500px] flex items-center justify-center">
      {/* Glow effect behind card */}
      <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-cyan-500/20 blur-[80px] scale-90" />

      {/* Main Dashboard Card */}
      <motion.div
        className="relative z-20 w-full bg-[#0f1629]/80 backdrop-blur-2xl border border-[#1e293b] rounded-3xl p-8 shadow-2xl shadow-violet-500/20"
        initial={{ opacity: 0, y: 100, rotateX: 20 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        style={{ y, rotateX }}
        transition={{ duration: 1.2, type: "spring", bounce: 0.3 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <motion.div
              className="w-12 h-12 bg-gradient-to-br from-violet-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/30"
              whileHover={{ scale: 1.1, rotate: 10 }}
            >
              <span className="text-white font-bold text-lg">K</span>
            </motion.div>
            <div>
              <p className="text-sm text-slate-400 font-medium">Good evening,</p>
              <p className="font-bold text-white text-lg tracking-tight">The Midnight Lounge</p>
            </div>
          </div>
          <motion.span
            className="px-4 py-1.5 bg-[#10b981]/10 text-[#10b981] text-xs font-bold rounded-full border border-[#10b981]/20 tracking-wider"
            animate={{ boxShadow: ["0 0 0px rgba(16, 185, 129, 0)", "0 0 15px rgba(16, 185, 129, 0.3)", "0 0 0px rgba(16, 185, 129, 0)"] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            OPEN
          </motion.span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Today's Revenue", value: "€2,847", trend: "+12%", color: "text-[#10b981]", trendBg: "bg-[#10b981]/10" },
            { label: "Active Orders", value: "23", trend: "Busy", color: "text-blue-400", trendBg: "bg-blue-500/10" },
            { label: "Low Stock", value: "4", trend: "Alert", color: "text-amber-400", trendBg: "bg-amber-500/10" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              className="bg-[#1a1f3a]/50 border border-[#2a2f4a] rounded-2xl p-4 flex flex-col justify-between" // Glass cards
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + i * 0.15, duration: 0.5 }}
              whileHover={{ y: -5, borderColor: "rgba(124, 58, 237, 0.5)" }}
            >
              <div>
                <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
                <p className="text-xs text-slate-400 font-medium">{stat.label}</p>
              </div>
              <div className={`mt-3 self-start px-2 py-0.5 rounded-md text-[10px] font-bold ${stat.color} ${stat.trendBg}`}>
                {stat.trend}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <motion.button
            className="flex-1 bg-[#7c3aed] text-white text-sm font-semibold py-4 rounded-xl hover:bg-[#6d28d9] transition-all relative overflow-hidden group shadow-lg shadow-violet-500/25"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            View Dashboard
          </motion.button>
          <motion.button
            className="flex-1 bg-[#1e293b]/50 text-slate-300 text-sm font-semibold py-4 rounded-xl border border-[#334155] hover:bg-[#1e293b] transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Manage Menu
          </motion.button>
        </div>
      </motion.div>

      {/* Floating Card 1: New Reservation - Positioned Top Left OUTSIDE */}
      <motion.div
        className="absolute -left-12 top-20 z-30 bg-[#1e293b] border border-[#334155] rounded-2xl p-4 shadow-xl w-64"
        initial={{ opacity: 0, x: -50, rotate: -10 }}
        animate={{ opacity: 1, x: 0, rotate: -6 }}
        transition={{ delay: 1.5, type: "spring", stiffness: 200 }}
        style={{ y: useTransform(scrollY, [0, 500], [0, -30]) }}
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-violet-500/20 rounded-xl flex items-center justify-center shrink-0">
            <MessageSquare className="h-5 w-5 text-violet-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-none mb-1">New Reservation</p>
            <p className="text-xs text-slate-400 leading-snug">Alex M. • Table 4 • 8:00 PM</p>
            <div className="flex gap-2 mt-2">
              <button className="text-[10px] bg-violet-600 text-white px-3 py-1 rounded-full">Accept</button>
              <button className="text-[10px] bg-slate-700 text-slate-300 px-3 py-1 rounded-full">Decline</button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Floating Card 2: Sales Up - Positioned Bottom Right OUTSIDE */}
      <motion.div
        className="absolute -right-8 bottom-32 z-30 bg-[#1e293b] border border-[#334155] rounded-2xl p-4 shadow-xl w-56"
        initial={{ opacity: 0, x: 50, rotate: 10 }}
        animate={{ opacity: 1, x: 0, rotate: 6 }}
        transition={{ delay: 1.7, type: "spring", stiffness: 200 }}
        style={{ y: useTransform(scrollY, [0, 500], [0, -60]) }}
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center shrink-0">
            <TrendingUp className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Sales Spiking</p>
            <p className="text-xs text-emerald-400 font-medium">+23% vs last Friday</p>
          </div>
        </div>
        {/* Tiny chart line */}
        <div className="mt-3 h-8 flex items-end gap-1 px-1">
          {[40, 60, 45, 70, 90, 85, 100].map((h, i) => (
            <motion.div
              key={i}
              className="flex-1 bg-emerald-500/30 rounded-t-sm"
              initial={{ height: 0 }}
              animate={{ height: `${h}%` }}
              transition={{ delay: 2 + i * 0.1, duration: 0.5 }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// ============================================
// HERO SECTION
// ============================================
function HeroSection() {
  const { scrollY } = useScroll();
  const textY = useTransform(scrollY, [0, 300], [0, 100]);
  const textOpacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <section className="relative min-h-[110vh] flex items-center overflow-hidden bg-[#0a0f1a] pt-20 group">
      <MouseSpotlight />
      <AnimatedOrbs />

      <div className="relative z-10 max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
        {/* Left: Copy */}
        <motion.div style={{ y: textY, opacity: textOpacity }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-8 backdrop-blur-sm"
              whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
            >
              <span className="flex h-2 w-2 rounded-full bg-violet-400 animate-pulse" />
              <span className="text-slate-300 text-sm font-medium">v2.0 is now live</span>
            </motion.div>
          </motion.div>

          {/* Staggered Text Reveal */}
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white mb-8 leading-[1]">
            <span className="block overflow-hidden">
              <motion.span
                className="block"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              >
                Order from
              </motion.span>
            </span>
            <span className="block overflow-hidden">
              <motion.span
                className="block text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-white to-cyan-400"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
              >
                Chaos.
              </motion.span>
            </span>
          </h1>

          <motion.p
            className="text-lg md:text-xl text-slate-400 max-w-lg mb-12 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            The comprehensive operating system for modern hospitality.
            Sync front-of-house flow with back-of-house discipline.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <Link href="/table/session" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto text-base px-10 h-14 bg-white text-[#0a0f1a] hover:bg-slate-200 transition-all font-bold tracking-wide"
              >
                View Live Venue
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/demo" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto text-base px-10 h-14 border-[#2a2f4a] bg-transparent text-white hover:bg-white/5 hover:border-white/20 transition-all font-medium"
              >
                <Play className="mr-2 h-4 w-4 fill-white" />
                See Demo
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Right: Floating Dashboard */}
        <div className="hidden lg:flex justify-end relative z-10">
          <FloatingDashboardMockup />
        </div>
      </div>
    </section>
  );
}

// ============================================
// FEATURES SECTION
// ============================================
function FeaturesSection() {
  const features = [
    {
      icon: <ClipboardCheck className="h-6 w-6" />,
      title: "Digital Checklists",
      description: "HACCP-compliant task management for your staff.",
      color: "text-violet-400",
      bg: "bg-violet-400/10"
    },
    {
      icon: <Package className="h-6 w-6" />,
      title: "Smart Inventory",
      description: "AI suggests reorders before you run out.",
      color: "text-cyan-400",
      bg: "bg-cyan-400/10"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Team Scheduling",
      description: "Drag-and-drop shifts with demand forecasting.",
      color: "text-pink-400",
      bg: "bg-pink-400/10"
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Live Analytics",
      description: "Real-time P&L and sales data on any device.",
      color: "text-emerald-400",
      bg: "bg-emerald-400/10"
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Instant 86",
      description: "Kill items from digital menus in one tap.",
      color: "text-amber-400",
      bg: "bg-amber-400/10"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Compliance",
      description: "Automated logs for health & safety audits.",
      color: "text-blue-400",
      bg: "bg-blue-400/10"
    },
  ];

  return (
    <section className="relative py-32 bg-[#0a0f1a] z-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-24">
          <motion.h2
            className="text-4xl md:text-5xl font-bold text-white mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Built for the <span className="text-violet-500">grind.</span>
            <br />
            Designed for <span className="text-cyan-400">growth.</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              className="group p-8 rounded-3xl bg-[#0f1629] border border-[#1e293b] hover:border-violet-500/30 transition-colors relative overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <div className={`w-14 h-14 ${feature.bg} ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-slate-400 text-lg leading-relaxed">{feature.description}</p>

              {/* Hover Glow */}
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-violet-500/5 rounded-full blur-3xl group-hover:bg-violet-500/10 transition-colors" />
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
    <section className="relative py-40 bg-[#0a0f1a] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0f1a] via-[#0f1629] to-[#0a0f1a]" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <motion.h2
          className="text-5xl md:text-7xl font-bold text-white mb-8 tracking-tight"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          Start your <span className="text-violet-500">legacy.</span>
        </motion.h2>

        <motion.p
          className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          viewport={{ once: true }}
        >
          Join the platform that powers the best venues in the world.
          No credit card required. Cancel anytime.
        </motion.p>

        <Link href="/register">
          <Button
            size="lg"
            className="h-16 px-12 text-lg bg-white text-[#0a0f1a] hover:bg-slate-200 hover:scale-105 transition-all shadow-2xl shadow-white/10"
          >
            Start Free Trial
          </Button>
        </Link>
      </div>
    </section>
  );
}

// ============================================
// NAVBAR
// ============================================
function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-6 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-[#0a0f1a] font-black text-lg">K</span>
          </div>
          <span className="text-white font-bold text-xl tracking-tight hidden sm:block">KesselOps</span>
        </Link>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link href="/login">
            <Button variant="ghost" className="text-slate-300 hover:text-white font-medium">Log In</Button>
          </Link>
          <Link href="/register">
            <Button className="bg-violet-600 hover:bg-violet-700 font-semibold shadow-lg shadow-violet-600/20">Get Started</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}

// ============================================
// FOOTER
// ============================================
function Footer() {
  return (
    <footer className="bg-[#0a0f1a] border-t border-white/5 py-12">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <p className="text-slate-500 text-sm">© 2026 KesselOps Inc.</p>
        <div className="flex gap-8 text-sm text-slate-500">
          <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
          <Link href="#" className="hover:text-white transition-colors">Terms</Link>
          <Link href="#" className="hover:text-white transition-colors">Twitter</Link>
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
    <main className="min-h-screen bg-[#0a0f1a] selection:bg-violet-500/30 selection:text-white">
      <HeroSection />
      <FeaturesSection />
      <CTASection />
      <Footer />
    </main>
  );
}
