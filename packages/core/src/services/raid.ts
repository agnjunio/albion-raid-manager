import type { Cache } from "@albion-raid-manager/redis";

import { prisma, Prisma } from "@albion-raid-manager/database";
import { logger } from "@albion-raid-manager/logger";
import { Raid, RaidType } from "@albion-raid-manager/types";
import { CreateRaidInput, RaidFilters, RaidWithSlots, UpdateRaidInput } from "@albion-raid-manager/types/services";
import { CONTENT_TYPE_MAPPING } from "@albion-raid-manager/types/entities";

import { CacheKeys, withCache } from "../cache";

import { ServersService } from "./servers";
import { createRaidSlots } from "./raid-slot";

export interface RaidServiceOptions {
  cache?: Cache;
  cacheTtl?: number;
}

/**
 * Determines the appropriate number of slots and roles based on content type
 */
function getSlotConfiguration(contentType?: string): { slotCount: number; roles?: string[] } {
  if (!contentType) {
    // Default configuration for raids without content type
    return { slotCount: 8 };
  }

  const contentInfo = CONTENT_TYPE_MAPPING.find((ct) => ct.type === contentType);
  if (!contentInfo) {
    logger.warn(`Unknown content type: ${contentType}, using default configuration`);
    return { slotCount: 8 };
  }

  const slotCount = contentInfo.partySize.max;
  const roles = getRolesForContentType(contentType, slotCount);

  return { slotCount, roles };
}

/**
 * Generates appropriate roles for different content types
 */
function getRolesForContentType(contentType: string, slotCount: number): string[] {
  const roles: string[] = [];

  switch (contentType) {
    case "SOLO_DUNGEON":
    case "MISTS_SOLO":
      return ["MELEE_DPS"];

    case "DEPTHS_DUO":
    case "MISTS_DUO":
      return ["MELEE_DPS", "RANGED_DPS"];

    case "DEPTHS_TRIO":
      return ["TANK", "HEALER", "MELEE_DPS"];

    case "GROUP_DUNGEON":
      // 2-5 players, flexible composition
      return ["TANK", "HEALER", "MELEE_DPS", "RANGED_DPS", "SUPPORT"];

    case "ROADS_OF_AVALON_PVE":
    case "ROADS_OF_AVALON_PVP":
      // 7 players, structured composition
      return [
        "CALLER",
        "TANK", 
        "TANK",
        "HEALER",
        "HEALER", 
        "RANGED_DPS",
        "MELEE_DPS"
      ];

    case "HELLGATE_2V2":
      return ["MELEE_DPS", "RANGED_DPS"];

    case "HELLGATE_5V5":
      return ["TANK", "HEALER", "RANGED_DPS", "RANGED_DPS", "MELEE_DPS"];

    case "HELLGATE_10V10":
      return [
        "CALLER",
        "TANK",
        "TANK", 
        "HEALER",
        "HEALER",
        "RANGED_DPS",
        "RANGED_DPS",
        "RANGED_DPS",
        "MELEE_DPS",
        "MELEE_DPS"
      ];

    case "AVALONIAN_DUNGEON_FULL_CLEAR":
    case "AVALONIAN_DUNGEON_BUFF_ONLY":
      // 20 players, large group composition
      return [
        "CALLER",
        "TANK", "TANK", "TANK", "TANK", // 4 tanks
        "HEALER", "HEALER", "HEALER", "HEALER", "HEALER", // 5 healers
        "RANGED_DPS", "RANGED_DPS", "RANGED_DPS", "RANGED_DPS", "RANGED_DPS", // 5 ranged
        "MELEE_DPS", "MELEE_DPS", "MELEE_DPS", "MELEE_DPS", // 4 melee
        "SUPPORT", "SUPPORT" // 2 support
      ];

    case "GANKING_SQUAD":
    case "FIGHTING_SQUAD":
      // 5-20 players, flexible PvP composition
      return [
        "CALLER",
        "TANK", "TANK",
        "HEALER", "HEALER", "HEALER",
        "RANGED_DPS", "RANGED_DPS", "RANGED_DPS", "RANGED_DPS",
        "MELEE_DPS", "MELEE_DPS", "MELEE_DPS", "MELEE_DPS",
        "SUPPORT", "SUPPORT", "SUPPORT",
        "BATTLEMOUNT", "BATTLEMOUNT", "BATTLEMOUNT"
      ].slice(0, slotCount);

    case "ZVZ_CALL_TO_ARMS":
      // 20-100 players, large scale ZvZ
      return [
        "CALLER", "CALLER", "CALLER", // 3 callers
        "TANK", "TANK", "TANK", "TANK", "TANK", "TANK", "TANK", "TANK", // 8 tanks
        "HEALER", "HEALER", "HEALER", "HEALER", "HEALER", "HEALER", "HEALER", "HEALER", "HEALER", "HEALER", // 10 healers
        "RANGED_DPS", "RANGED_DPS", "RANGED_DPS", "RANGED_DPS", "RANGED_DPS", "RANGED_DPS", "RANGED_DPS", "RANGED_DPS", "RANGED_DPS", "RANGED_DPS", // 10 ranged
        "MELEE_DPS", "MELEE_DPS", "MELEE_DPS", "MELEE_DPS", "MELEE_DPS", "MELEE_DPS", "MELEE_DPS", "MELEE_DPS", "MELEE_DPS", "MELEE_DPS", // 10 melee
        "SUPPORT", "SUPPORT", "SUPPORT", "SUPPORT", "SUPPORT", "SUPPORT", "SUPPORT", "SUPPORT", "SUPPORT", "SUPPORT", // 10 support
        "BATTLEMOUNT", "BATTLEMOUNT", "BATTLEMOUNT", "BATTLEMOUNT", "BATTLEMOUNT", "BATTLEMOUNT", "BATTLEMOUNT", "BATTLEMOUNT", "BATTLEMOUNT", "BATTLEMOUNT" // 10 battlemounts
      ].slice(0, slotCount);

    case "OPEN_WORLD_FARMING":
    case "OTHER":
    default:
      // Default flexible composition
      const defaultRoles = [
        "CALLER",
        "TANK", "TANK",
        "HEALER", "HEALER",
        "RANGED_DPS", "RANGED_DPS", "RANGED_DPS",
        "MELEE_DPS", "MELEE_DPS", "MELEE_DPS",
        "SUPPORT", "SUPPORT",
        "BATTLEMOUNT", "BATTLEMOUNT"
      ];
      
      // Repeat roles to fill the required slot count
      for (let i = 0; i < slotCount; i++) {
        roles.push(defaultRoles[i % defaultRoles.length]);
      }
      return roles;
  }
}

export namespace RaidService {
  const DEFAULT_CACHE_TTL = 60;

  export async function createRaid(input: CreateRaidInput): Promise<Raid> {
    const { title, description, date, type = "FIXED" as RaidType, contentType, location, serverId, slotCount } = input;

    await ServersService.ensureServerExists(serverId);

    // Determine slot configuration based on content type
    const slotConfig = getSlotConfiguration(contentType);
    const finalSlotCount = slotCount || slotConfig.slotCount;

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

    // Create slots automatically based on content type
    if (finalSlotCount > 0) {
      try {
        logger.info(`Creating ${finalSlotCount} slots for raid ${raid.id}`, { 
          raidId: raid.id, 
          contentType, 
          slotCount: finalSlotCount,
          roles: slotConfig.roles
        });
        
        await createRaidSlots(raid.id, finalSlotCount, slotConfig.roles as any);
        logger.info(`Successfully created ${finalSlotCount} slots for raid ${raid.id}`, { 
          raidId: raid.id, 
          contentType, 
          slotCount: finalSlotCount 
        });
      } catch (error) {
        logger.error(`Failed to create slots for raid ${raid.id}:`, error);
        // Don't fail the raid creation if slot creation fails
        // The raid can still be created and slots can be added manually
      }
    }

    logger.info(`Raid created: ${raid.id}`, { raidId: raid.id, serverId, title, slotCount: finalSlotCount });

    // Invalidate server raid caches after creating a new raid
    // Note: We can't invalidate here because we don't have access to cache instance
    // This should be handled by the calling code

    // Fetch the raid with slots to return the complete data
    const raidWithSlots = await prisma.raid.findUnique({
      where: { id: raid.id },
      include: {
        slots: {
          include: {
            user: true,
          },
        },
      },
    });

    return raidWithSlots as Raid;
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
