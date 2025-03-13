import { NextRequest } from "next/server";
import { ReactNode } from "react";

export type DashboardPageProps = {
  params: Promise<{
    guildId: string;
  }>;
  request: NextRequest;
};

export type DashboardLayoutProps = {
  params: Promise<{
    guildId: string;
  }>;
  children: ReactNode;
};
