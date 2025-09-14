import { DiscordService } from "@albion-raid-manager/core/services";
import { transformUser } from "@albion-raid-manager/core/utils/discord";
import { APIErrorType, APIResponse } from "@albion-raid-manager/types/api";
import { NextFunction, Request, Response } from "express";

export const auth = async (req: Request, res: Response<APIResponse.Type>, next: NextFunction) => {
  if (!req.session || Object.keys(req.session).length === 0) {
    return res.status(401).json(APIResponse.Error(APIErrorType.SESSION_EXPIRED));
  }

  if (!req.session.accessToken) {
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
