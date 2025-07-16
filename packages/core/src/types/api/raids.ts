import { Raid, RaidStatus } from "@albion-raid-manager/core/types";

export namespace CreateGuildRaid {
  export type Params = { guildId: string };
  export type Body = {
    description: string;
    date: string;
  };
  export type Response = { raid: Raid };
}

export namespace GetGuildRaids {
  export type Params = { guildId: string };
  export type Response = { raids: Raid[] };
}

export namespace GetGuildRaid {
  export type Params = { guildId: string; raidId: string };
  export type Query = { slots?: boolean };
  export type Response = { raid: Raid };
}

export namespace UpdateGuildRaid {
  export type Params = { guildId: string; raidId: string };
  export type Body = { status: RaidStatus };
  export type Response = { raid: Raid };
}
