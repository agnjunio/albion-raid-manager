import { APIErrorType, APIResponse } from "@albion-raid-manager/core/types/api";
import { prisma } from "@albion-raid-manager/database";
import { NextFunction, Request, Response } from "express";

export const compositionPermission = async (req: Request, res: Response, next: NextFunction) => {
  const { guildId } = req.params;

  if (!guildId) {
    return res.status(400).json(APIResponse.Error(APIErrorType.BAD_REQUEST));
  }

  const guild = await prisma.guild.findUnique({
    where: {
      id: guildId,
    },
    include: {
      members: {
        where: {
          userId: req.session.user?.id,
        },
      },
    },
  });

  if (!guild) {
    return res.status(404).json(APIResponse.Error(APIErrorType.NOT_FOUND));
  }

  const member = guild.members[0];
  if (!member) {
    return res.status(403).json(APIResponse.Error(APIErrorType.NOT_AUTHORIZED, "You are not a member of this guild"));
  }

  if (!member.compositionPermission && !member.adminPermission) {
    return res
      .status(403)
      .json(APIResponse.Error(APIErrorType.NOT_AUTHORIZED, "You are not authorized to manage compositions"));
  }

  req.context.guild = guild;
  req.context.member = member;

  next();
};
