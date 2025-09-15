import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeButton } from "@/components/ui/theme";

import { AboutButton } from "./about";

export function DashboardHeader({ hasSidebar }: { hasSidebar: boolean }) {
  return (
    <div className="border-border/50 bg-background text-foreground sticky top-0 z-10 flex items-center justify-between border-b px-4 py-2">
      <div className="flex w-full justify-start gap-2">{hasSidebar && <SidebarTrigger />}</div>
      <div className="flex w-full justify-end gap-2">
        <LanguageSwitcher variant="ghost" />
        <AboutButton variant="ghost" />
        <ThemeButton variant="ghost" />
      </div>
    </div>
  );
}
