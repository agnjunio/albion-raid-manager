import { Prisma } from "@albion-raid-manager/database";

export type Guild = Prisma.GuildGetPayload<{}>;

export type GuildWithMembers = Prisma.GuildGetPayload<{
  include: {
    members: {
      include: { user: true };
    };
  };
}>;
