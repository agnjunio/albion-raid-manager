import { Raid } from "@types";

export namespace GetGuildRaids {
  export type Params = { guildId: string };
  export type Response = { raids: Raid[] };
}

export namespace CreateGuildRaid {
  export type Params = { guildId: string };
  export type Body = {
    description: string;
    date: string;
    compositionId?: string;
  };
  export type Response = { raid: Raid };
}
