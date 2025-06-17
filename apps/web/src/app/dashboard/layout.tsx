import { Navigate, Outlet } from "react-router-dom";

import { Container } from "@/components/ui/container";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useAuth } from "@/lib/auth";

import { DashboardProvider } from "./context";
import { DashboardHeader } from "./header";
import { DashboardSidebar } from "./sidebar";

export function DashboardLayout() {
  const { status } = useAuth();

  if (status === "unauthenticated") {
    return <Navigate to="/" />;
  }

  return (
    <DashboardProvider>
      <SidebarProvider>
        <DashboardSidebar />
        <Container className="flex flex-1 flex-col">
          <DashboardHeader />
          <Outlet />
        </Container>
      </SidebarProvider>
    </DashboardProvider>
  );
}
