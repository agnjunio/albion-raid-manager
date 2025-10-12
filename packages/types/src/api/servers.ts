import type { Channel } from "../entities/server-channels";
import type { ServerMember } from "../entities/server-members";
import type { Role } from "../entities/server-roles";
import type { ServerSettings } from "../entities/server-settings";
import type { Server } from "../entities/servers";

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
  export type Response = { members: ServerMember[] };
}

export namespace GetServerSettings {
  export type Params = { serverId: string };
  export type Response = { settings: ServerSettings };
}

export namespace GetServerChannels {
  export type Params = { serverId: string };
  export type Response = { channels: Channel[] };
}

export namespace GetServerRoles {
  export type Params = { serverId: string };
  export type Response = { roles: Role[] };
}
