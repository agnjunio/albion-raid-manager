import { Navigate, Outlet } from "react-router-dom";

import { Container } from "@/components/ui/container";
import { useAuth } from "@/lib/auth";

import { DashboardHeader } from "./components/header";
import { DashboardProvider } from "./contexts/dashboard-context";

export function DashboardLayout() {
  const { status } = useAuth();

  if (status === "unauthenticated") {
    return <Navigate to="/" />;
  }

  return (
    <DashboardProvider>
      <Container className="flex w-full flex-1 flex-col">
        <DashboardHeader />
        <Outlet />
      </Container>
    </DashboardProvider>
  );
}
