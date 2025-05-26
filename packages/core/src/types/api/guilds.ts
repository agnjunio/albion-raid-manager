import { Guild, Raid } from "@types";

export type GetGuildsResponse = { guilds: Guild[] };
export type GetGuildResponse = { guild: Guild };
export type CreateGuildResponse = { guild: Guild };

export namespace GetGuildRaids {
  export type Params = { guildId: string };
  export type Response = { raids: Raid[] };
}
