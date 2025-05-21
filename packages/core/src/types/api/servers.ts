import { Guild } from "@types";

import { Server } from "../discord";

export type AddServerRequestBody = {
  serverId: string;
};
export type AddServerResponse = {
  guild: Guild;
};

export type GetServersResponse = {
  servers: Server[];
};
