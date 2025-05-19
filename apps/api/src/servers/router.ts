import { APIErrorType, APIResponse } from "@albion-raid-manager/core/types/api";
import { GetServersResponse } from "@albion-raid-manager/core/types/api/servers";
import { discordService, isAxiosError } from "@albion-raid-manager/discord";
import { logger } from "@albion-raid-manager/logger";
import { Request, Response, Router } from "express";

import { requireAuth } from "@/auth/middleware";

export const serverRouter: Router = Router();

serverRouter.use(requireAuth);

serverRouter.get("/", async (req: Request, res: Response<APIResponse.Type<GetServersResponse>>) => {
  try {
    const servers = await discordService.guilds.getUserGuilds(req.session.accessToken ?? "");
    res.json(APIResponse.Success({ servers }));
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 401) {
      res.status(401).json(APIResponse.Error(APIErrorType.NOT_AUTHORIZED));
    } else {
      logger.warn("Failed to get servers", error);
      res.status(500).json(APIResponse.Error(APIErrorType.INTERNAL_SERVER_ERROR));
    }
  }
});
