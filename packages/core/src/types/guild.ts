import { Guild, GuildMember } from "@albion-raid-manager/database/models";
export type { Guild } from "@albion-raid-manager/database/models";

export interface GuildWithMembers extends Guild {
  members: GuildMember[];
}
