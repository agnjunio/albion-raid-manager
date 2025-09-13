import { logger } from "@albion-raid-manager/core/logger";
import { RaidService } from "@albion-raid-manager/core/services";
import { RaidSlot } from "@albion-raid-manager/types";
import {
  APIErrorType,
  APIResponse,
  CreateRaid,
  CreateRaidSlot,
  DeleteRaidSlot,
  GetRaid,
  GetRaids,
  ImportRaidConfiguration,
  UpdateRaid,
  UpdateRaidSlot,
} from "@albion-raid-manager/types/api";
import { createRaidBodySchema, raidConfigurationSchema, raidSlotSchema } from "@albion-raid-manager/types/schemas";
import { UpdateRaidInput, UpdateRaidSlotInput } from "@albion-raid-manager/types/services";
import { Request, Response, Router } from "express";

import { validateRequest } from "@/request";

import { raidPermission } from "./middleware";
import { getRaidEventPublisher } from "./redis";

export const serverRaidsRouter: Router = Router({ mergeParams: true });

serverRaidsRouter.use(raidPermission);

serverRaidsRouter.post(
  "/",
  validateRequest({ body: createRaidBodySchema }),
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
  async (req: Request<GetRaids.Params, {}, GetRaids.Query>, res: Response<APIResponse.Type<GetRaids.Response>>) => {
    const { serverId } = req.params;
    const filters = req.query.filters ? JSON.parse(req.query.filters as string) : undefined;

    if (!serverId) {
      throw APIResponse.Error(APIErrorType.BAD_REQUEST, "Server ID is required");
    }

    const raids = await RaidService.findRaidsByServer(serverId, filters);

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

    const updates = req.body as UpdateRaidInput;
    const raid = await RaidService.updateRaid(raidId, updates, { publisher: await getRaidEventPublisher() });

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
  validateRequest({ body: raidSlotSchema }),
  async (
    req: Request<CreateRaidSlot.Params, {}, CreateRaidSlot.Body>,
    res: Response<APIResponse.Type<CreateRaidSlot.Response>>,
  ) => {
    const { raidId } = req.params;
    const { name, role, comment, order, userId, weapon } = req.body;

    try {
      const raid = await RaidService.createRaidSlot(
        {
          raidId,
          name,
          role,
          comment: comment || undefined,
          order,
          userId: userId || undefined,
          weapon: weapon ?? undefined,
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
    req: Request<UpdateRaidSlot.Params, {}, RaidSlot>,
    res: Response<APIResponse.Type<UpdateRaidSlot.Response>>,
  ) => {
    const { slotId } = req.params;
    const updates = req.body as UpdateRaidSlotInput;

    try {
      const raidSlot = await RaidService.updateRaidSlot(slotId, updates, { publisher: await getRaidEventPublisher() });
      res.json(APIResponse.Success({ raidSlot }));
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

serverRaidsRouter.post(
  "/:raidId/import",
  validateRequest({ body: raidConfigurationSchema }),
  async (
    req: Request<ImportRaidConfiguration.Params, {}, ImportRaidConfiguration.Body>,
    res: Response<APIResponse.Type<ImportRaidConfiguration.Response>>,
  ) => {
    const { serverId, raidId } = req.params;
    const configuration = req.body;

    if (!serverId || !raidId) {
      throw APIResponse.Error(APIErrorType.BAD_REQUEST, "Server ID and Raid ID are required");
    }

    try {
      const raid = await RaidService.importRaidConfiguration(raidId, configuration, {
        publisher: await getRaidEventPublisher(),
      });

      res.json(APIResponse.Success({ raid }));
    } catch (error) {
      logger.error("Failed to import raid configuration:", error);

      if (error instanceof Error) {
        if (error.message.includes("not found")) {
          res.status(404).json(APIResponse.Error(APIErrorType.NOT_FOUND, error.message));
        } else if (error.message.includes("Content type mismatch") || error.message.includes("Cannot import")) {
          res.status(400).json(APIResponse.Error(APIErrorType.BAD_REQUEST, error.message));
        } else {
          res
            .status(500)
            .json(APIResponse.Error(APIErrorType.INTERNAL_SERVER_ERROR, "Failed to import raid configuration"));
        }
      } else {
        res
          .status(500)
          .json(APIResponse.Error(APIErrorType.INTERNAL_SERVER_ERROR, "Failed to import raid configuration"));
      }
    }
  },
);
