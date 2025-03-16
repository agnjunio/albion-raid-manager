import { ReactNode } from "react";

export type DashboardPageProps = {
  params: Promise<{
    guildId: string;
  }>;
};

export type DashboardLayoutProps = {
  params: Promise<{
    guildId: string;
  }>;
  children: ReactNode;
};
