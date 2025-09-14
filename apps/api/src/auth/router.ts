import { ensureUser } from "@albion-raid-manager/core/database";
import { logger } from "@albion-raid-manager/core/logger";
import { DiscordService } from "@albion-raid-manager/core/services";
import { transformUser } from "@albion-raid-manager/core/utils/discord";
import { APIErrorType, APIResponse, GetMeResponse } from "@albion-raid-manager/types/api";
import { isAxiosError } from "axios";
import { Request, Response, Router } from "express";

import { auth } from "./middleware";
import { discordCallbackSchema } from "./schemas";

export const authRouter: Router = Router();

authRouter.get("/me", auth, async (req: Request, res: Response<APIResponse.Type<GetMeResponse>>) => {
  const get = async () => {
    const discordUser = await DiscordService.users.getCurrentUser({
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
  } catch (error) {
    logger.debug("Initial request failed, attempting token refresh", {
      sessionId: req.session.id,
      hasRefreshToken: !!req.session.refreshToken,
      error: error instanceof Error ? error.message : "Unknown error",
    });

    if (req.session.refreshToken) {
      try {
        const { access_token, refresh_token } = await DiscordService.auth.refreshToken(req.session.refreshToken);
        req.session.accessToken = access_token;
        req.session.refreshToken = refresh_token;
        await get();
      } catch (refreshError) {
        logger.error("Token refresh failed", {
          error: refreshError,
          sessionId: req.session.id,
          hasRefreshToken: !!req.session.refreshToken,
        });
        req.session.destroy(() => {
          res.status(401).json(APIResponse.Error(APIErrorType.SESSION_EXPIRED));
        });
      }
    } else {
      logger.warn("No refresh token available", { sessionId: req.session.id });
      res.status(401).json(APIResponse.Error(APIErrorType.SESSION_EXPIRED));
    }
  }
});

authRouter.post("/callback", async (req: Request, res: Response<APIResponse.Type>) => {
  try {
    const { code, redirectUri } = discordCallbackSchema.parse(req.body);
    const { access_token, refresh_token } = await DiscordService.auth.exchangeCode(code, redirectUri);

    const discordUser = await DiscordService.users.getCurrentUser({
      type: "user",
      token: access_token,
    });

    if (!discordUser) {
      return res.status(401).json(APIResponse.Error(APIErrorType.AUTHENTICATION_FAILED));
    }

    req.session.accessToken = access_token;
    req.session.refreshToken = refresh_token;
    req.session.user = transformUser(discordUser);

    res.sendStatus(200);
  } catch (error) {
    if (isAxiosError(error)) {
      logger.debug("Discord API error response:", error.response?.data);
    }
    logger.error("Failed to authenticate user:", { error });
    res.status(401).json(APIResponse.Error(APIErrorType.AUTHENTICATION_FAILED));
  }
});

authRouter.post("/logout", (req: Request, res: Response<APIResponse.Type>) => {
  req.session.destroy((err: Error | null) => {
    if (err) {
      return res.status(500).json(APIResponse.Error(APIErrorType.INTERNAL_SERVER_ERROR));
    }
    req.session.destroy(() => {
      res.sendStatus(200);
    });
  });
});
