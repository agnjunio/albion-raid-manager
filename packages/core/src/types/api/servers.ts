import { Guild } from "@types";

import { Server } from "../discord";

export namespace AddServerRequest {
  export type Body = {
    serverId: string;
  };
}

export type AddServerResponse = {
  guild: Guild;
};

export type GetServersResponse = {
  servers: Server[];
};

export namespace VerifyServerRequest {
  export type Params = {
    serverId: string;
  };
}

export type VerifyServerResponse = {
  server: Server;
};
