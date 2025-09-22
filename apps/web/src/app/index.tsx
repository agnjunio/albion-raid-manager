import { faFileCircleExclamation } from "@fortawesome/free-solid-svg-icons";
import { Navigate, Route, Routes } from "react-router-dom";

import { PageError } from "@/components/ui/page";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";

import { AuthCallback } from "./(auth)/callback/page";
import { RaidLayout } from "./(dashboard)/[serverId]/(raids)/[raidId]/layout";
import { RaidPage } from "./(dashboard)/[serverId]/(raids)/[raidId]/page";
import { RaidsPage } from "./(dashboard)/[serverId]/(raids)/page";
import { AdministrationPage } from "./(dashboard)/[serverId]/(settings)/(administration)/page";
import { LocalizationPage } from "./(dashboard)/[serverId]/(settings)/(localization)/page";
import { PermissionsPage } from "./(dashboard)/[serverId]/(settings)/(permissions)/page";
import { RaidsPage as RaidsSettingsPage } from "./(dashboard)/[serverId]/(settings)/(raids)/page";
import { RegistrationPage } from "./(dashboard)/[serverId]/(settings)/(registration)/page";
import { ServerSettingsLayout } from "./(dashboard)/[serverId]/(settings)/layout";
import { ServerSettingsPage } from "./(dashboard)/[serverId]/(settings)/page";
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
                <Route path=":raidId" element={<RaidLayout />}>
                  <Route index element={<RaidPage />} />
                </Route>
              </Route>
              <Route path="settings" element={<ServerSettingsLayout />}>
                <Route index element={<ServerSettingsPage />} />
                <Route path="administration" element={<AdministrationPage />} />
                <Route path="permissions" element={<PermissionsPage />} />
                <Route path="raids" element={<RaidsSettingsPage />} />
                <Route path="registration" element={<RegistrationPage />} />
                <Route path="localization" element={<LocalizationPage />} />
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
