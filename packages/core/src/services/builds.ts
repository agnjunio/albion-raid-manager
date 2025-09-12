import type { Cache } from "@albion-raid-manager/core/redis";

import { BuildPiece } from "@albion-raid-manager/types";
import {
  BuildFilters,
  BuildWithPieces,
  CreateBuildInput,
  CreateBuildPieceInput,
  ServiceError,
  ServiceErrorCode,
  UpdateBuildInput,
  UpdateBuildPieceInput,
} from "@albion-raid-manager/types/services";

import { CacheInvalidation } from "@albion-raid-manager/core/cache/redis";
import { CacheKeys, withCache } from "@albion-raid-manager/core/cache/utils";
import { prisma } from "@albion-raid-manager/core/database";
import { logger } from "@albion-raid-manager/core/logger";

import { ServersService } from "./servers";

export interface BuildServiceOptions {
  cache?: Cache;
  cacheTtl?: number;
}

export namespace BuildService {
  const DEFAULT_CACHE_TTL = 300; // 5 minutes

  export async function createBuild(
    input: CreateBuildInput,
    options: BuildServiceOptions = {},
  ): Promise<BuildWithPieces> {
    const { name, description, role, serverId, pieces = [] } = input;
    const { cache } = options;

    await ServersService.ensureServerExists(serverId);

    // Check if build with same name already exists for this server
    const existingBuild = await prisma.build.findFirst({
      where: {
        name,
        serverId,
      },
    });

    if (existingBuild) {
      throw new ServiceError(ServiceErrorCode.INVALID_STATE, `Build with name "${name}" already exists in this server`);
    }

    const build = await prisma.$transaction(async (tx) => {
      // Create the build
      const build = await tx.build.create({
        data: {
          name,
          description,
          role,
          serverId,
        },
        include: {
          pieces: {
            orderBy: {
              order: "asc",
            },
          },
        },
      });

      // Create build pieces if provided
      if (pieces.length > 0) {
        await tx.buildPiece.createMany({
          data: pieces.map((piece, index) => ({
            buildId: build.id,
            gearSlot: piece.gearSlot,
            itemName: piece.itemName,
            quantity: piece.quantity ?? 1,
            description: piece.description,
            order: piece.order ?? index,
          })),
        });

        // Fetch the build with pieces
        const buildWithPieces = await tx.build.findUnique({
          where: { id: build.id },
          include: {
            pieces: {
              orderBy: {
                order: "asc",
              },
            },
          },
        });

        logger.info(`Build created: ${build.id}`, {
          buildId: build.id,
          serverId,
          name,
          role,
          pieceCount: pieces.length,
        });

        if (!buildWithPieces) {
          throw new ServiceError(ServiceErrorCode.CREATE_FAILED, "Failed to create build");
        }

        return buildWithPieces;
      }

      logger.info(`Build created: ${build.id}`, {
        buildId: build.id,
        serverId,
        name,
        role,
        pieceCount: 0,
      });

      return build;
    });

    if (cache) {
      CacheInvalidation.invalidateServerBuilds(cache, serverId).catch((error) => {
        logger.warn("Cache invalidation failed", { error, serverId });
      });
    }

    return build;
  }

  export async function getBuildById(
    buildId: string,
    options: BuildServiceOptions = {},
  ): Promise<BuildWithPieces | null> {
    const { cache, cacheTtl = DEFAULT_CACHE_TTL } = options;
    const cacheKey = CacheKeys.build(buildId);

    if (cache) {
      const cached = await withCache(
        async () => {
          return await prisma.build.findUnique({
            where: { id: buildId },
            include: {
              pieces: {
                orderBy: {
                  order: "asc",
                },
              },
            },
          });
        },
        {
          cache,
          key: cacheKey,
          ttl: cacheTtl,
        },
      );

      return cached;
    }

    return await prisma.build.findUnique({
      where: { id: buildId },
      include: {
        pieces: {
          orderBy: {
            order: "asc",
          },
        },
      },
    });
  }

  export async function getBuildsByServer(
    serverId: string,
    filters: BuildFilters = {},
    options: BuildServiceOptions = {},
  ): Promise<BuildWithPieces[]> {
    const { cache, cacheTtl = DEFAULT_CACHE_TTL } = options;
    const { role, name, contentType } = filters;

    const cacheKey = CacheKeys.buildsByServer(serverId, CacheKeys.hashObject(filters));

    return withCache(
      async () => {
        return await prisma.build.findMany({
          where: {
            serverId,
            ...(role && { role }),
            ...(name && { name: { contains: name, mode: "insensitive" } }),
            ...(contentType && { contentType }),
          },
          include: {
            pieces: {
              orderBy: {
                order: "asc",
              },
            },
          },
          orderBy: {
            createdAt: "desc",
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

  export async function updateBuild(
    buildId: string,
    input: UpdateBuildInput,
    options: BuildServiceOptions = {},
  ): Promise<BuildWithPieces> {
    const { cache } = options;

    const build = await prisma.$transaction(async (tx) => {
      // Check if build exists
      const existingBuild = await tx.build.findUnique({
        where: { id: buildId },
      });

      if (!existingBuild) {
        throw new ServiceError(ServiceErrorCode.NOT_FOUND, `Build with ID "${buildId}" not found`);
      }

      // Check for name conflicts if name is being updated
      if (input.name && input.name !== existingBuild.name) {
        const conflictingBuild = await tx.build.findFirst({
          where: {
            name: input.name,
            serverId: existingBuild.serverId,
            id: { not: buildId },
          },
        });

        if (conflictingBuild) {
          throw new ServiceError(
            ServiceErrorCode.INVALID_STATE,
            `Build with name "${input.name}" already exists in this server`,
          );
        }
      }

      // Update the build
      const updatedBuild = await tx.build.update({
        where: { id: buildId },
        data: input,
        include: {
          pieces: {
            orderBy: {
              order: "asc",
            },
          },
        },
      });

      logger.verbose(`Build updated: ${buildId}`, {
        buildId,
        updates: input,
      });

      return updatedBuild;
    });

    if (cache) {
      CacheInvalidation.invalidateBuild(cache, buildId).catch((error) => {
        logger.warn("Cache invalidation failed", { error, buildId });
      });
    }

    return build;
  }

  export async function deleteBuild(buildId: string, options: BuildServiceOptions = {}): Promise<void> {
    const { cache } = options;

    await prisma.$transaction(async (tx) => {
      // Check if build exists
      const existingBuild = await tx.build.findUnique({
        where: { id: buildId },
        include: {
          raidSlots: true,
        },
      });

      if (!existingBuild) {
        throw new ServiceError(ServiceErrorCode.NOT_FOUND, `Build with ID "${buildId}" not found`);
      }

      // Check if build is being used by any raid slots
      if (existingBuild.raidSlots.length > 0) {
        throw new ServiceError(
          ServiceErrorCode.INVALID_STATE,
          `Cannot delete build "${existingBuild.name}" as it is being used by ${existingBuild.raidSlots.length} raid slot(s)`,
        );
      }

      // Delete the build (pieces will be deleted due to cascade)
      await tx.build.delete({
        where: { id: buildId },
      });

      logger.verbose(`Build deleted: ${buildId}`, {
        buildId,
        name: existingBuild.name,
        serverId: existingBuild.serverId,
      });
    });

    if (cache) {
      CacheInvalidation.invalidateBuild(cache, buildId).catch((error) => {
        logger.warn("Cache invalidation failed", { error, buildId });
      });
    }
  }

  export async function addBuildPiece(
    buildId: string,
    input: CreateBuildPieceInput,
    options: BuildServiceOptions = {},
  ): Promise<BuildPiece> {
    const { cache } = options;

    const piece = await prisma.$transaction(async (tx) => {
      // Check if build exists
      const existingBuild = await tx.build.findUnique({
        where: { id: buildId },
      });

      if (!existingBuild) {
        throw new ServiceError(ServiceErrorCode.NOT_FOUND, `Build with ID "${buildId}" not found`);
      }

      // Get the next order number for this gear slot
      const lastPiece = await tx.buildPiece.findFirst({
        where: {
          buildId,
          gearSlot: input.gearSlot,
        },
        orderBy: {
          order: "desc",
        },
      });

      const order = input.order ?? (lastPiece ? lastPiece.order + 1 : 0);

      // Create the piece
      const piece = await tx.buildPiece.create({
        data: {
          buildId,
          gearSlot: input.gearSlot,
          itemName: input.itemName,
          quantity: input.quantity ?? 1,
          description: input.description,
          order,
        },
      });

      logger.verbose(`Build piece added: ${piece.id}`, {
        pieceId: piece.id,
        buildId,
        gearSlot: input.gearSlot,
        itemName: input.itemName,
      });

      return piece;
    });

    if (cache) {
      CacheInvalidation.invalidateBuild(cache, buildId).catch((error) => {
        logger.warn("Cache invalidation failed", { error, buildId });
      });
    }

    return piece;
  }

  export async function updateBuildPiece(
    pieceId: string,
    input: UpdateBuildPieceInput,
    options: BuildServiceOptions = {},
  ): Promise<BuildPiece> {
    const { cache } = options;

    const piece = await prisma.$transaction(async (tx) => {
      // Check if piece exists
      const existingPiece = await tx.buildPiece.findUnique({
        where: { id: pieceId },
        include: {
          build: true,
        },
      });

      if (!existingPiece) {
        throw new ServiceError(ServiceErrorCode.NOT_FOUND, `Build piece with ID "${pieceId}" not found`);
      }

      // Update the piece
      const updatedPiece = await tx.buildPiece.update({
        where: { id: pieceId },
        data: input,
      });

      logger.verbose(`Build piece updated: ${pieceId}`, {
        pieceId,
        buildId: existingPiece.buildId,
        updates: input,
      });

      return updatedPiece;
    });

    if (cache) {
      CacheInvalidation.invalidateBuild(cache, piece.buildId).catch((error) => {
        logger.warn("Cache invalidation failed", { error, buildId: piece.buildId });
      });
    }

    return piece;
  }

  export async function deleteBuildPiece(pieceId: string, options: BuildServiceOptions = {}): Promise<void> {
    const { cache } = options;

    const buildPiece = await prisma.$transaction(async (tx) => {
      const existingPiece = await tx.buildPiece.findUnique({
        where: { id: pieceId },
        include: {
          build: true,
        },
      });

      if (!existingPiece) {
        throw new ServiceError(ServiceErrorCode.NOT_FOUND, `Build piece with ID "${pieceId}" not found`);
      }

      await prisma.buildPiece.delete({
        where: { id: pieceId },
      });

      // Reorder the remaining pieces
      await tx.buildPiece.updateMany({
        where: {
          buildId: existingPiece.buildId,
          order: {
            gt: existingPiece.order,
          },
        },
        data: {
          order: {
            decrement: 1,
          },
        },
      });

      return existingPiece;
    });

    logger.verbose(`Build piece deleted: ${pieceId}`, {
      pieceId,
      buildId: buildPiece.buildId,
      gearSlot: buildPiece.gearSlot,
    });

    if (cache) {
      CacheInvalidation.invalidateBuild(cache, buildPiece.buildId).catch((error) => {
        logger.warn("Cache invalidation failed", { error, buildId: buildPiece.buildId });
      });
    }
  }
}
