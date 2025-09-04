import { Server } from "@albion-raid-manager/core/types";

export type DiscordServer = {
  id: string;
  name: string;
  icon: string | null;
  owner?: boolean;
  admin: boolean;
  bot?: boolean;
};

export namespace GetServers {
  export type Response = { servers: DiscordServer[] };
}

export namespace SetupServer {
  export type Body = { serverId: string };
  export type Response = { server: Server };
}

export namespace GetServer {
  export type Params = { serverId: string };
  export type Response = { server: Server };
}
