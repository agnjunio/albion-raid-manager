import { RaidService } from "@albion-raid-manager/core/services";
import {
  APIErrorType,
  APIResponse,
  CreateRaid,
  GetRaid,
  GetRaids,
  UpdateGuildRaid,
} from "@albion-raid-manager/core/types/api";
import { Request, Response, Router } from "express";

import { validateRequest } from "@/request";

import { raidPermission } from "./middleware";
import { createGuildRaidSchema } from "./schemas";

export const serverRaidsRouter: Router = Router({ mergeParams: true });

serverRaidsRouter.use(raidPermission);

serverRaidsRouter.post(
  "/",
  validateRequest({ body: createGuildRaidSchema }),
  async (
    req: Request<CreateRaid.Params, {}, CreateRaid.Body>,
    res: Response<APIResponse.Type<CreateRaid.Response>>,
  ) => {
    const { serverId } = req.params;
    const { title, contentType, date, location, description } = req.body;

    const raid = await RaidService.createRaid({
      serverId,
      title,
      contentType,
      date: new Date(date),
      location,
      description,
    });

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

    const raid = await RaidService.updateRaid(raidId, { status });

    res.json(APIResponse.Success({ raid }));
  },
);
