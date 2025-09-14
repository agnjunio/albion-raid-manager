import { logger } from "@albion-raid-manager/core/logger";
import { DiscordService } from "@albion-raid-manager/core/services";
import { transformUser } from "@albion-raid-manager/core/utils/discord";
import { APIErrorType, APIResponse } from "@albion-raid-manager/types/api";
import { NextFunction, Request, Response } from "express";

export const auth = async (req: Request, res: Response<APIResponse.Type>, next: NextFunction) => {
  // Check if session is empty (not loaded from store)
  if (!req.session || Object.keys(req.session).length === 0) {
    logger.warn("Empty session - session not found in store", {
      sessionId: req.session?.id,
      cookies: req.headers.cookie,
    });
    return res.status(401).json(APIResponse.Error(APIErrorType.SESSION_EXPIRED));
  }

  if (!req.session.accessToken) {
    logger.warn("No access token in session", {
      sessionId: req.session.id,
      sessionData: req.session,
    });
    return res.status(401).json(APIResponse.Error(APIErrorType.NOT_AUTHORIZED));
  }

  if (!req.session.user) {
    const discordUser = await DiscordService.users.getCurrentUser({ type: "user", token: req.session.accessToken });
    if (!discordUser) {
      return res.status(401).json(APIResponse.Error(APIErrorType.AUTHENTICATION_FAILED));
    }

    req.session.user = transformUser(discordUser);
  }

  next();
};
