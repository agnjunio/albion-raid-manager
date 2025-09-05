import { cn } from "@albion-raid-manager/core/helpers";
import { faFileCircleExclamation } from "@fortawesome/free-solid-svg-icons";
import { Navigate, Route, Routes } from "react-router-dom";

import { PageError } from "@/components/ui/page";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";

import { AuthCallback } from "./(auth)/callback/page";
import { RaidPage } from "./(dashboard)/[serverId]/(raids)/[raidId]/page";
import { RaidsPage } from "./(dashboard)/[serverId]/(raids)/page";
import { ServerLayout } from "./(dashboard)/[serverId]/layout";
import { DashboardLayout } from "./(dashboard)/layout";
import { DashboardPage } from "./(dashboard)/page";
import { ServerSetupPage } from "./(setup)/[serverId]/page";
import { Home } from "./home";

export default function App() {
  return (
    <SidebarProvider>
      <div className={cn("h-screen w-screen", "bg-background text-foreground", "font-sans antialiased")}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path=":serverId" element={<ServerLayout />}>
              <Route index element={<Navigate to="raids" replace />} />
              <Route path="raids">
                <Route index element={<RaidsPage />} />
                <Route path=":raidId" element={<RaidPage />} />
              </Route>
              <Route
                path="*"
                element={<PageError icon={faFileCircleExclamation} error="Page not found" className="px-10 py-4" />}
              />
            </Route>
          </Route>
          <Route path="/setup/:serverId" element={<ServerSetupPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      <Toaster />
    </SidebarProvider>
  );
}
