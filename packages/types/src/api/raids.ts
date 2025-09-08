import { Raid, RaidStatus } from "../../generated/index";

export namespace CreateRaid {
  export type Params = { serverId: string };
  export type Body = {
    title: string;
    contentType?:
      | "SOLO_DUNGEON"
      | "OPEN_WORLD_FARMING"
      | "GROUP_DUNGEON"
      | "AVALONIAN_DUNGEON_FULL_CLEAR"
      | "AVALONIAN_DUNGEON_BUFF_ONLY"
      | "ROADS_OF_AVALON_PVE"
      | "ROADS_OF_AVALON_PVP"
      | "DEPTHS_DUO"
      | "DEPTHS_TRIO"
      | "GANKING_SQUAD"
      | "FIGHTING_SQUAD"
      | "ZVZ_CALL_TO_ARMS"
      | "HELLGATE_2V2"
      | "HELLGATE_5V5"
      | "HELLGATE_10V10"
      | "MISTS_SOLO"
      | "MISTS_DUO"
      | "OTHER";
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
