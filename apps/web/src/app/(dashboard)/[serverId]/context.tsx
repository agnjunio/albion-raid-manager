import { createContext, useContext, type ReactNode } from "react";

import { Server } from "@albion-raid-manager/types/entities";

interface ServerContextValue {
  server?: Server;
  hasAdminPermission: boolean;
  hasCallerPermission: boolean;
}

const ServerContext = createContext<ServerContextValue | null>(null);

interface ServerProviderProps {
  children: ReactNode;
  server?: Server;
}

export function ServerProvider({ children, server }: ServerProviderProps) {
  const value: ServerContextValue = {
    server,
    hasAdminPermission: server?.admin ?? false,
    hasCallerPermission: server?.caller ?? false,
  };

  return <ServerContext.Provider value={value}>{children}</ServerContext.Provider>;
}

export function useServerContext(): ServerContextValue {
  const context = useContext(ServerContext);

  if (!context) {
    throw new Error("useServerContext must be used within a ServerProvider");
  }

  return context;
}
