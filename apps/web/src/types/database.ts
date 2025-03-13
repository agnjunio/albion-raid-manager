import { Composition, CompositionSlot, Guild, GuildMember } from "@albion-raid-manager/database/models";

export type GuildWithMembers = Guild & {
  members: GuildMember[];
};

export type CompositionWithSlots = Composition & {
  slots: CompositionSlot[];
};
