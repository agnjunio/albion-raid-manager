import { useApi, type UseApiResult } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { GuildWithMembers } from "@albion-raid-manager/core/types";
import { createContext, useContext, useMemo } from "react";
import { useParams } from "react-router-dom";

type DashboardContextType = {
  fetchGuilds: UseApiResult<GuildWithMembers[]>;
  selectedGuild?: GuildWithMembers;
};

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { guildId } = useParams();
  const fetchGuilds = useApi<GuildWithMembers[]>({
    method: "GET",
    url: "/guilds",
    autoExecute: true,
  });

  const selectedGuild = useMemo(() => {
    if (!fetchGuilds.data) return;

    const { data: guilds } = fetchGuilds;
    return guildId
      ? guilds.find((guild) => guild.id === guildId)
      : guilds.find((guild) => guild.members.find((member) => member.userId === user?.id)?.default);
  }, []);
  return <DashboardContext.Provider value={{ fetchGuilds, selectedGuild }}>{children}</DashboardContext.Provider>;
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
}
