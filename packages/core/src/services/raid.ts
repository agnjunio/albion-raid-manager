import type { Cache, RaidEventPublisher } from "@albion-raid-manager/redis";

import { prisma, Prisma } from "@albion-raid-manager/database";
import { logger } from "@albion-raid-manager/logger";
import { Raid, RaidRole } from "@albion-raid-manager/types";
import { getContentTypeInfo } from "@albion-raid-manager/types/entities";
import {
  CreateRaidInput,
  RaidFilters,
  ServiceError,
  ServiceErrorCode,
  UpdateRaidInput,
} from "@albion-raid-manager/types/services";

import { CacheKeys, withCache } from "../cache";

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
    const { publisher } = options;

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

    if (publisher) {
      try {
        await publisher.publishRaidCreated(raid);
      } catch (error) {
        logger.error("Failed to publish raid created event:", error);
      }
    }

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
    const { publisher } = options;

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

    if (publisher) {
      try {
        await publisher.publishRaidUpdated(raid, previousRaid);
      } catch (error) {
        logger.error("Failed to publish raid updated event:", error);
      }
    }

    return raid;
  }

  export async function deleteRaid(id: string, options: RaidServiceOptions = {}): Promise<void> {
    const { publisher } = options;

    const raid = await prisma.raid.findUnique({
      where: { id },
    });

    if (!raid) {
      throw new Error("Raid not found");
    }

    await prisma.raid.delete({
      where: { id },
    });

    // TODO: Invalidate cache

    if (publisher) {
      try {
        await publisher.publishRaidDeleted(raid);
      } catch (error) {
        logger.error("Failed to publish raid deleted event:", error);
      }
    }

    logger.verbose(`Raid deleted: ${id}`, { raidId: id });
  }

  export async function createRaidSlot(
    input: {
      raidId: string;
      name: string;
      role?: RaidRole;
      comment?: string;
    },
    options: RaidServiceOptions = {},
  ): Promise<Raid> {
    const { raidId, name, role, comment } = input;
    const { publisher } = options;

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
          },
        },
      },
    });

    if (!updatedRaid) {
      throw new ServiceError(ServiceErrorCode.NOT_FOUND, "Raid not found");
    }

    logger.verbose(`Raid slot created for raid: ${updatedRaid.id}`, { id: updatedRaid.id, raidId, name, role });

    if (publisher) {
      try {
        await publisher.publishRaidUpdated(updatedRaid, {
          slots: raid.slots,
        });
      } catch (error) {
        logger.error("Failed to publish raid slot created event:", error);
      }
    }

    return updatedRaid;
  }

  export async function updateRaidSlot(
    slotId: string,
    input: {
      name?: string;
      role?: RaidRole;
      comment?: string;
    },
    options: RaidServiceOptions = {},
  ): Promise<Raid> {
    const { publisher } = options;

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
            },
          },
        },
      },
    });

    logger.info(`Raid slot updated: ${slotId}`, { slotId, updates: input });

    if (publisher) {
      try {
        await publisher.publishRaidUpdated(updatedRaid, {
          slots: slot.raid.slots,
        });
      } catch (error) {
        logger.error("Failed to publish raid slot updated event:", error);
      }
    }

    return updatedRaid;
  }

  export async function deleteRaidSlot(slotId: string, options: RaidServiceOptions = {}): Promise<void> {
    const { publisher } = options;

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
