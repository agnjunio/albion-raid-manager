"use client";

import { GuildMemberWithUser } from "@/types/database";
import { createContext, PropsWithChildren, useContext } from "react";

type MembersContextType = {
  guildMembers: GuildMemberWithUser[];
};

const MembersContext = createContext<MembersContextType>({ guildMembers: [] });

export function MembersProvider({ children, guildMembers }: MembersContextType & PropsWithChildren) {
  return <MembersContext.Provider value={{ guildMembers }}>{children}</MembersContext.Provider>;
}

export function useMembersContext() {
  return useContext(MembersContext);
}
