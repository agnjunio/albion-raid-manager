import { Prisma, prisma, RaidRole } from "@albion-raid-manager/database";
import { logger } from "@albion-raid-manager/logger";

import { RaidSlotData } from "../types";

export async function createRaidSlots(raidId: string, slotCount: number, roles?: RaidRole[]): Promise<RaidSlotData[]> {
  const raid = await prisma.raid.findUnique({
    where: { id: raidId },
  });

  if (!raid) {
    throw new Error(`Raid ${raidId} not found`);
  }

  const slotRoles = roles || getDefaultRoles(slotCount);
  const slots = [];

  for (let i = 0; i < slotCount; i++) {
    const role = slotRoles[i] || RaidRole.MELEE_DPS;
    slots.push({
      name: `${role.replace(/_/g, " ")} ${Math.floor(i / 8) + 1}`,
      role: role,
      raidId: raidId,
    });
  }

  const createdSlots = await prisma.raidSlot.createMany({
    data: slots,
  });

  logger.info(`Created ${createdSlots.count} slots for raid ${raidId}`, { raidId, slotCount });

  return await getRaidSlotsByRaid(raidId);
}

export async function joinRaidSlot(slotId: string, userId: string, comment?: string): Promise<RaidSlotData> {
  const slot = await prisma.raidSlot.findUnique({
    where: { id: slotId },
    include: { raid: true },
  });

  if (!slot) {
    throw new Error(`Slot ${slotId} not found`);
  }

  if (slot.userId) {
    throw new Error(`Slot ${slotId} is already occupied`);
  }

  const existingSlot = await prisma.raidSlot.findFirst({
    where: {
      raidId: slot.raidId,
      userId: userId,
    },
  });

  if (existingSlot) {
    throw new Error("User is already signed up for this raid");
  }

  const updatedSlot = await prisma.raidSlot.update({
    where: { id: slotId },
    data: {
      userId: userId,
      comment: comment,
      joinedAt: new Date(),
    },
  });

  logger.info(`User ${userId} joined slot ${slotId}`, { slotId, userId, raidId: slot.raidId });

  return updatedSlot as RaidSlotData;
}

export async function leaveRaidSlot(slotId: string): Promise<RaidSlotData> {
  const slot = await prisma.raidSlot.findUnique({
    where: { id: slotId },
  });

  if (!slot) {
    throw new Error(`Slot ${slotId} not found`);
  }

  if (!slot.userId) {
    throw new Error(`Slot ${slotId} is not occupied`);
  }

  const updatedSlot = await prisma.raidSlot.update({
    where: { id: slotId },
    data: {
      userId: null,
      comment: null,
      joinedAt: null,
    },
  });

  logger.info(`User left slot ${slotId}`, { slotId, userId: slot.userId });

  return updatedSlot as RaidSlotData;
}

export async function updateRaidSlot(
  slotId: string,
  updates: { comment?: string; role?: RaidRole },
): Promise<RaidSlotData> {
  const slot = await prisma.raidSlot.findUnique({
    where: { id: slotId },
  });

  if (!slot) {
    throw new Error(`Slot ${slotId} not found`);
  }

  const updatedSlot = await prisma.raidSlot.update({
    where: { id: slotId },
    data: updates,
  });

  logger.info(`Slot ${slotId} updated`, { slotId, updates });

  return updatedSlot as RaidSlotData;
}

export async function getRaidSlotsByRaid(raidId: string): Promise<RaidSlotData[]> {
  const slots = await prisma.raidSlot.findMany({
    where: { raidId },
    orderBy: { createdAt: "asc" },
  });

  return slots as RaidSlotData[];
}

export async function getRaidSlotsByUser(userId: string, serverId?: string): Promise<RaidSlotData[]> {
  const where: Prisma.RaidSlotWhereInput = { userId };

  if (serverId) {
    where.raid = {
      serverId: serverId,
    };
  }

  const slots = await prisma.raidSlot.findMany({
    where,
    include: {
      raid: true,
    },
    orderBy: { joinedAt: "desc" },
  });

  return slots as RaidSlotData[];
}

function getDefaultRoles(count: number): RaidRole[] {
  const defaultRoles = [
    RaidRole.CALLER,
    RaidRole.TANK,
    RaidRole.HEALER,
    RaidRole.SUPPORT,
    RaidRole.MELEE_DPS,
    RaidRole.RANGED_DPS,
    RaidRole.RANGED_DPS,
    RaidRole.MELEE_DPS,
  ];

  const roles: RaidRole[] = [];
  for (let i = 0; i < count; i++) {
    roles.push(defaultRoles[i] || RaidRole.MELEE_DPS);
  }
  return roles;
}
