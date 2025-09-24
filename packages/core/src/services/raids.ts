import type { Cache, RaidEventPublisher } from "@albion-raid-manager/core/redis";

import { Raid, RaidSlot } from "@albion-raid-manager/types";
import { getContentTypeInfo, type RaidConfiguration } from "@albion-raid-manager/types/entities";
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

import { PermissionsService } from "./permissions";
import { ServersService } from "./servers";

export interface RaidServiceOptions {
  cache?: Cache;
  cacheTtl?: number;
  publisher?: RaidEventPublisher | null;
  userId?: string;
}

export namespace RaidService {
  const DEFAULT_CACHE_TTL = 60;

  export async function createRaid(input: CreateRaidInput, options: RaidServiceOptions = {}): Promise<Raid> {
    const { title, description, date, contentType, location, serverId } = input;
    const { userId, cache, publisher } = options;

    if (!userId) {
      throw new ServiceError(ServiceErrorCode.NOT_AUTHORIZED, "User ID is required");
    }

    await ServersService.ensureServer(serverId);
    await PermissionsService.requireAdminOrCallerRoles(serverId, userId, { cache });

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
          slots: {
            orderBy: {
              order: "asc",
            },
          },
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
              order: i,
            })),
          });

          logger.debug(`Successfully created ${slotCount} slots for raid ${raid.id}`, {
            raidId: raid.id,
            contentType,
            slotCount: slotCount,
          });
        } catch (error) {
          logger.error(`Failed to create slots for raid ${raid.id}:`, { error });
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
    const { userId, cache, publisher } = options;

    if (!userId) {
      throw new ServiceError(ServiceErrorCode.NOT_AUTHORIZED, "User ID is required");
    }

    const previousRaid = await findRaidById(id);

    if (!previousRaid) {
      throw new ServiceError(ServiceErrorCode.NOT_FOUND, `Raid with ID "${id}" not found`);
    }

    await PermissionsService.requireAdminOrCallerRoles(previousRaid.serverId, userId, { cache });

    const raid = await prisma.$transaction(async (tx) => {
      // Update the raid
      const updatedRaid = await tx.raid.update({
        where: { id },
        data: input,
        include: {
          slots: {
            orderBy: {
              order: "asc",
            },
          },
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
      const previous: Record<string, unknown> = {};
      for (const key of Object.keys(input)) {
        const typedKey = key as keyof Raid;
        previous[typedKey] = previousRaid[typedKey];
      }

      publisher.publishRaidUpdated(raid, previous).catch((error) => {
        logger.warn("Event publishing failed", { error, raidId: id });
      });
    }

    return raid;
  }

  export async function deleteRaid(id: string, options: RaidServiceOptions = {}): Promise<void> {
    const { userId, cache, publisher } = options;

    if (!userId) {
      throw new ServiceError(ServiceErrorCode.NOT_AUTHORIZED, "User ID is required");
    }

    // First, get the raid to check permissions
    const existingRaid = await findRaidById(id);
    if (!existingRaid) {
      throw new ServiceError(ServiceErrorCode.NOT_FOUND, `Raid with ID "${id}" not found`);
    }

    await PermissionsService.requireAdminOrCallerRoles(existingRaid.serverId, userId, { cache });

    const raid = await prisma.$transaction(async (tx) => {
      // Check if raid exists (we already checked above, but doing it again for safety)
      const raidToDelete = await tx.raid.findUnique({
        where: { id },
        include: {
          slots: {
            orderBy: {
              order: "asc",
            },
          },
        },
      });

      if (!raidToDelete) {
        throw new ServiceError(ServiceErrorCode.NOT_FOUND, `Raid with ID "${id}" not found`);
      }

      // Delete the raid (slots will be deleted due to cascade)
      await tx.raid.delete({
        where: { id },
      });

      logger.info(`Raid deleted: ${id}`, {
        raidId: id,
        serverId: raidToDelete.serverId,
        title: raidToDelete.title,
      });

      return raidToDelete;
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

  export async function importRaidConfiguration(
    raidId: string,
    configuration: RaidConfiguration,
    options: RaidServiceOptions = {},
  ): Promise<Raid> {
    const { cache, publisher } = options;

    const raid = await prisma.$transaction(async (tx) => {
      // Check if raid exists and get current state
      const existingRaid = await tx.raid.findUnique({
        where: { id: raidId },
        include: {
          slots: {
            orderBy: {
              order: "asc",
            },
          },
        },
      });

      if (!existingRaid) {
        throw new ServiceError(ServiceErrorCode.NOT_FOUND, `Raid with ID "${raidId}" not found`);
      }

      // Check if raid is in a state where it can be modified
      if (!["SCHEDULED", "OPEN", "CLOSED"].includes(existingRaid.status)) {
        throw new ServiceError(
          ServiceErrorCode.INVALID_STATE,
          "Cannot import configuration for raids that are not scheduled, open, or closed",
        );
      }

      // Check content type compatibility
      if (existingRaid.contentType !== configuration.contentType) {
        throw new ServiceError(
          ServiceErrorCode.INVALID_INPUT,
          `Content type mismatch. Raid is ${existingRaid.contentType}, but configuration is for ${configuration.contentType}`,
        );
      }

      // Update raid data
      await tx.raid.update({
        where: { id: raidId },
        data: {
          description: configuration.raidData.description,
          note: configuration.raidData.note,
          location: configuration.raidData.location,
        },
        include: {
          slots: {
            orderBy: {
              order: "asc",
            },
          },
        },
      });

      // Delete all existing slots
      if (existingRaid.slots.length > 0) {
        await tx.raidSlot.deleteMany({
          where: { raidId },
        });
      }

      // Create new slots from configuration
      if (configuration.composition.slots.length > 0) {
        await tx.raidSlot.createMany({
          data: configuration.composition.slots.map((slot, index) => ({
            raidId,
            name: slot.name,
            role: slot.role || null,
            weapon: slot.weapon || null,
            comment: slot.comment || null,
            order: slot.order ?? index,
            userId: null,
          })),
        });
      }

      // Get the updated raid with all slots
      const finalRaid = await tx.raid.findUnique({
        where: { id: raidId },
        include: {
          slots: {
            orderBy: { order: "asc" },
          },
        },
      });

      if (!finalRaid) {
        throw new ServiceError(ServiceErrorCode.INTERNAL_ERROR, "Failed to retrieve updated raid");
      }

      logger.verbose(`Raid configuration imported: ${raidId}`, {
        raidId,
        slotsCount: configuration.composition.slots.length,
        configurationVersion: configuration.version,
      });

      return finalRaid;
    });

    if (cache && raid.serverId) {
      CacheInvalidation.invalidateRaid(cache, raidId, raid.serverId).catch((error) => {
        logger.warn("Cache invalidation failed", { error, raidId });
      });
    }

    if (publisher) {
      publisher.publishRaidUpdated(raid).catch((error) => {
        logger.warn("Event publishing failed", { error, raidId });
      });
    }

    return raid;
  }

  export async function createRaidSlot(
    input: CreateRaidSlotInput & { raidId: string },
    options: RaidServiceOptions = {},
  ): Promise<Raid> {
    const { raidId, name, role, comment, weapon, buildId, order, userId: slotUserId } = input;
    const { userId, cache, publisher } = options;

    if (!userId) {
      throw new ServiceError(ServiceErrorCode.NOT_AUTHORIZED, "User ID is required");
    }

    // Verify the raid exists and is in a state where slots can be modified
    const raid = await findRaidById(raidId, { slots: true });

    if (!raid) {
      throw new ServiceError(ServiceErrorCode.NOT_FOUND, "Raid not found");
    }

    await PermissionsService.requireAdminOrCallerRoles(raid.serverId, userId, { cache });

    if (!["SCHEDULED", "OPEN", "CLOSED"].includes(raid.status)) {
      throw new ServiceError(
        ServiceErrorCode.INVALID_STATE,
        "Cannot modify slots for raids that have started or finished",
      );
    }

    if (slotUserId) {
      // Ensure the user exists in our database to satisfy foreign key constraints
      // This handles both normal user creation and fallback cases when Discord API is unavailable
      await ServersService.ensureServerMember(raid.serverId, slotUserId);

      // Check if the user is already assigned to another slot in this raid
      const existingUserSlot = await prisma.raidSlot.findFirst({
        where: {
          raidId,
          userId: slotUserId,
        },
      });

      // If user is assigned to another slot, unassign them from that slot
      if (existingUserSlot) {
        await prisma.raidSlot.update({
          where: { id: existingUserSlot.id },
          data: { userId: null },
        });

        logger.verbose(`Unassigned user from existing slot when creating new slot with user assignment`, {
          userId: slotUserId,
          unassignedSlotId: existingUserSlot.id,
          raidId,
        });
      }
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
            userId: slotUserId,
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
    const { userId, cache, publisher } = options;

    if (!userId) {
      throw new ServiceError(ServiceErrorCode.NOT_AUTHORIZED, "User ID is required");
    }

    const existingSlot = await prisma.raidSlot.findUnique({
      where: { id: slotId },
      include: {
        raid: {
          include: {
            slots: true,
          },
        },
      },
    });

    if (!existingSlot) {
      throw new ServiceError(ServiceErrorCode.NOT_FOUND, `Raid slot with ID "${slotId}" not found`);
    }
    if (!existingSlot.raid) {
      throw new ServiceError(ServiceErrorCode.NOT_FOUND, "Raid not found for this slot");
    }

    const { raid } = existingSlot;
    if (!raid?.slots) {
      throw new ServiceError(ServiceErrorCode.NOT_FOUND, `Raid with ID "${slotId}" not found`);
    }

    await PermissionsService.requireAdminOrCallerRoles(raid.serverId, userId, { cache });

    const previousSlots = [...raid.slots];
    const slot = await prisma.$transaction(async (tx) => {
      // Check if slot exists
      // Check if raid is in a state where slots can be modified
      if (!["SCHEDULED", "OPEN", "CLOSED"].includes(raid.status)) {
        throw new ServiceError(
          ServiceErrorCode.INVALID_STATE,
          "Cannot modify slots for raids that have started or finished",
        );
      }

      if (input.userId) {
        // Ensure the user exists in our database to satisfy foreign key constraints
        // This handles both normal user creation and fallback cases when Discord API is unavailable
        await ServersService.ensureServerMember(raid.serverId, input.userId);

        // Check if the user is already assigned to another slot in this raid
        const existingUserSlot = await tx.raidSlot.findFirst({
          where: {
            raidId: existingSlot.raidId,
            userId: input.userId,
            id: { not: slotId }, // Exclude the current slot being updated
          },
        });

        // If user is assigned to another slot, unassign them from that slot
        if (existingUserSlot) {
          await tx.raidSlot.update({
            where: { id: existingUserSlot.id },
            data: { userId: null },
          });

          logger.info(`Unassigned user from existing slot when assigning to new slot`, {
            userId: input.userId,
            unassignedSlotId: existingUserSlot.id,
            newSlotId: slotId,
            raidId: existingSlot.raidId,
          });
        }
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

      const updatedSlot = await tx.raidSlot.update({
        where: { id: slotId },
        data: input,
        include: {
          raid: {
            include: {
              slots: {
                orderBy: { order: "asc" },
              },
            },
          },
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
      publisher.publishRaidUpdated(slot.raid, { slots: previousSlots }).catch((error) => {
        logger.warn("Event publishing failed", { error, raidId: slot.raidId });
      });
    }

    return slot;
  }

  export async function deleteRaidSlot(slotId: string, options: RaidServiceOptions = {}): Promise<void> {
    const { userId, cache, publisher } = options;

    if (!userId) {
      throw new ServiceError(ServiceErrorCode.NOT_AUTHORIZED, "User ID is required");
    }

    let raidId: string;
    let _serverId: string;

    // First, get the slot to check permissions
    const existingSlot = await prisma.raidSlot.findUnique({
      where: { id: slotId },
      include: { raid: true },
    });

    if (!existingSlot || !existingSlot.raid) {
      throw new ServiceError(ServiceErrorCode.NOT_FOUND, `Raid slot with ID "${slotId}" not found`);
    }

    await PermissionsService.requireAdminOrCallerRoles(existingSlot.raid.serverId, userId, {
      cache,
    });

    const slot = await prisma.$transaction(async (tx) => {
      // Check if slot exists (we already checked above, but doing it again for safety)
      const slotToDelete = await tx.raidSlot.findUnique({
        where: { id: slotId },
        include: {
          raid: true,
        },
      });

      if (!slotToDelete) {
        throw new ServiceError(ServiceErrorCode.NOT_FOUND, `Raid slot with ID "${slotId}" not found`);
      }

      if (!slotToDelete.raid || !slotToDelete.raidId) {
        throw new ServiceError(ServiceErrorCode.NOT_FOUND, "Raid not found for this slot");
      }

      raidId = slotToDelete.raidId;
      _serverId = slotToDelete.raid.serverId;

      // Check if raid is in a state where slots can be modified
      if (!["SCHEDULED", "OPEN", "CLOSED"].includes(slotToDelete.raid.status)) {
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
        raidId: slotToDelete.raidId,
        slotName: slotToDelete.name,
      });

      return slotToDelete;
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

  export async function reorderSlots(
    raidId: string,
    slotIds: string[],
    options: RaidServiceOptions = {},
  ): Promise<Raid> {
    const { userId, cache, publisher } = options;

    if (!userId) {
      throw new ServiceError(ServiceErrorCode.NOT_AUTHORIZED, "User ID is required");
    }

    // First, get the raid to check permissions
    const existingRaid = await findRaidById(raidId);
    if (!existingRaid) {
      throw new ServiceError(ServiceErrorCode.NOT_FOUND, `Raid with ID ${raidId} not found`);
    }

    await PermissionsService.requireAdminOrCallerRoles(existingRaid.serverId, userId, { cache });

    const raid = await prisma.$transaction(async (tx) => {
      const raid = await tx.raid.findUnique({
        where: { id: raidId },
        include: {
          slots: {
            orderBy: { order: "asc" },
          },
        },
      });

      if (!raid) {
        throw new ServiceError(ServiceErrorCode.NOT_FOUND, `Raid with ID ${raidId} not found`);
      }

      const existingSlotIds = raid.slots.map((slot) => slot.id);
      const invalidSlotIds = slotIds.filter((id) => !existingSlotIds.includes(id));

      if (invalidSlotIds.length > 0) {
        throw new ServiceError(ServiceErrorCode.INVALID_INPUT, `Invalid slot IDs: ${invalidSlotIds.join(", ")}`);
      }

      const missingSlotIds = existingSlotIds.filter((id) => !slotIds.includes(id));
      if (missingSlotIds.length > 0) {
        throw new ServiceError(ServiceErrorCode.INVALID_INPUT, `Missing slot IDs: ${missingSlotIds.join(", ")}`);
      }

      for (let i = 0; i < slotIds.length; i++) {
        await tx.raidSlot.update({
          where: { id: slotIds[i] },
          data: { order: i },
        });
      }

      const updatedRaid = await tx.raid.findUnique({
        where: { id: raidId },
        include: {
          slots: {
            orderBy: { order: "asc" },
          },
        },
      });

      if (!updatedRaid) {
        throw new ServiceError(ServiceErrorCode.INTERNAL_ERROR, "Failed to retrieve updated raid");
      }

      logger.verbose(`Raid slots reordered for raid ${raidId}`, {
        raidId,
        slotCount: slotIds.length,
        newOrder: slotIds,
      });

      return updatedRaid;
    });

    if (cache) {
      CacheInvalidation.invalidateRaid(cache, raidId, raid.serverId).catch((error) => {
        logger.warn("Cache invalidation failed", { error, raidId });
      });
    }

    if (publisher) {
      publisher.publishRaidUpdated(raid).catch((error) => {
        logger.warn("Event publishing failed", { error, raidId });
      });
    }

    return raid;
  }
}
