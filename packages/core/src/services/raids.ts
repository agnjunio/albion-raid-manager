import type { Cache, RaidEventPublisher } from "@albion-raid-manager/redis";

import { prisma, Prisma } from "@albion-raid-manager/database";
import { Raid, RaidRole } from "@albion-raid-manager/types";
import { getContentTypeInfo } from "@albion-raid-manager/types/entities";
import {
  CreateRaidInput,
  RaidFilters,
  ServiceError,
  ServiceErrorCode,
  UpdateRaidInput,
} from "@albion-raid-manager/types/services";

import { CacheInvalidation, CacheKeys, withCache } from "@albion-raid-manager/core/cache/redis";
import { logger } from "@albion-raid-manager/core/logger";

import { ServersService } from "./servers";
export interface RaidServiceOptions {
  cache?: Cache;
  cacheTtl?: number;
  publisher?: RaidEventPublisher | null;
}

export namespace RaidService {
  const DEFAULT_CACHE_TTL = 60;

  export async function createRaid(input: CreateRaidInput, options: RaidServiceOptions = {}): Promise<Raid> {
    const { title, description, date, contentType, location, serverId } = input;
    const { cache, publisher } = options;

    await ServersService.ensureServerExists(serverId);

    const contentTypeInfo = getContentTypeInfo(contentType);
    const raidType = contentTypeInfo.raidType;

    const raid = await prisma.$transaction(async (tx) => {
      // Create the raid
      const raid = await tx.raid.create({
        data: {
          title,
          description,
          date,
          type: raidType,
          contentType: contentTypeInfo.type,
          maxPlayers: contentTypeInfo.partySize?.max ?? null,
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
          const slotCount = contentTypeInfo.partySize?.min ?? 0;

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

    if (cache) {
      CacheInvalidation.invalidateServerRaids(cache, serverId).catch((error) => {
        logger.warn("Cache invalidation failed", { error, serverId });
      });
    }

    if (publisher) {
      publisher.publishRaidCreated(raid).catch((error) => {
        logger.warn("Event publishing failed", { error, raidId: raid.id });
      });
    }

    return raid;
  }

  export async function findRaidById(
    id: string,
    include: Prisma.RaidInclude = {},
    options: RaidServiceOptions = {},
  ): Promise<Raid | null> {
    const { cache, cacheTtl = DEFAULT_CACHE_TTL } = options;
    const cacheKey = CacheKeys.raid(id, include);

    return withCache(
      async () => {
        return prisma.raid.findUnique({
          where: { id },
          include: {
            ...include,
            slots: include.slots
              ? {
                  orderBy: { order: "asc" },
                }
              : false,
          },
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

    return withCache(
      async () => {
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
      },
      {
        cache,
        key: cacheKey,
        ttl: cacheTtl,
      },
    );
  }

  export async function updateRaid(
    id: string,
    input: UpdateRaidInput,
    options: RaidServiceOptions = {},
  ): Promise<Raid> {
    const { cache, publisher } = options;

    // Select only the fields that are being updated
    const previousRaid = await prisma.raid.findUnique({
      where: { id },
      select: Object.keys(input).reduce(
        (acc, key) => {
          acc[key] = true;
          return acc;
        },
        {} as Record<string, boolean>,
      ),
    });

    if (!previousRaid) {
      throw new ServiceError(ServiceErrorCode.NOT_FOUND, "Raid not found");
    }

    const raid = await prisma.raid.update({
      where: { id },
      data: input,
    });

    logger.info(`Raid updated: ${id}`, { raidId: id, updates: input });

    if (cache) {
      CacheInvalidation.invalidateRaid(cache, id, raid.serverId).catch((error) => {
        logger.warn("Cache invalidation failed", { error, raidId: id });
      });
    }

    if (publisher) {
      publisher.publishRaidUpdated(raid, previousRaid).catch((error) => {
        logger.warn("Event publishing failed", { error, raidId: id });
      });
    }

    return raid;
  }

  export async function deleteRaid(id: string, options: RaidServiceOptions = {}): Promise<void> {
    const { cache, publisher } = options;

    const raid = await prisma.raid.findUnique({
      where: { id },
    });

    if (!raid) {
      throw new ServiceError(ServiceErrorCode.NOT_FOUND, "Raid not found");
    }

    await prisma.raid.delete({
      where: { id },
    });

    if (cache) {
      CacheInvalidation.invalidateRaid(cache, id, raid.serverId).catch((error) => {
        logger.warn("Cache invalidation failed", { error, raidId: id });
      });
    }

    if (publisher) {
      publisher.publishRaidDeleted(raid).catch((error) => {
        logger.warn("Event publishing failed", { error, raidId: id });
      });
    }

    logger.verbose(`Raid deleted: ${id}`, { raidId: id });
  }

  export async function createRaidSlot(
    input: {
      raidId: string;
      name: string;
      role?: RaidRole;
      comment?: string;
      order?: number;
    },
    options: RaidServiceOptions = {},
  ): Promise<Raid> {
    const { raidId, name, role, comment, order } = input;
    const { cache, publisher } = options;

    // Verify the raid exists and is in a state where slots can be modified
    const raid = await findRaidById(raidId, { slots: true });

    if (!raid) {
      throw new ServiceError(ServiceErrorCode.NOT_FOUND, "Raid not found");
    }

    if (!["SCHEDULED", "OPEN", "CLOSED"].includes(raid.status)) {
      throw new ServiceError(
        ServiceErrorCode.INVALID_STATE,
        "Cannot modify slots for raids that have started or finished",
      );
    }

    const updatedRaid = await prisma.raid.update({
      where: { id: raidId },
      data: {
        slots: {
          create: {
            name,
            role,
            comment,
            order: order ?? (raid.slots?.length || 0),
          },
        },
      },
    });

    if (!updatedRaid) {
      throw new ServiceError(ServiceErrorCode.NOT_FOUND, "Raid not found");
    }

    logger.verbose(`Raid slot created for raid: ${updatedRaid.id}`, { id: updatedRaid.id, raidId, name, role });

    if (cache) {
      CacheInvalidation.invalidateRaid(cache, raidId, updatedRaid.serverId).catch((error) => {
        logger.warn("Cache invalidation failed", { error, raidId });
      });
    }

    if (publisher) {
      publisher
        .publishRaidUpdated(updatedRaid, {
          slots: raid.slots,
        })
        .catch((error) => {
          logger.warn("Event publishing failed", { error, raidId });
        });
    }

    return updatedRaid;
  }

  export async function updateRaidSlot(
    slotId: string,
    input: {
      name?: string;
      role?: RaidRole;
      comment?: string;
      userId?: string | null;
      order?: number;
    },
    options: RaidServiceOptions = {},
  ): Promise<Raid> {
    const { cache, publisher } = options;

    // Verify the slot exists and the raid is in a state where slots can be modified
    const slot = await prisma.raidSlot.findUnique({
      where: { id: slotId },
      include: { raid: { include: { slots: true } } },
    });

    if (!slot) {
      throw new ServiceError(ServiceErrorCode.NOT_FOUND, "Raid slot not found");
    }

    if (!slot.raid || !["SCHEDULED", "OPEN", "CLOSED"].includes(slot.raid.status)) {
      throw new ServiceError(
        ServiceErrorCode.INVALID_STATE,
        "Cannot modify slots for raids that have started or finished",
      );
    }

    if (input.userId) {
      await ServersService.getServerMember(slot.raid.serverId, input.userId);
    }

    const updatedRaid = await prisma.raid.update({
      where: { id: slot.raid.id },
      data: {
        slots: {
          update: {
            where: { id: slotId },
            data: {
              name: input.name,
              role: input.role,
              comment: input.comment,
              userId: input.userId,
              joinedAt: input.userId ? new Date() : null,
              order: input.order,
            },
          },
        },
      },
    });

    logger.info(`Raid slot updated: ${slotId}`, { slotId, updates: input });

    if (cache) {
      CacheInvalidation.invalidateRaid(cache, slot.raid.id, slot.raid.serverId).catch((error) => {
        logger.warn("Cache invalidation failed", { error, raidId: slot.raid?.id });
      });
    }

    if (publisher) {
      publisher
        .publishRaidUpdated(updatedRaid, {
          slots: slot.raid.slots,
        })
        .catch((error) => {
          logger.warn("Event publishing failed", { error, raidId: slot.raid?.id });
        });
    }

    return updatedRaid;
  }

  export async function deleteRaidSlot(slotId: string, options: RaidServiceOptions = {}): Promise<void> {
    const { cache, publisher } = options;

    // Verify the slot exists and the raid is in a state where slots can be modified
    const slot = await prisma.raidSlot.findUnique({
      where: { id: slotId },
      include: { raid: { include: { slots: true } } },
    });

    if (!slot) {
      throw new ServiceError(ServiceErrorCode.NOT_FOUND, "Raid slot not found");
    }

    if (!slot.raid || !["SCHEDULED", "OPEN", "CLOSED"].includes(slot.raid.status)) {
      throw new ServiceError(
        ServiceErrorCode.INVALID_STATE,
        "Cannot modify slots for raids that have started or finished",
      );
    }

    await prisma.raidSlot.delete({
      where: { id: slotId },
    });

    logger.info(`Raid slot deleted: ${slotId}`, { slotId, raidId: slot.raid.id });

    if (cache) {
      CacheInvalidation.invalidateRaid(cache, slot.raid.id, slot.raid.serverId);
    }

    if (publisher) {
      try {
        await publisher.publishRaidUpdated(slot.raid, {
          slots: slot.raid.slots,
        });
      } catch (error) {
        logger.error("Failed to publish raid slot deleted event:", error);
      }
    }
  }
}
