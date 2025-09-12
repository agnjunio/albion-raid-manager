import type { Cache, RaidEventPublisher } from "@albion-raid-manager/core/redis";

import { Raid, RaidSlot } from "@albion-raid-manager/types";
import { getContentTypeInfo } from "@albion-raid-manager/types/entities";
import {
  CreateRaidInput,
  CreateRaidSlotInput,
  RaidFilters,
  ServiceError,
  ServiceErrorCode,
  UpdateRaidInput,
  UpdateRaidSlotInput,
} from "@albion-raid-manager/types/services";

import { CacheInvalidation } from "@albion-raid-manager/core/cache/redis";
import { CacheKeys, withCache } from "@albion-raid-manager/core/cache/utils";
import { prisma, Prisma } from "@albion-raid-manager/core/database";
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

    await ServersService.ensureServer(serverId);

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
              weapon: null,
              userId: null,
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

      logger.verbose(`Raid created: ${raid.id}`, {
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
    const cacheKey = CacheKeys.raid(id, CacheKeys.hashObject(include));

    return withCache(
      async () => {
        return await prisma.raid.findUnique({
          where: { id },
          include,
        });
      },
      {
        cache,
        key: cacheKey,
        ttl: cacheTtl,
      },
    );
  }

  export async function findRaidsByServer(
    serverId: string,
    filters: RaidFilters = {},
    options: RaidServiceOptions = {},
  ): Promise<Raid[]> {
    const { cache, cacheTtl = DEFAULT_CACHE_TTL } = options;
    const { status, type, contentType, dateFrom, dateTo } = filters;
    const cacheKey = CacheKeys.raidsByServer(serverId, CacheKeys.hashObject(filters));

    return withCache(
      async () => {
        return await prisma.raid.findMany({
          where: {
            serverId,
            ...(status && { status }),
            ...(type && { type }),
            ...(contentType && { contentType }),
            ...(dateFrom && { date: { gte: dateFrom } }),
            ...(dateTo && { date: { lte: dateTo } }),
          },
          include: {
            slots: true,
          },
          orderBy: {
            date: "asc",
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

  export async function updateRaid(
    id: string,
    input: UpdateRaidInput,
    options: RaidServiceOptions = {},
  ): Promise<Raid> {
    const { cache, publisher } = options;

    const raid = await prisma.$transaction(async (tx) => {
      const existingRaid = await tx.raid.findUnique({
        where: { id },
      });

      if (!existingRaid) {
        throw new ServiceError(ServiceErrorCode.NOT_FOUND, `Raid with ID "${id}" not found`);
      }

      // Update the raid
      const updatedRaid = await tx.raid.update({
        where: { id },
        data: input,
        include: {
          slots: true,
        },
      });

      logger.info(`Raid updated: ${id}`, {
        raidId: id,
        updates: input,
      });

      return updatedRaid;
    });

    if (cache) {
      CacheInvalidation.invalidateRaid(cache, id, raid.serverId).catch((error) => {
        logger.warn("Cache invalidation failed", { error, raidId: id });
      });
    }

    if (publisher) {
      publisher.publishRaidUpdated(raid).catch((error) => {
        logger.warn("Event publishing failed", { error, raidId: id });
      });
    }

    return raid;
  }

  export async function deleteRaid(id: string, options: RaidServiceOptions = {}): Promise<void> {
    const { cache, publisher } = options;

    const raid = await prisma.$transaction(async (tx) => {
      // Check if raid exists
      const existingRaid = await tx.raid.findUnique({
        where: { id },
        include: {
          slots: true,
        },
      });

      if (!existingRaid) {
        throw new ServiceError(ServiceErrorCode.NOT_FOUND, `Raid with ID "${id}" not found`);
      }

      // Check if raid has participants
      if (existingRaid.slots && existingRaid.slots.some((slot) => slot.userId)) {
        throw new ServiceError(
          ServiceErrorCode.INVALID_STATE,
          "Cannot delete raid that has participants. Please remove all participants first.",
        );
      }

      // Delete the raid (slots will be deleted due to cascade)
      await tx.raid.delete({
        where: { id },
      });

      logger.info(`Raid deleted: ${id}`, {
        raidId: id,
        serverId: existingRaid.serverId,
        title: existingRaid.title,
      });

      return existingRaid;
    });

    if (cache) {
      CacheInvalidation.invalidateRaid(cache, raid.id, raid.serverId).catch((error) => {
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
    input: CreateRaidSlotInput & { raidId: string },
    options: RaidServiceOptions = {},
  ): Promise<Raid> {
    const { raidId, name, role, comment, weapon, buildId, order, userId } = input;
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

    if (userId) {
      // Ensure the user exists in our database to satisfy foreign key constraints
      // This handles both normal user creation and fallback cases when Discord API is unavailable
      await ServersService.ensureServerMember(raid.serverId, userId);
    }

    const updatedRaid = await prisma.raid.update({
      where: { id: raidId },
      data: {
        slots: {
          create: {
            name,
            role,
            comment,
            weapon,
            buildId,
            userId,
            order: order ?? (raid.slots?.length || 0),
          },
        },
      },
      include: {
        slots: true,
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
      publisher.publishRaidUpdated(updatedRaid).catch((error) => {
        logger.warn("Event publishing failed", { error, raidId });
      });
    }

    return updatedRaid;
  }

  export async function updateRaidSlot(
    slotId: string,
    input: UpdateRaidSlotInput,
    options: RaidServiceOptions = {},
  ): Promise<RaidSlot> {
    const { cache, publisher } = options;

    const slot = await prisma.$transaction(async (tx) => {
      // Check if slot exists
      const existingSlot = await tx.raidSlot.findUnique({
        where: { id: slotId },
        include: {
          raid: true,
        },
      });

      if (!existingSlot) {
        throw new ServiceError(ServiceErrorCode.NOT_FOUND, `Raid slot with ID "${slotId}" not found`);
      }

      if (!existingSlot.raid) {
        throw new ServiceError(ServiceErrorCode.NOT_FOUND, "Raid not found for this slot");
      }

      // Check if raid is in a state where slots can be modified
      if (!["SCHEDULED", "OPEN", "CLOSED"].includes(existingSlot.raid.status)) {
        throw new ServiceError(
          ServiceErrorCode.INVALID_STATE,
          "Cannot modify slots for raids that have started or finished",
        );
      }

      if (input.userId) {
        // Ensure the user exists in our database to satisfy foreign key constraints
        // This handles both normal user creation and fallback cases when Discord API is unavailable
        await ServersService.ensureServerMember(existingSlot.raid.serverId, input.userId);
      }

      // If order is specified, handle reordering logic
      if (input.order !== undefined) {
        const currentOrder = existingSlot.order;
        const newOrder = input.order;

        if (currentOrder !== newOrder) {
          // If moving to a higher position (lower order number)
          if (newOrder < currentOrder) {
            // Increment order of slots between new position and current position
            await tx.raidSlot.updateMany({
              where: {
                raidId: existingSlot.raidId,
                order: { gte: newOrder, lt: currentOrder },
                id: { not: slotId },
              },
              data: { order: { increment: 1 } },
            });
          }
          // If moving to a lower position (higher order number)
          else if (newOrder > currentOrder) {
            // Decrement order of slots between current position and new position
            await tx.raidSlot.updateMany({
              where: {
                raidId: existingSlot.raidId,
                order: { gt: currentOrder, lte: newOrder },
                id: { not: slotId },
              },
              data: { order: { decrement: 1 } },
            });
          }
        }
      }

      // Update the slot
      const updatedSlot = await tx.raidSlot.update({
        where: { id: slotId },
        data: input,
        include: {
          raid: true,
        },
      });

      logger.info(`Raid slot updated: ${slotId}`, {
        slotId,
        raidId: existingSlot.raidId,
        updates: input,
      });

      return updatedSlot;
    });

    if (cache && slot.raidId) {
      CacheInvalidation.invalidateRaid(cache, slot.raidId, slot.raid?.serverId).catch((error) => {
        logger.warn("Cache invalidation failed", { error, raidId: slot.raidId });
      });
    }

    if (publisher && slot.raid) {
      publisher.publishRaidUpdated(slot.raid).catch((error) => {
        logger.warn("Event publishing failed", { error, raidId: slot.raidId });
      });
    }

    return slot;
  }

  export async function deleteRaidSlot(slotId: string, options: RaidServiceOptions = {}): Promise<void> {
    const { cache, publisher } = options;

    let raidId: string;
    let _serverId: string;

    const slot = await prisma.$transaction(async (tx) => {
      // Check if slot exists
      const existingSlot = await tx.raidSlot.findUnique({
        where: { id: slotId },
        include: {
          raid: true,
        },
      });

      if (!existingSlot) {
        throw new ServiceError(ServiceErrorCode.NOT_FOUND, `Raid slot with ID "${slotId}" not found`);
      }

      if (!existingSlot.raid || !existingSlot.raidId) {
        throw new ServiceError(ServiceErrorCode.NOT_FOUND, "Raid not found for this slot");
      }

      raidId = existingSlot.raidId;
      _serverId = existingSlot.raid.serverId;

      // Check if raid is in a state where slots can be modified
      if (!["SCHEDULED", "OPEN", "CLOSED"].includes(existingSlot.raid.status)) {
        throw new ServiceError(
          ServiceErrorCode.INVALID_STATE,
          "Cannot modify slots for raids that have started or finished",
        );
      }

      // Delete the slot
      await tx.raidSlot.delete({
        where: { id: slotId },
      });

      logger.info(`Raid slot deleted: ${slotId}`, {
        slotId,
        raidId: existingSlot.raidId,
        slotName: existingSlot.name,
      });

      return existingSlot;
    });

    if (cache && slot.raidId && slot.raid?.serverId) {
      CacheInvalidation.invalidateRaid(cache, slot.raidId, slot.raid?.serverId).catch((error) => {
        logger.warn("Cache invalidation failed", { error, raidId });
      });
    }

    if (publisher && slot.raid) {
      publisher.publishRaidUpdated(slot.raid).catch((error) => {
        logger.warn("Event publishing failed", { error, raidId });
      });
    }
  }
}
