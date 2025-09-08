import type { Cache } from "@albion-raid-manager/redis";

import { prisma, Prisma } from "@albion-raid-manager/database";
import { logger } from "@albion-raid-manager/logger";
import { Raid, RaidSlot, RaidType } from "@albion-raid-manager/types";
import { getContentTypeInfo } from "@albion-raid-manager/types/entities";
import {
  CreateRaidInput,
  RaidFilters,
  RaidWithSlots,
  UpdateRaidInput,
  RaidSlotData,
} from "@albion-raid-manager/types/services";

import { CacheKeys, withCache } from "../cache";

import { ServersService } from "./servers";

export interface RaidServiceOptions {
  cache?: Cache;
  cacheTtl?: number;
}

export namespace RaidService {
  const DEFAULT_CACHE_TTL = 60;

  export async function createRaid(input: CreateRaidInput): Promise<Raid> {
    const { title, description, date, contentType, location, serverId } = input;

    await ServersService.ensureServerExists(serverId);

    const contentTypeInfo = getContentTypeInfo(contentType);
    const raidType = contentTypeInfo.raidType;

    return await prisma.$transaction(async (tx) => {
      // Create the raid
      const raid = await tx.raid.create({
        data: {
          title,
          description,
          date,
          type: raidType,
          contentType: contentTypeInfo.type,
          maxPlayers: contentTypeInfo.partySize.max ?? null,
          location,
          serverId,
          status: "SCHEDULED",
        },
        include: {
          slots: true,
        },
      });

      // Create slots for FIXED raids
      if (raidType === "FIXED") {
        try {
          const slotCount = contentTypeInfo.partySize.min ?? 0;

          await tx.raidSlot.createMany({
            data: Array.from({ length: slotCount }, (_, i) => ({
              raidId: raid.id,
              name: `Slot ${i + 1}`,
              role: null,
            })),
          });

          logger.debug(`Successfully created ${slotCount} slots for raid ${raid.id}`, {
            raidId: raid.id,
            contentType,
            slotCount: slotCount,
          });
        } catch (error) {
          logger.error(`Failed to create slots for raid ${raid.id}:`, error);
          // Don't fail the raid creation if slot creation fails
          // The raid can still be created and slots can be added manually
        }
      }

      logger.info(`Raid created: ${raid.id}`, {
        raidId: raid.id,
        serverId,
        title,
        type: raidType,
      });

      return raid;
    });
  }

  export async function findRaidById(
    id: string,
    include: { slots?: boolean } = {},
    options: RaidServiceOptions = {},
  ): Promise<Raid | null> {
    const { cache, cacheTtl = DEFAULT_CACHE_TTL } = options;
    const cacheKey = CacheKeys.raid(id);

    return withCache(
      async () => {
        let slots;
        if (include.slots) {
          slots = {
            include: {
              user: true,
            },
          };
        }

        return prisma.raid.findUnique({
          where: { id },
          include: { slots },
        });
      },
      {
        cache,
        key: cacheKey,
        ttl: cacheTtl,
      },
    );
  }

  export async function findRaids(
    filters: RaidFilters = {},
    include: { slots?: boolean } = {},
    options: RaidServiceOptions = {},
  ): Promise<Raid[]> {
    const { cache, cacheTtl = DEFAULT_CACHE_TTL } = options;
    const cacheKey = CacheKeys.raids(JSON.stringify(filters), JSON.stringify(include));

    if (cache) {
      const cached = await cache.get<Raid[]>(cacheKey);
      if (cached) return cached;
    }

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

    if (cache) {
      await cache.set(cacheKey, raids, cacheTtl);
    }

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

    // TODO: Invalidate cache

    logger.verbose(`Raid deleted: ${id}`, { raidId: id });
  }

  export async function openRaidForSignups(id: string): Promise<Raid> {
    const raid = await prisma.raid.update({
      where: { id },
      data: { status: "OPEN" },
    });

    logger.verbose(`Raid opened for signups: ${id}`, { raidId: id });

    return raid;
  }

  export async function closeRaidForSignups(id: string): Promise<Raid> {
    const raid = await prisma.raid.update({
      where: { id },
      data: { status: "CLOSED" },
    });

    logger.verbose(`Raid closed for signups: ${id}`, { raidId: id });

    return raid;
  }

  export async function announceRaid(id: string, messageId: string): Promise<Raid> {
    const raid = await prisma.raid.update({
      where: { id },
      data: {
        status: "OPEN",
        announcementMessageId: messageId,
      },
    });

    logger.verbose(`Raid announced: ${id}`, { raidId: id, messageId });

    return raid;
  }

  export async function getUpcomingRaids(
    serverId: string,
    limit = 10,
    options: RaidServiceOptions = {},
  ): Promise<RaidWithSlots[]> {
    const { cache, cacheTtl = DEFAULT_CACHE_TTL } = options;
    const cacheKey = CacheKeys.upcomingRaids(serverId);

    if (cache) {
      const cached = await cache.get<RaidWithSlots[]>(cacheKey);
      if (cached) return cached;
    }

    const raids = await prisma.raid.findMany({
      where: {
        serverId,
        date: {
          gte: new Date(),
        },
        status: {
          in: ["SCHEDULED", "OPEN", "CLOSED"],
        },
      },
      include: {
        slots: true,
      },
      orderBy: { date: "asc" },
      take: limit,
    });

    const result = raids as RaidWithSlots[];

    if (cache) {
      await cache.set(cacheKey, result, cacheTtl);
    }

    return result;
  }

  export async function getActiveRaids(serverId: string, options: RaidServiceOptions = {}): Promise<RaidWithSlots[]> {
    const { cache, cacheTtl = DEFAULT_CACHE_TTL } = options;
    const cacheKey = `raids:active:${serverId}`;

    if (cache) {
      const cached = await cache.get<RaidWithSlots[]>(cacheKey);
      if (cached) return cached;
    }

    const raids = await prisma.raid.findMany({
      where: {
        serverId,
        status: {
          in: ["OPEN", "CLOSED"],
        },
      },
      include: {
        slots: true,
      },
      orderBy: { date: "asc" },
    });

    const result = raids as RaidWithSlots[];

    if (cache) {
      await cache.set(cacheKey, result, cacheTtl);
    }

    return result;
  }

  export async function createRaidSlot(input: {
    raidId: string;
    name: string;
    role?: string;
    comment?: string;
  }): Promise<RaidSlot> {
    const { raidId, name, role, comment } = input;

    // Verify the raid exists and is in a state where slots can be modified
    const raid = await prisma.raid.findUnique({
      where: { id: raidId },
    });

    if (!raid) {
      throw new Error("Raid not found");
    }

    if (!["SCHEDULED", "OPEN", "CLOSED"].includes(raid.status)) {
      throw new Error("Cannot modify slots for raids that have started or finished");
    }

    const slot = await prisma.raidSlot.create({
      data: {
        raidId,
        name,
        role: role as any,
        comment,
      },
    });

    logger.verbose(`Raid slot created: ${slot.id}`, { slotId: slot.id, raidId, name, role });

    return slot;
  }

  export async function updateRaidSlot(
    slotId: string,
    updates: {
      name?: string;
      role?: string;
      comment?: string;
    },
  ): Promise<RaidSlotData> {
    // Verify the slot exists and the raid is in a state where slots can be modified
    const slot = await prisma.raidSlot.findUnique({
      where: { id: slotId },
      include: { raid: true },
    });

    if (!slot) {
      throw new Error("Raid slot not found");
    }

    if (!slot.raid || !["SCHEDULED", "OPEN", "CLOSED"].includes(slot.raid.status)) {
      throw new Error("Cannot modify slots for raids that have started or finished");
    }

    const updatedSlot = await prisma.raidSlot.update({
      where: { id: slotId },
      data: {
        name: updates.name,
        role: updates.role as any,
        comment: updates.comment,
      },
    });

    logger.info(`Raid slot updated: ${slotId}`, { slotId, updates });

    return updatedSlot as RaidSlotData;
  }

  export async function deleteRaidSlot(slotId: string): Promise<void> {
    // Verify the slot exists and the raid is in a state where slots can be modified
    const slot = await prisma.raidSlot.findUnique({
      where: { id: slotId },
      include: { raid: true },
    });

    if (!slot) {
      throw new Error("Raid slot not found");
    }

    if (!slot.raid || !["SCHEDULED", "OPEN", "CLOSED"].includes(slot.raid.status)) {
      throw new Error("Cannot modify slots for raids that have started or finished");
    }

    await prisma.raidSlot.delete({
      where: { id: slotId },
    });

    logger.info(`Raid slot deleted: ${slotId}`, { slotId, raidId: slot.raidId });
  }
}
