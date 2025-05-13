import { User } from "@albion-raid-manager/core/types";
import { APIErrorType, APIResponse } from "@albion-raid-manager/core/types/api";
import { prisma } from "@albion-raid-manager/database";
import { discordService, isAxiosError } from "@albion-raid-manager/discord";
import { transformUser } from "@albion-raid-manager/discord/helpers";
import logger from "@albion-raid-manager/logger";
import { Request, Response, Router } from "express";
import { z } from "zod";

const router = Router();

const discordCallbackSchema = z.object({
  code: z.string(),
  redirectUri: z.string(),
});

router.post("/callback", async (req: Request, res: Response<APIResponse.Type>) => {
  try {
    const { code, redirectUri } = discordCallbackSchema.parse(req.body);
    const { access_token, refresh_token } = await discordService.auth.exchangeCode(code, redirectUri);

    const discordUser = await discordService.users.getCurrentUser(`Bearer ${access_token}`);
    if (!discordUser) {
      return res.status(401).json(APIResponse.Error(APIErrorType.AUTHENTICATION_FAILED));
    }

    req.session.accessToken = access_token;
    req.session.refreshToken = refresh_token;
    req.session.user = transformUser(discordUser);

    await req.session.save((err) => {
      if (err) {
        logger.error("Failed to save session:", err);
        return res.status(500).json(APIResponse.Error(APIErrorType.INTERNAL_SERVER_ERROR));
      }
      logger.info("Session saved successfully", {
        cookie: req.session.cookie,
        sessionId: req.session.id,
      });
      res.json(APIResponse.Success());
    });
  } catch (error) {
    if (isAxiosError(error)) {
      console.log(error.response?.data);
    }
    logger.error("Failed to authenticate user:", error);
    res.status(401).json(APIResponse.Error(APIErrorType.AUTHENTICATION_FAILED));
  }
});

router.get("/me", async (req: Request, res: Response<APIResponse.Type<User>>) => {
  if (!req.session.accessToken) {
    return res.status(401).json(APIResponse.Error(APIErrorType.NOT_AUTHORIZED));
  }

  const get = async () => {
    const discordUser = await discordService.users.getCurrentUser(`Bearer ${req.session.accessToken}`);
    const user = await prisma.user.upsert({
      where: {
        id: discordUser.id,
      },
      update: {
        username: discordUser.username,
        nickname: discordUser.global_name,
        avatar: discordUser.avatar ?? undefined,
      },
      create: {
        id: discordUser.id,
        username: discordUser.username,
        nickname: discordUser.global_name,
        avatar: discordUser.avatar ?? undefined,
      },
    });

    res.json(APIResponse.Success(user));
  };

  try {
    await get();
  } catch (error) {
    if (req.session.refreshToken) {
      try {
        const { access_token, refresh_token } = await discordService.auth.refreshToken(req.session.refreshToken);
        req.session.accessToken = access_token;
        req.session.refreshToken = refresh_token;
        req.session.save();
        await get();
      } catch (refreshError) {
        req.session.destroy(() => {
          res.status(401).json(APIResponse.Error(APIErrorType.SESSION_EXPIRED));
        });
      }
    } else {
      res.status(401).json(APIResponse.Error(APIErrorType.SESSION_EXPIRED));
    }
  }
});

router.post("/logout", (req: Request, res: Response<APIResponse.Type>) => {
  req.session.destroy((err: Error | null) => {
    if (err) {
      return res.status(500).json(APIResponse.Error(APIErrorType.INTERNAL_SERVER_ERROR));
    }
    res.clearCookie("connect.sid");
    res.json(APIResponse.Success());
  });
});

export default router;
