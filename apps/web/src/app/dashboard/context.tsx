import type { Guild } from "@albion-raid-manager/core/types";

import { createContext, useContext, useMemo } from "react";

import { useParams } from "react-router-dom";

import { useApi, type UseApiResult } from "@/lib/api";
import { useAuth } from "@/lib/auth";

type DashboardContextType = {
  fetchGuilds: UseApiResult<Guild[]>;
  selectedGuild?: Guild;
};

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { guildId } = useParams();
  const fetchGuilds = useApi<Guild[]>({
    method: "GET",
    url: "/guilds",
    autoExecute: true,
  });

  const selectedGuild = useMemo(() => {
    if (!fetchGuilds.data) return;

    const { data: guilds } = fetchGuilds;
    return guildId
      ? guilds.find((guild) => guild.id === guildId)
      : guilds.find((guild) => guild.members?.find((member) => member.userId === user?.id)?.default);
  }, [fetchGuilds, guildId, user?.id]);
  return <DashboardContext.Provider value={{ fetchGuilds, selectedGuild }}>{children}</DashboardContext.Provider>;
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
}
