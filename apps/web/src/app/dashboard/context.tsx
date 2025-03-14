"use client";

import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { createContext, PropsWithChildren, useContext, useMemo } from "react";
import { GuildWithMembers } from "./types";

type DashboardContextType = {
  guilds: GuildWithMembers[];
  selectedGuild?: GuildWithMembers;
};

const DashboardContext = createContext<DashboardContextType>({ guilds: [] });

export function DashboardProvider({ children, guilds }: DashboardContextType & PropsWithChildren) {
  const { guildId } = useParams();
  const session = useSession();
  const selectedGuild = useMemo(() => {
    return guildId
      ? guilds.find((guild) => guild.id === Number(guildId))
      : guilds.find((guild) => guild.members.find((member) => member.userId === session.data?.user.id)?.default);
  }, [guildId, guilds, session.data?.user.id]);

  return <DashboardContext.Provider value={{ guilds, selectedGuild }}>{children}</DashboardContext.Provider>;
}

export function useDashboardContext() {
  return useContext(DashboardContext);
}
