import type { Cache } from "@albion-raid-manager/redis";

import { prisma, Prisma } from "@albion-raid-manager/database";
import { logger } from "@albion-raid-manager/logger";
import { Raid, RaidType } from "@albion-raid-manager/types";
import { CreateRaidInput, RaidFilters, RaidWithSlots, UpdateRaidInput } from "@albion-raid-manager/types/services";

import { CacheKeys, withCache } from "../cache";

import { ServersService } from "./servers";

export interface RaidServiceOptions {
  cache?: Cache;
  cacheTtl?: number;
}

export namespace RaidService {
  const DEFAULT_CACHE_TTL = 60;

  export async function createRaid(input: CreateRaidInput): Promise<Raid> {
    const { title, description, date, type = "FIXED" as RaidType, contentType, location, serverId } = input;

    await ServersService.ensureServerExists(serverId);

    const raid = await prisma.raid.create({
      data: {
        title,
        description,
        date,
        type,
        contentType,
        location,
        serverId,
        status: "SCHEDULED",
      },
      include: {
        slots: true,
      },
    });

    logger.info(`Raid created: ${raid.id}`, { raidId: raid.id, serverId, title });

    // Invalidate server raid caches after creating a new raid
    // Note: We can't invalidate here because we don't have access to cache instance
    // This should be handled by the calling code

    return raid;
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

    logger.info(`Raid deleted: ${id}`, { raidId: id });
  }

  export async function openRaidForSignups(id: string): Promise<Raid> {
    const raid = await prisma.raid.update({
      where: { id },
      data: { status: "OPEN" },
    });

    logger.info(`Raid opened for signups: ${id}`, { raidId: id });

    return raid;
  }

  export async function closeRaidForSignups(id: string): Promise<Raid> {
    const raid = await prisma.raid.update({
      where: { id },
      data: { status: "CLOSED" },
    });

    logger.info(`Raid closed for signups: ${id}`, { raidId: id });

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

    logger.info(`Raid announced: ${id}`, { raidId: id, messageId });

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
}
