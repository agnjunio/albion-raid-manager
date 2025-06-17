import { Composition } from "@albion-raid-manager/core/types";
import { APIErrorType, APIResponse } from "@albion-raid-manager/core/types/api";
import {
  CreateGuildRaid,
  GetGuildRaid,
  GetGuildRaids,
  UpdateGuildRaid,
} from "@albion-raid-manager/core/types/api/raids";
import { prisma } from "@albion-raid-manager/database";
import { Request, Response, Router } from "express";

import { auth } from "@/auth/middleware";
import { validateRequest } from "@/request";

import { raidPermission } from "./middleware";
import { createGuildRaidSchema } from "./schemas";

export const raidsRouter: Router = Router({ mergeParams: true });

raidsRouter.use(auth, raidPermission);

raidsRouter.post(
  "/",
  validateRequest({ body: createGuildRaidSchema }),
  async (
    req: Request<CreateGuildRaid.Params, {}, CreateGuildRaid.Body>,
    res: Response<APIResponse.Type<CreateGuildRaid.Response>>,
  ) => {
    const { guildId } = req.params;
    const { description, date, compositionId } = req.body;

    let composition: Composition | null = null;
    if (compositionId) {
      composition = await prisma.composition.findUnique({
        where: {
          id: compositionId,
        },
      });

      if (!composition) {
        throw APIResponse.Error(APIErrorType.NOT_FOUND, "Composition not found");
      }
    }

    const raid = await prisma.$transaction(async (tx) => {
      const raid = await tx.raid.create({
        data: { guildId, description, date },
      });

      if (composition && composition.builds) {
        await tx.raidSlot.createMany({
          data: composition.builds.map((build) => ({
            raidId: raid.id,
            name: build.name,
            buildId: build.id,
          })),
        });
      }

      return tx.raid.findUnique({
        where: {
          id: raid.id,
        },
        include: {
          slots: true,
        },
      });
    });

    res.json(APIResponse.Success({ raid }));
  },
);

raidsRouter.get(
  "/",
  async (req: Request<GetGuildRaids.Params>, res: Response<APIResponse.Type<GetGuildRaids.Response>>) => {
    const { guildId } = req.params;

    if (!guildId) {
      throw APIResponse.Error(APIErrorType.BAD_REQUEST, "Guild ID is required");
    }

    const raids = await prisma.raid.findMany({
      where: {
        guildId,
      },
    });

    res.json(APIResponse.Success({ raids }));
  },
);

raidsRouter.get(
  "/:raidId",
  async (req: Request<GetGuildRaid.Params>, res: Response<APIResponse.Type<GetGuildRaid.Response>>) => {
    const { guildId, raidId } = req.params;

    if (!guildId || !raidId) {
      throw APIResponse.Error(APIErrorType.BAD_REQUEST, "Guild ID and Raid ID are required");
    }

    const raid = await prisma.raid.findUnique({
      where: {
        id: raidId,
      },
    });

    if (!raid) {
      return res.status(404).json(APIResponse.Error(APIErrorType.NOT_FOUND, "Raid not found"));
    }

    res.json(APIResponse.Success({ raid }));
  },
);

raidsRouter.put(
  "/:raidId",
  async (
    req: Request<UpdateGuildRaid.Params, {}, UpdateGuildRaid.Body>,
    res: Response<APIResponse.Type<UpdateGuildRaid.Response>>,
  ) => {
    const { guildId, raidId } = req.params;

    if (!guildId || !raidId) {
      throw APIResponse.Error(APIErrorType.BAD_REQUEST, "Guild ID and Raid ID are required");
    }

    const { status } = req.body;

    const raid = await prisma.raid.update({
      where: { id: raidId },
      data: { status },
    });

    res.json(APIResponse.Success({ raid }));
  },
);
