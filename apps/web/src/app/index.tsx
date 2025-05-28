import { cn } from "@albion-raid-manager/core/helpers";
import { faFileCircleExclamation } from "@fortawesome/free-solid-svg-icons";
import { Navigate, Route, Routes } from "react-router-dom";

import { PageError } from "@/components/ui/page";

import { AuthCallback } from "./auth/callback";
import { CreateGuildPage } from "./dashboard/create/page";
import { CreateRaidPage } from "./dashboard/guildId/raids/create/page";
import { RaidsPage } from "./dashboard/guildId/raids/page";
import { RaidPage } from "./dashboard/guildId/raids/raidId/page";
import { DashboardLayout } from "./dashboard/layout";
import { DashboardPage } from "./dashboard/page";
import { Home } from "./home/page";

export default function App() {
  return (
    <div
      className={cn(
        "bg-background text-foreground flex h-screen flex-col items-center font-sans antialiased",
        "font-dm-sans",
      )}
    >
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="create" element={<CreateGuildPage />} />
          <Route path=":guildId">
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
      </Routes>
    </div>
  );
}
