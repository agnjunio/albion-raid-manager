import type { Guild, GuildMember } from "@albion-raid-manager/core/types";

import { createContext, useContext, useMemo } from "react";

import { useParams } from "react-router-dom";

import { useAuth } from "@/lib/auth";
import { useGetGuildsQuery } from "@/store/guilds";

type DashboardContextType = {
  selectedGuild?: Guild;
};

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { guildId } = useParams();
  const fetchGuilds = useGetGuildsQuery();

  const selectedGuild = useMemo(() => {
    if (!fetchGuilds.data) return;

    const { guilds } = fetchGuilds.data;
    return guildId
      ? guilds.find((guild: Guild) => guild.id === guildId)
      : guilds.find(
          (guild: Guild) => guild.members?.find((member: GuildMember) => member.userId === user?.id)?.default,
        );
  }, [fetchGuilds.data, guildId, user?.id]);
  return <DashboardContext.Provider value={{ selectedGuild }}>{children}</DashboardContext.Provider>;
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
}
