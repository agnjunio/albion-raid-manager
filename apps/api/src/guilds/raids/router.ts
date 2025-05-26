import { APIErrorType, APIResponse } from "@albion-raid-manager/core/types/api";
import { GetGuildRaids } from "@albion-raid-manager/core/types/api/guilds";
import { prisma } from "@albion-raid-manager/database";
import { Request, Response, Router } from "express";

import { auth } from "@/auth/middleware";

import { raidPermission } from "./middleware";

export const raidsRouter: Router = Router({ mergeParams: true });

raidsRouter.use(auth, raidPermission);

raidsRouter.get(
  "/",
  async (req: Request<GetGuildRaids.Params>, res: Response<APIResponse.Type<GetGuildRaids.Response>>) => {
    const { guildId } = req.params;

    if (!guildId) {
      return res.status(400).json(APIResponse.Error(APIErrorType.BAD_REQUEST));
    }

    const raids = await prisma.raid.findMany({
      where: {
        guildId,
      },
    });

    res.json(APIResponse.Success({ raids }));
  },
);
