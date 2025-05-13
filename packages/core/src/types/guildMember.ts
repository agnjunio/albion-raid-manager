import { Prisma } from "@albion-raid-manager/database";

export type GuildMember = Prisma.GuildMemberGetPayload<{}>;

export type GuildMemberWithUser = Prisma.GuildMemberGetPayload<{
  include: { user: true };
}>;

export { GuildMemberRole } from "@albion-raid-manager/database";
