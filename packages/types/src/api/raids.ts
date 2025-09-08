import { ContentType, Raid, RaidRole, RaidSlot, RaidStatus } from "../../generated/index";

export namespace CreateRaid {
  export type Params = { serverId: string };
  export type Body = {
    title: string;
    contentType?: ContentType;
    description: string;
    date: string;
    location?: string;
    maxPlayers?: number;
  };
  export type Response = { raid: Raid };
}

export namespace GetRaids {
  export type Params = {
    serverId: string;
    from?: Date;
    to?: Date;
  };
  export type Response = { raids: Raid[] };
}

export namespace GetRaid {
  export type Params = { serverId: string; raidId: string };
  export type Query = { slots?: boolean };
  export type Response = { raid: Raid };
}

export namespace UpdateGuildRaid {
  export type Params = { serverId: string; raidId: string };
  export type Body = { status: RaidStatus };
  export type Response = { raid: Raid };
}

export namespace CreateRaidSlot {
  export type Params = { serverId: string; raidId: string };
  export type Body = { name: string; role?: RaidRole; comment?: string };
  export type Response = { slot: RaidSlot };
}
