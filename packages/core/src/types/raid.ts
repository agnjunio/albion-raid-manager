import { Prisma } from "@albion-raid-manager/database";

export type Raid = Prisma.RaidGetPayload<{}>;

export type RaidSlot = Prisma.RaidSlotGetPayload<{}>;

export { RaidStatus } from "@albion-raid-manager/database";
