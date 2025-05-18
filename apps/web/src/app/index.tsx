import { cn } from "@albion-raid-manager/core/helpers";
import { Route, Routes } from "react-router-dom";

import { AuthCallback } from "./auth/callback";
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
        </Route>
      </Routes>
    </div>
  );
}
