import { Server } from "../../generated/index";

export type APIServer = {
  id: string;
  name: string;
  icon: string | null;
  owner?: boolean;
  admin: boolean;
  bot?: boolean;
};

export type APIServerMember = {
  id: string;
  username: string;
  nickname?: string | null;
  avatar: string | null;
  roles?: string[];
  adminPermission: boolean;
  raidPermission: boolean;
  compositionPermission: boolean;
  registered: boolean;
  albionPlayerId: string | null;
  albionGuildId: string | null;
  killFame: number;
  deathFame: number;
  lastUpdated: Date | null;
};

export enum APIChannelType {
  TEXT = "TEXT",
  VOICE = "VOICE",
  CATEGORY = "CATEGORY",
}

export type APIChannel = {
  id: string;
  name: string;
  type: APIChannelType;
  parentId?: string;
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
  export type Response = { servers: APIServer[] };
}

export namespace VerifyServer {
  export type Body = { serverId: string };
  export type Response = { server: APIServer };
}

export namespace GetServer {
  export type Params = { serverId: string };
  export type Response = { server: Server };
}

export namespace GetServerMembers {
  export type Params = { serverId: string };
  export type Response = { members: APIServerMember[] };
}
