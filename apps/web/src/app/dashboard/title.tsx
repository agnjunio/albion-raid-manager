"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeButton } from "@/components/ui/theme";

export function DashboardTitle() {
  return (
    <div className="flex justify-between p-2 py-1 sticky top-0 items-center">
      <SidebarTrigger />
      <ThemeButton variant="ghost" />
    </div>
  );
}
