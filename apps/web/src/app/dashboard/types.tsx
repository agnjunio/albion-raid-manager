import { Guild, GuildMember } from "@albion-raid-manager/database/models";
import { NextRequest } from "next/server";
import { ReactNode } from "react";

export type GuildWithMembers = Guild & {
  members: GuildMember[];
};

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
