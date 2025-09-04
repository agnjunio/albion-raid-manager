import { cn } from "@albion-raid-manager/core/helpers";
import { faFileCircleExclamation } from "@fortawesome/free-solid-svg-icons";
import { Navigate, Route, Routes } from "react-router-dom";

import { PageError } from "@/components/ui/page";

import { AuthCallback } from "./(auth)/callback/page";
import { ServerLayout } from "./(dashboard)/[serverId]/layout";
import { RaidPage } from "./(dashboard)/[serverId]/raids/[raidId]/page";
import { CreateRaidPage } from "./(dashboard)/[serverId]/raids/create/page";
import { RaidsPage } from "./(dashboard)/[serverId]/raids/page";
import { DashboardLayout } from "./(dashboard)/layout";
import { DashboardPage } from "./(dashboard)/page";
import { ServerSetupPage } from "./(setup)/[serverId]/page";
import { Home } from "./home";

export default function App() {
  return (
    <div
      className={cn(
        "bg-background text-foreground flex h-screen w-screen flex-col items-center font-sans antialiased",
        "font-dm-sans",
      )}
    >
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path=":serverId" element={<ServerLayout />}>
            <Route index element={<Navigate to="raids" replace />} />
            <Route path="raids">
              <Route index element={<RaidsPage />} />
              <Route path="create" element={<CreateRaidPage />} />
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
  );
}
