import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "@/lib/auth";

import { DashboardProvider } from "./contexts/dashboard-context";

export function DashboardLayout() {
  const { status } = useAuth();

  if (status === "unauthenticated") {
    return <Navigate to="/" />;
  }

  return (
    <DashboardProvider>
      <div className="flex size-full overflow-auto bg-gray-500/10 dark:bg-gray-200/5">
        <div className="flex flex-1 flex-col">
          <Outlet />
        </div>
      </div>
    </DashboardProvider>
  );
}
