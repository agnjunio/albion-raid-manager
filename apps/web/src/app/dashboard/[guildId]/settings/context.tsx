"use client";

import { updateGuild } from "@/actions/guilds";
import { Guild } from "@albion-raid-manager/database/models";
import { APIGuild, APIRole } from "@albion-raid-manager/discord";
import { createContext, PropsWithChildren, useCallback, useContext, useState } from "react";

type SettingsContextType = {
  guild: Guild;
  server: APIGuild;
  isLoading: boolean;
  setBotSettingsRoles: (roles: APIRole[]) => void;
  setRaidRoles: (roles: APIRole[]) => void;
  setCompositionRoles: (roles: APIRole[]) => void;
};

const SettingsContext = createContext<SettingsContextType>({} as SettingsContextType);

interface SettingsProviderProps extends PropsWithChildren {
  guild: Guild;
  server: APIGuild;
}

export function SettingsProvider({ children, guild: initialGuild, server }: SettingsProviderProps) {
  const [guild, setGuild] = useState<Guild>(initialGuild);
  const [isLoading, setIsLoading] = useState(false);

  const updateGuildData = useCallback(
    async (data: Partial<Guild>) => {
      setIsLoading(true);
      const response = await updateGuild(guild.id, data);
      if (response.success) {
        setGuild(response.data.guild);
      }
      setIsLoading(false);
    },
    [guild],
  );

  const setBotSettingsRoles = useCallback(
    async (roles: APIRole[]) => {
      await updateGuildData({ adminRoles: roles.map((role) => role.id) });
    },
    [updateGuildData],
  );

  const setRaidRoles = useCallback(
    async (roles: APIRole[]) => {
      await updateGuildData({ raidRoles: roles.map((role) => role.id) });
    },
    [updateGuildData],
  );

  const setCompositionRoles = useCallback(
    async (roles: APIRole[]) => {
      await updateGuildData({ compositionRoles: roles.map((role) => role.id) });
    },
    [updateGuildData],
  );

  return (
    <SettingsContext.Provider
      value={{ guild, server, setBotSettingsRoles, setRaidRoles, setCompositionRoles, isLoading }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettingsContext() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettingsContext must be used within a SettingsProvider");
  }
  return context;
}
