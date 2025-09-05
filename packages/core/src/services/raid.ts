import { prisma, Prisma, RaidRole, RaidStatus, RaidType } from "@albion-raid-manager/database";
import { logger } from "@albion-raid-manager/logger";

import { Raid } from "@albion-raid-manager/core/types";

import { CreateRaidInput, RaidFilters, RaidWithSlots, UpdateRaidInput } from "../types/services";

export namespace RaidService {
  export async function createRaid(input: CreateRaidInput): Promise<Raid> {
    const { title, description, date, type = RaidType.FIXED, contentType, location, serverId, slotCount = 8 } = input;

    // Ensure server exists
    await ensureServerExists(serverId);

    // Create raid with default slots
    const raid = await prisma.raid.create({
      data: {
        title,
        description,
        date,
        type,
        contentType,
        location,
        serverId,
        status: RaidStatus.SCHEDULED,
        slots: {
          create: generateDefaultSlots(slotCount),
        },
      },
      include: {
        slots: true,
      },
    });

    logger.info(`Raid created: ${raid.id}`, { raidId: raid.id, serverId, title });

    return raid;
  }

  export async function findRaidById(id: string, include: { slots?: boolean } = {}): Promise<Raid | null> {
    let slots;
    if (include.slots) {
      slots = {
        include: {
          user: true,
        },
      };
    }

    const raid = await prisma.raid.findUnique({
      where: { id },
      include: {
        slots,
      },
    });

    return raid;
  }

  export async function findRaids(filters: RaidFilters = {}, include: { slots?: boolean } = {}): Promise<Raid[]> {
    const where: Prisma.RaidWhereInput = {};

    if (filters.serverId) {
      where.serverId = filters.serverId;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.contentType) {
      where.contentType = filters.contentType;
    }

    if (filters.dateFrom || filters.dateTo) {
      where.date = {};
      if (filters.dateFrom) {
        where.date.gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        where.date.lte = filters.dateTo;
      }
    }

    let slots;
    if (include.slots) {
      slots = {
        include: {
          user: true,
        },
      };
    }

    const raids = await prisma.raid.findMany({
      where,
      include: {
        slots,
      },
      orderBy: { date: "asc" },
    });

    return raids;
  }

  export async function updateRaid(id: string, input: UpdateRaidInput): Promise<Raid> {
    const raid = await prisma.raid.update({
      where: { id },
      data: input,
    });

    logger.info(`Raid updated: ${id}`, { raidId: id, updates: input });

    return raid;
  }

  export async function deleteRaid(id: string): Promise<void> {
    await prisma.raid.delete({
      where: { id },
    });

    logger.info(`Raid deleted: ${id}`, { raidId: id });
  }

  export async function openRaidForSignups(id: string): Promise<Raid> {
    const raid = await prisma.raid.update({
      where: { id },
      data: { status: RaidStatus.OPEN },
    });

    logger.info(`Raid opened for signups: ${id}`, { raidId: id });

    return raid;
  }

  export async function closeRaidForSignups(id: string): Promise<Raid> {
    const raid = await prisma.raid.update({
      where: { id },
      data: { status: RaidStatus.CLOSED },
    });

    logger.info(`Raid closed for signups: ${id}`, { raidId: id });

    return raid;
  }

  export async function announceRaid(id: string, messageId: string): Promise<Raid> {
    const raid = await prisma.raid.update({
      where: { id },
      data: {
        status: RaidStatus.OPEN,
        announcementMessageId: messageId,
      },
    });

    logger.info(`Raid announced: ${id}`, { raidId: id, messageId });

    return raid;
  }

  export async function getUpcomingRaids(serverId: string, limit = 10): Promise<RaidWithSlots[]> {
    const raids = await prisma.raid.findMany({
      where: {
        serverId,
        date: {
          gte: new Date(),
        },
        status: {
          in: [RaidStatus.SCHEDULED, RaidStatus.OPEN, RaidStatus.CLOSED],
        },
      },
      include: {
        slots: true,
      },
      orderBy: { date: "asc" },
      take: limit,
    });

    return raids as RaidWithSlots[];
  }

  export async function getActiveRaids(serverId: string): Promise<RaidWithSlots[]> {
    const raids = await prisma.raid.findMany({
      where: {
        serverId,
        status: {
          in: [RaidStatus.OPEN, RaidStatus.CLOSED],
        },
      },
      include: {
        slots: true,
      },
      orderBy: { date: "asc" },
    });

    return raids as RaidWithSlots[];
  }

  async function ensureServerExists(serverId: string): Promise<void> {
    const server = await prisma.server.findUnique({
      where: { id: serverId },
    });

    if (!server) {
      throw new Error(`Server ${serverId} not found. Please ensure the server is registered.`);
    }
  }

  function generateDefaultSlots(count: number): Array<{ name: string; role: RaidRole }> {
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

    const slots: Array<{ name: string; role: RaidRole }> = [];
    for (let i = 0; i < count; i++) {
      const role = defaultRoles[i] || RaidRole.MELEE_DPS;
      slots.push({
        name: `${role.replace(/_/g, " ")} ${Math.floor(i / 8) + 1}`,
        role: role,
      });
    }
    return slots;
  }
}
