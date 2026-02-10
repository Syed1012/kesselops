"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

// Lazy-load role-specific dashboards
const OwnerDashboard = dynamic(() => import("./owner/page"), {
  loading: () => <DashboardLoader />,
});
const ManagerDashboard = dynamic(() => import("./manager/page"), {
  loading: () => <DashboardLoader />,
});
const StaffDashboard = dynamic(() => import("./staff/page"), {
  loading: () => <DashboardLoader />,
});

function DashboardLoader() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) return <DashboardLoader />;

  switch (user.role) {
    case "OWNER":
      return <OwnerDashboard />;
    case "MANAGER":
    case "CHEF":
      return <ManagerDashboard />;
    case "STAFF":
    case "TRAINEE":
    default:
      return <StaffDashboard />;
  }
}
