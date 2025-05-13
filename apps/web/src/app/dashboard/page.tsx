import { SidebarProvider } from "@/components/ui/sidebar";
import { useAuth } from "@/lib/auth";
import { Navigate } from "react-router-dom";
import { DashboardProvider } from "./context";
import { DashboardSidebar } from "./sidebar";

export function Dashboard() {
  const { status } = useAuth();

  if (status === "unauthenticated") {
    return <Navigate to="/" />;
  }

  return (
    <DashboardProvider>
      <SidebarProvider>
        <DashboardSidebar />
      </SidebarProvider>
    </DashboardProvider>
  );
}
