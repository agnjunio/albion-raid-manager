import { ServersService } from "@albion-raid-manager/core/services/servers";
import { APIErrorType, APIResponse } from "@albion-raid-manager/types/api";
import { NextFunction, Request, Response } from "express";

export const raidPermission = async (req: Request, res: Response, next: NextFunction) => {
  const { serverId } = req.params;

  if (!serverId) {
    return res.status(400).json(APIResponse.Error(APIErrorType.BAD_REQUEST, "Server ID is required"));
  }

  if (!req.session.user?.id) {
    return res.status(401).json(APIResponse.Error(APIErrorType.NOT_AUTHORIZED, "User not authenticated"));
  }

  const server = await ServersService.getServerWithMember(serverId, req.session.user.id);
  if (!server) {
    return res.status(404).json(APIResponse.Error(APIErrorType.NOT_FOUND, "Server not found"));
  }

  const member = server.members[0];
  if (!member) {
    return res.status(403).json(APIResponse.Error(APIErrorType.NOT_AUTHORIZED, "You are not a member of this server"));
  }

  req.context.server = server;
  req.context.member = member;

  next();
};
