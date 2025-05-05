"use client";

import { APIGuild } from "@albion-raid-manager/discord";
import { createContext, PropsWithChildren, useContext } from "react";

type SettingsContextType = {
  server?: APIGuild;
};

const SettingsContext = createContext<SettingsContextType>({});

interface SettingsProviderProps extends PropsWithChildren {
  server: APIGuild;
}

export function SettingsProvider({ children, server }: SettingsProviderProps) {
  return <SettingsContext.Provider value={{ server }}>{children}</SettingsContext.Provider>;
}

export function useSettingsContext() {
  return useContext(SettingsContext);
}
