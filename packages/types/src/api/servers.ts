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

export namespace GetServers {
  export type Response = { servers: APIServer[] };
}

export namespace SetupServer {
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
