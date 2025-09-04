import { createRaid, findRaidById, findRaids, updateRaid } from "@albion-raid-manager/core/services";
import {
  APIErrorType,
  APIResponse,
  CreateGuildRaid,
  GetGuildRaid,
  GetGuildRaids,
  UpdateGuildRaid,
} from "@albion-raid-manager/core/types/api";
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
    const { description, date, location } = req.body;

    const raid = await createRaid({
      title: "Raid", // Default title, can be updated later
      description,
      date: new Date(date),
      serverId: guildId,
      location,
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

    const raids = await findRaids({ serverId: guildId });

    res.json(APIResponse.Success({ raids }));
  },
);

raidsRouter.get(
  "/:raidId",
  async (
    req: Request<GetGuildRaid.Params, {}, GetGuildRaid.Query>,
    res: Response<APIResponse.Type<GetGuildRaid.Response>>,
  ) => {
    const { guildId, raidId } = req.params;
    const { slots } = req.query;

    if (!guildId || !raidId) {
      throw APIResponse.Error(APIErrorType.BAD_REQUEST, "Guild ID and Raid ID are required");
    }

    const raid = await findRaidById(raidId, Boolean(slots));

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

    const raid = await updateRaid(raidId, { status });

    res.json(APIResponse.Success({ raid }));
  },
);
