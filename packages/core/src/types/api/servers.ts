import { Guild } from "@types";

import { Server } from "../discord";

export namespace AddServer {
  export type Body = {
    serverId: string;
  };
  export type Response = {
    guild: Guild;
  };
}

export type GetServersResponse = {
  servers: Server[];
};

export namespace GetServerRequest {
  export type Params = {
    serverId: string;
  };
}
export type GetServerResponse = {
  server: Server;
};
