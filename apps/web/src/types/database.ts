import { Build, Composition, Guild, GuildMember, User } from "@albion-raid-manager/database/models";

export type GuildWithMembers = Guild & {
  members: GuildMember[];
};

export type GuildMemberWithUser = GuildMember & {
  user: User;
};

export type CompositionWithBuilds = Composition & {
  builds: Build[];
};
