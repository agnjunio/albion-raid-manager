import { RaidService } from "@albion-raid-manager/core/services";
import { logger } from "@albion-raid-manager/logger";
import {
  APIErrorType,
  APIResponse,
  CreateRaid,
  CreateRaidSlot,
  GetRaid,
  GetRaids,
  UpdateGuildRaid,
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

    const raid = await RaidService.createRaid({
      serverId,
      title,
      contentType,
      date: new Date(date),
      location,
      description,
      maxPlayers,
    });

    try {
      const publisher = await getRaidEventPublisher();
      if (publisher) {
        await publisher.publishRaidCreated(raid, serverId);
      }
    } catch (error) {
      logger.error("Failed to publish raid created event:", error);
    }

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
    req: Request<UpdateGuildRaid.Params, {}, UpdateGuildRaid.Body>,
    res: Response<APIResponse.Type<UpdateGuildRaid.Response>>,
  ) => {
    const { serverId, raidId } = req.params;

    if (!serverId || !raidId) {
      throw APIResponse.Error(APIErrorType.BAD_REQUEST, "Server ID and Raid ID are required");
    }

    const { status } = req.body;

    // Get the current raid to check for status changes
    const currentRaid = await RaidService.findRaidById(raidId);
    const previousStatus = currentRaid?.status;

    const raid = await RaidService.updateRaid(raidId, { status });

    // Publish raid updated event
    try {
      const publisher = await getRaidEventPublisher();
      if (publisher) {
        if (previousStatus && previousStatus !== status) {
          // Status changed - publish status change event
          await publisher.publishRaidStatusChanged(raid, serverId, previousStatus);
        } else {
          // General update - publish updated event
          await publisher.publishRaidUpdated(raid, serverId);
        }
      }
    } catch (error) {
      // Log error but don't fail the request
      logger.error("Failed to publish raid updated event:", error);
    }

    res.json(APIResponse.Success({ raid }));
  },
);

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
      const slot = await RaidService.createRaidSlot({
        raidId,
        name,
        role,
        comment,
      });

      res.json(APIResponse.Success({ slot }));
    } catch (error) {
      logger.error("Failed to create raid slot:", error);
      res.status(500).json(APIResponse.Error(APIErrorType.INTERNAL_SERVER_ERROR, "Failed to create raid slot"));
    }
  },
);

serverRaidsRouter.put(
  "/:raidId/slots/:slotId",
  async (
    req: Request<
      { serverId: string; raidId: string; slotId: string },
      {},
      { name?: string; role?: string; comment?: string }
    >,
    res: Response,
  ) => {
    const { serverId, raidId, slotId } = req.params;
    const updates = req.body;

    try {
      const slot = await RaidService.updateRaidSlot(slotId, updates);
      res.json(APIResponse.Success({ slot }));
    } catch (error) {
      logger.error("Failed to update raid slot:", error);
      res.status(500).json(APIResponse.Error("Failed to update raid slot"));
    }
  },
);

serverRaidsRouter.delete(
  "/:raidId/slots/:slotId",
  async (req: Request<{ serverId: string; raidId: string; slotId: string }>, res: Response) => {
    const { serverId, raidId, slotId } = req.params;

    try {
      await RaidService.deleteRaidSlot(slotId);
      res.json(APIResponse.Success({ message: "Slot deleted successfully" }));
    } catch (error) {
      logger.error("Failed to delete raid slot:", error);
      res.status(500).json(APIResponse.Error("Failed to delete raid slot"));
    }
  },
);
