import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "@/lib/auth";

import { DashboardSidebar } from "./components/dashboard-sidebar";
import { DashboardHeader } from "./components/header";
import { DashboardProvider } from "./contexts/dashboard-context";

export function DashboardLayout() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === "unauthenticated") {
    return <Navigate to="/" />;
  }

  // Check if we're on a server-specific route
  const isServerRoute =
    location.pathname.startsWith("/dashboard/") &&
    location.pathname !== "/dashboard" &&
    location.pathname.split("/").length > 2;

  return (
    <DashboardProvider>
      <div className="flex h-full w-full bg-gray-500/10 dark:bg-gray-200/5">
        {isServerRoute && <DashboardSidebar />}

        <div className="flex min-h-0 flex-1 flex-col">
          <DashboardHeader hasSidebar={isServerRoute} />
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <Outlet />
          </div>
        </div>
      </div>
    </DashboardProvider>
  );
}
