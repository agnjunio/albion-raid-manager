import { Server } from "@types";

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
