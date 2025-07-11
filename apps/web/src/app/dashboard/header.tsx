import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeButton } from "@/components/ui/theme";

import { AboutButton } from "./about";

export function DashboardHeader() {
  return (
    <div className="border-border/50 bg-background text-foreground sticky top-0 z-10 flex items-center justify-between border-b p-2 py-1">
      <SidebarTrigger />
      <div className="flex gap-2">
        <AboutButton variant="ghost" />
        <ThemeButton variant="ghost" />
      </div>
    </div>
  );
}
