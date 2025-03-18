import { Composition, CompositionBuild, Guild, GuildMember } from "@albion-raid-manager/database/models";

export type GuildWithMembers = Guild & {
  members: GuildMember[];
};

export type CompositionWithBuilds = Composition & {
  builds: CompositionBuild[];
};
