"use client";

import { GuildMemberWithUser } from "@/types/database";
import { createContext, useContext, useState } from "react";

type MembersContextType = {
  guildMembers: GuildMemberWithUser[];
  setGuildMembers: (guildMembers: GuildMemberWithUser[]) => void;
};

const MembersContext = createContext<MembersContextType>({ guildMembers: [], setGuildMembers: () => {} });

interface MembersProviderProps {
  guildMembers: GuildMemberWithUser[];
  children: React.ReactNode;
}

export function MembersProvider({ children, guildMembers: initialGuildMembers }: MembersProviderProps) {
  const [guildMembers, setGuildMembers] = useState<GuildMemberWithUser[]>(initialGuildMembers);
  return <MembersContext.Provider value={{ guildMembers, setGuildMembers }}>{children}</MembersContext.Provider>;
}

export function useMembersContext() {
  return useContext(MembersContext);
}
