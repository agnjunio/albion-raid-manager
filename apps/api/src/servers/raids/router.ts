import { RaidService } from "@albion-raid-manager/core/services";
import { logger } from "@albion-raid-manager/logger";
import {
  APIErrorType,
  APIResponse,
  CreateRaid,
  CreateRaidSlot,
  DeleteRaidSlot,
  GetRaid,
  GetRaids,
  UpdateRaid,
  UpdateRaidSlot,
} from "@albion-raid-manager/types/api";
import { Request, Response, Router } from "express";

import { validateRequest } from "@/request";

import { raidPermission } from "./middleware";
import { getRaidEventPublisher } from "./redis";
import { createRaidSchema, createRaidSlotSchema } from "./schemas";

export const serverRaidsRouter: Router = Router({ mergeParams: true });

serverRaidsRouter.use(raidPermission);

serverRaidsRouter.post(
  "/",
  validateRequest({ body: createRaidSchema }),
  async (
    req: Request<CreateRaid.Params, {}, CreateRaid.Body>,
    res: Response<APIResponse.Type<CreateRaid.Response>>,
  ) => {
    const { serverId } = req.params;
    const { title, contentType, date, location, description, maxPlayers } = req.body;

    const raid = await RaidService.createRaid(
      {
        serverId,
        title,
        contentType,
        date: new Date(date),
        location,
        description,
        maxPlayers,
      },
      {
        publisher: await getRaidEventPublisher(),
      },
    );

    res.json(APIResponse.Success({ raid }));
  },
);

serverRaidsRouter.get(
  "/",
  async (req: Request<GetRaids.Params>, res: Response<APIResponse.Type<GetRaids.Response>>) => {
    const { serverId } = req.params;

    if (!serverId) {
      throw APIResponse.Error(APIErrorType.BAD_REQUEST, "Server ID is required");
    }

    const raids = await RaidService.findRaids({ serverId });

    res.json(APIResponse.Success({ raids }));
  },
);

serverRaidsRouter.get(
  "/:raidId",
  async (req: Request<GetRaid.Params, {}, GetRaid.Query>, res: Response<APIResponse.Type<GetRaid.Response>>) => {
    const { serverId, raidId } = req.params;
    const { slots } = req.query;

    if (!serverId || !raidId) {
      throw APIResponse.Error(APIErrorType.BAD_REQUEST, "Server ID and Raid ID are required");
    }

    const raid = await RaidService.findRaidById(raidId, {
      slots: Boolean(slots),
    });

    if (!raid) {
      return res.status(404).json(APIResponse.Error(APIErrorType.NOT_FOUND, "Raid not found"));
    }

    res.json(APIResponse.Success({ raid }));
  },
);

serverRaidsRouter.put(
  "/:raidId",
  async (
    req: Request<UpdateRaid.Params, {}, UpdateRaid.Body>,
    res: Response<APIResponse.Type<UpdateRaid.Response>>,
  ) => {
    const { serverId, raidId } = req.params;

    if (!serverId || !raidId) {
      throw APIResponse.Error(APIErrorType.BAD_REQUEST, "Server ID and Raid ID are required");
    }

    const { status } = req.body;

    const raid = await RaidService.updateRaid(raidId, { status }, { publisher: await getRaidEventPublisher() });

    res.json(APIResponse.Success({ raid }));
  },
);

serverRaidsRouter.delete("/:raidId", async (req: Request<{ serverId: string; raidId: string }>, res: Response) => {
  const { serverId, raidId } = req.params;

  if (!serverId || !raidId) {
    throw APIResponse.Error(APIErrorType.BAD_REQUEST, "Server ID and Raid ID are required");
  }

  await RaidService.deleteRaid(raidId, { publisher: await getRaidEventPublisher() });

  res.json(APIResponse.Success({ message: "Raid deleted successfully" }));
});

serverRaidsRouter.post(
  "/:raidId/slots",
  validateRequest({ body: createRaidSlotSchema }),
  async (
    req: Request<CreateRaidSlot.Params, {}, CreateRaidSlot.Body>,
    res: Response<APIResponse.Type<CreateRaidSlot.Response>>,
  ) => {
    const { raidId } = req.params;
    const { name, role, comment } = req.body;

    try {
      const raid = await RaidService.createRaidSlot(
        {
          raidId,
          name,
          role,
          comment,
        },
        { publisher: await getRaidEventPublisher() },
      );

      res.json(APIResponse.Success({ raid }));
    } catch (error) {
      logger.error("Failed to create raid slot:", error);
      res.status(500).json(APIResponse.Error(APIErrorType.INTERNAL_SERVER_ERROR, "Failed to create raid slot"));
    }
  },
);

serverRaidsRouter.put(
  "/:raidId/slots/:slotId",
  async (
    req: Request<UpdateRaidSlot.Params, {}, UpdateRaidSlot.Body>,
    res: Response<APIResponse.Type<UpdateRaidSlot.Response>>,
  ) => {
    const { slotId } = req.params;
    const updates = req.body;

    try {
      const raid = await RaidService.updateRaidSlot(slotId, updates, { publisher: await getRaidEventPublisher() });
      res.json(APIResponse.Success({ raid }));
    } catch (error) {
      logger.error("Failed to update raid slot:", error);
      res.status(500).json(APIResponse.Error(APIErrorType.INTERNAL_SERVER_ERROR, "Failed to update raid slot"));
    }
  },
);

serverRaidsRouter.delete(
  "/:raidId/slots/:slotId",
  async (req: Request<DeleteRaidSlot.Params>, res: Response<APIResponse.Type<DeleteRaidSlot.Response>>) => {
    const { slotId } = req.params;

    try {
      await RaidService.deleteRaidSlot(slotId, { publisher: await getRaidEventPublisher() });
      res.json(APIResponse.Success({ message: "Slot deleted successfully" }));
    } catch (error) {
      logger.error("Failed to delete raid slot:", error);
      res.status(500).json(APIResponse.Error(APIErrorType.INTERNAL_SERVER_ERROR, "Failed to delete raid slot"));
    }
  },
);
