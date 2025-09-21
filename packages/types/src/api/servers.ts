import type { Channel } from "../entities/server-channels";
import type { Server, ServerSettings } from "../entities/servers";

export type APIServerMember = {
  id: string;
  username: string;
  nickname?: string | null;
  avatar: string | null;
  roles?: string[];
  registered: boolean;
  albionPlayerId: string | null;
  albionGuildId: string | null;
  killFame: number;
  deathFame: number;
  lastUpdated: Date | null;
};

export enum APIRoleType {
  ROLE = "ROLE",
  EMOJI = "EMOJI",
}

export type APIRole = {
  id: string;
  name: string;
  type: APIRoleType;
  color?: number;
  position: number;
};

export namespace GetServers {
  export type Response = { servers: Server[] };
}

export namespace VerifyServer {
  export type Body = { serverId: string };
  export type Response = { server: Server };
}

export namespace GetServer {
  export type Params = { serverId: string };
  export type Response = { server: Server };
}

export namespace GetServerMembers {
  export type Params = { serverId: string };
  export type Response = { members: APIServerMember[] };
}

export namespace GetServerSettings {
  export type Params = { serverId: string };
  export type Response = { settings: ServerSettings };
}

export namespace GetServerChannels {
  export type Params = { serverId: string };
  export type Response = { channels: Channel[] };
}
