import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

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
          <Link href="/reserve">
            <Button className="bg-violet-600 hover:bg-violet-700 font-semibold shadow-lg shadow-violet-600/20">Book a Table</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default function GuestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0a0f1a] text-slate-200 selection:bg-violet-500/30 selection:text-white">
      {/* Shared Navbar for all Guest pages */}
      <Navbar />
      {children}
    </div>
  );
}
