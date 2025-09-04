import { Server } from "@albion-raid-manager/core/types";

export type APIServer = {
  id: string;
  name: string;
  icon: string | null;
  owner?: boolean;
  admin: boolean;
};

export namespace AddServer {
  export type Body = { serverId: string };
  export type Response = { server: Server };
}

export namespace GetServers {
  export type Response = { servers: Server[] };
}

export namespace GetServer {
  export type Params = { serverId: string };
  export type Response = { server: Server };
}
