"use client";

import { GuildMember } from "@albion-raid-manager/database/models";
import { createContext, PropsWithChildren, useContext } from "react";

type DashboardContextType = {
  guildMember: GuildMember;
};

const DashboardContext = createContext<DashboardContextType>({} as DashboardContextType);

interface DashboardProviderProps extends PropsWithChildren {
  guildMember: GuildMember;
}

export function DashboardProvider({ children, guildMember }: DashboardProviderProps) {
  return <DashboardContext.Provider value={{ guildMember }}>{children}</DashboardContext.Provider>;
}

export function useDashboardContext() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboardContext must be used within a DashboardProvider");
  }
  return context;
}
