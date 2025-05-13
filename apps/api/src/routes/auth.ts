import { APIErrorType } from "@/types/error";
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

router.post("/callback", async (req: Request, res: Response) => {
  try {
    const { code, redirectUri } = discordCallbackSchema.parse(req.body);
    const { access_token, refresh_token } = await discordService.auth.exchangeCode(code, redirectUri);

    const discordUser = await discordService.users.getCurrentUser(`Bearer ${access_token}`);
    if (!discordUser) {
      return res.status(401).json({ error: APIErrorType.AUTHENTICATION_FAILED });
    }

    req.session.accessToken = access_token;
    req.session.refreshToken = refresh_token;
    req.session.user = transformUser(discordUser);

    await req.session.save((err) => {
      if (err) {
        logger.error("Failed to save session:", err);
        return res.status(500).json({ error: APIErrorType.INTERNAL_SERVER_ERROR });
      }
      logger.info("Session saved successfully", {
        cookie: req.session.cookie,
        sessionId: req.session.id,
      });
      res.json({ success: true });
    });
  } catch (error) {
    if (isAxiosError(error)) {
      console.log(error.response?.data);
    }
    logger.error("Failed to authenticate user:", error);
    res.status(401).json({ error: APIErrorType.AUTHENTICATION_FAILED });
  }
});

router.get("/me", async (req: Request, res: Response) => {
  if (!req.session.accessToken) {
    return res.status(401).json({ error: APIErrorType.NOT_AUTHORIZED });
  }

  const get = async () => {
    const discordUser = await discordService.users.getCurrentUser(`Bearer ${req.session.accessToken}`);
    const user = await prisma.user.upsert({
      where: {
        id: discordUser.id,
      },
      update: {
        username: discordUser.username,
        avatar: discordUser.avatar ?? undefined,
      },
      create: {
        id: discordUser.id,
        username: discordUser.username,
        avatar: discordUser.avatar ?? undefined,
      },
    });

    res.json(user);
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
          res.status(401).json({ error: "Session expired" });
        });
      }
    } else {
      res.status(401).json({ error: "Session expired" });
    }
  }
});

router.post("/logout", (req: Request, res: Response) => {
  req.session.destroy((err: Error | null) => {
    if (err) {
      return res.status(500).json({ error: "Failed to logout" });
    }
    res.clearCookie("connect.sid");
    res.json({ success: true });
  });
});

export default router;
