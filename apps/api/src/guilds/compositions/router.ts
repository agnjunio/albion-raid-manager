import { APIErrorType, APIResponse } from "@albion-raid-manager/core/types/api";
import { GetGuildCompositions } from "@albion-raid-manager/core/types/api/compositions";
import { prisma } from "@albion-raid-manager/database";
import { Request, Response, Router } from "express";

import { auth } from "@/auth/middleware";

import { compositionPermission } from "./middleware";

export const compositionsRouter: Router = Router({ mergeParams: true });

compositionsRouter.use(auth, compositionPermission);

compositionsRouter.get(
  "/",
  async (req: Request<GetGuildCompositions.Params>, res: Response<APIResponse.Type<GetGuildCompositions.Response>>) => {
    const { guildId } = req.params;

    if (!guildId) {
      return res.status(400).json(APIResponse.Error(APIErrorType.BAD_REQUEST));
    }

    const compositions = await prisma.composition.findMany({
      where: {
        guildId,
      },
    });

    res.json(APIResponse.Success({ compositions }));
  },
);
