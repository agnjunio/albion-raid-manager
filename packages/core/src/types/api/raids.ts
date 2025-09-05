import { Raid, RaidStatus } from "@albion-raid-manager/core/types";

export namespace CreateRaid {
  export type Params = { serverId: string };
  export type Body = {
    title: string;
    description: string;
    date: string;
    location?: string;
    compositionId?: string;
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
