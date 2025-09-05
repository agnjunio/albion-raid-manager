import { Navigate, Outlet, useLocation } from "react-router-dom";

import { Container } from "@/components/ui/container";
import { SidebarProvider } from "@/components/ui/sidebar";
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
      <SidebarProvider>
        {isServerRoute && <DashboardSidebar />}

        <Container className="flex w-full flex-1 flex-col">
          <DashboardHeader hasSidebar={isServerRoute} />
          <Outlet />
        </Container>
      </SidebarProvider>
    </DashboardProvider>
  );
}
