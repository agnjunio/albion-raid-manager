import { Prisma } from "@albion-raid-manager/database";

export type User = Prisma.UserGetPayload<{}>;
