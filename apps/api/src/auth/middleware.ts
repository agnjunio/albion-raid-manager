import { APIErrorType, APIResponse } from "@albion-raid-manager/core/types/api";
import { discordService } from "@albion-raid-manager/discord";
import { transformUser } from "@albion-raid-manager/discord/helpers";
import { NextFunction, Request, Response } from "express";

export const auth = async (req: Request, res: Response<APIResponse.Type>, next: NextFunction) => {
  if (!req.session.accessToken) {
    return res.status(401).json(APIResponse.Error(APIErrorType.NOT_AUTHORIZED));
  }

  if (!req.session.user) {
    const discordUser = await discordService.users.getCurrentUser({ type: "user", token: req.session.accessToken });
    if (!discordUser) {
      return res.status(401).json(APIResponse.Error(APIErrorType.AUTHENTICATION_FAILED));
    }

    req.session.user = transformUser(discordUser);
  }

  next();
};
