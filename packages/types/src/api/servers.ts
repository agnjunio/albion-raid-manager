import { Server } from "../../generated/index";

export type DiscordServer = {
  id: string;
  name: string;
  icon: string | null;
  owner?: boolean;
  admin: boolean;
  bot?: boolean;
};

export type DiscordServerMember = {
  user: {
    id: string;
    username: string;
    discriminator: string;
    avatar: string | null;
    bot?: boolean;
    system?: boolean;
  };
  nick?: string | null;
  avatar?: string | null;
  roles: string[];
  joined_at: string;
  premium_since?: string | null;
  deaf: boolean;
  mute: boolean;
  flags: number;
  pending?: boolean;
  permissions?: string;
  communication_disabled_until?: string | null;
};

export type ServerMemberWithRegistration = DiscordServerMember & {
  isRegistered: boolean;
  albionPlayerId?: string | null;
  albionGuildId?: string | null;
  killFame?: number;
  deathFame?: number;
  lastUpdated?: Date | null;
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

export namespace GetServerMembers {
  export type Params = { serverId: string };
  export type Response = { members: ServerMemberWithRegistration[] };
}
