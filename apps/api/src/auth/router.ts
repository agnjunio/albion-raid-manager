import { APIErrorType, APIResponse } from "@albion-raid-manager/core/types/api";
import { GetMeResponse } from "@albion-raid-manager/core/types/api/auth";
import { ensureUser } from "@albion-raid-manager/database";
import { discordService, isAxiosError } from "@albion-raid-manager/discord";
import { transformUser } from "@albion-raid-manager/discord/helpers";
import { logger } from "@albion-raid-manager/logger";
import { Request, Response, Router } from "express";

import { auth } from "./middleware";
import { discordCallbackSchema } from "./schemas";

export const authRouter: Router = Router();

authRouter.get("/me", auth, async (req: Request, res: Response<APIResponse.Type<GetMeResponse>>) => {
  const get = async () => {
    const discordUser = await discordService.users.getCurrentUser({
      type: "user",
      token: req.session.accessToken,
    });
    const user = await ensureUser({
      id: discordUser.id,
      username: discordUser.username,
      nickname: discordUser.global_name ?? null,
      avatar: discordUser.avatar ?? null,
    });

    res.json(APIResponse.Success({ user }));
  };

  try {
    await get();
  } catch {
    if (req.session.refreshToken) {
      try {
        const { access_token, refresh_token } = await discordService.auth.refreshToken(req.session.refreshToken);
        req.session.accessToken = access_token;
        req.session.refreshToken = refresh_token;
        req.session.save();
        await get();
      } catch {
        req.session.destroy(() => {
          res.status(401).json(APIResponse.Error(APIErrorType.SESSION_EXPIRED));
        });
      }
    } else {
      res.status(401).json(APIResponse.Error(APIErrorType.SESSION_EXPIRED));
    }
  }
});

authRouter.post("/callback", async (req: Request, res: Response<APIResponse.Type>) => {
  try {
    const { code, redirectUri } = discordCallbackSchema.parse(req.body);
    const { access_token, refresh_token } = await discordService.auth.exchangeCode(code, redirectUri);

    const discordUser = await discordService.users.getCurrentUser({
      type: "user",
      token: access_token,
    });
    if (!discordUser) {
      return res.status(401).json(APIResponse.Error(APIErrorType.AUTHENTICATION_FAILED));
    }

    req.session.accessToken = access_token;
    req.session.refreshToken = refresh_token;
    req.session.user = transformUser(discordUser);

    req.session.save((err) => {
      if (err) {
        logger.error("Failed to save session:", err);
        return res.status(500).json(APIResponse.Error(APIErrorType.INTERNAL_SERVER_ERROR));
      }
      logger.info("Session saved successfully", {
        cookie: req.session.cookie,
        sessionId: req.session.id,
      });
      res.sendStatus(200);
    });
  } catch (error) {
    if (isAxiosError(error)) {
      logger.debug("Discord API error response:", error.response?.data);
    }
    logger.error("Failed to authenticate user:", error);
    res.status(401).json(APIResponse.Error(APIErrorType.AUTHENTICATION_FAILED));
  }
});

authRouter.post("/logout", (req: Request, res: Response<APIResponse.Type>) => {
  req.session.destroy((err: Error | null) => {
    if (err) {
      return res.status(500).json(APIResponse.Error(APIErrorType.INTERNAL_SERVER_ERROR));
    }
    res.clearCookie("connect.sid");
    res.sendStatus(200);
  });
});
