import { ContentType, Raid, RaidRole } from "../../generated/index";

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

export namespace UpdateRaid {
  export type Params = { serverId: string; raidId: string };
  export type Body = Partial<Raid>;
  export type Response = { raid: Raid };
}

export namespace DeleteRaid {
  export type Params = { serverId: string; raidId: string };
  export type Response = { message: string };
}

export namespace CreateRaidSlot {
  export type Params = { serverId: string; raidId: string };
  export type Body = { name: string; role?: RaidRole; comment?: string; order?: number };
  export type Response = { raid: Raid };
}

export namespace UpdateRaidSlot {
  export type Params = { raidId: string; slotId: string };
  export type Body = { name?: string; role?: RaidRole; comment?: string; userId?: string | null; order?: number };
  export type Response = { raid: Raid };
}

export namespace DeleteRaidSlot {
  export type Params = { raidId: string; slotId: string };
  export type Response = { message: string };
}
