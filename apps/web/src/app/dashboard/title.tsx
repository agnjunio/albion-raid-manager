"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeButton } from "@/components/ui/theme";

export function DashboardTitle() {
  return (
    <div className="sticky top-0 flex items-center justify-between p-2 py-1">
      <SidebarTrigger />
      <ThemeButton variant="ghost" />
    </div>
  );
}
