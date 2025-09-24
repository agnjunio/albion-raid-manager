import { DiscordService, ServersService, UsersService } from "@albion-raid-manager/core/services";
import { PermissionsService } from "@albion-raid-manager/core/services/permissions";
import { APIErrorType, APIResponse } from "@albion-raid-manager/types/api";
import { fromDiscordMember } from "@albion-raid-manager/types/entities";
import { NextFunction, Request, Response } from "express";

/**
 * Authentication middleware that validates session and ensures user exists
 */
export const isAuthenticated = async (req: Request, res: Response<APIResponse.Type>, next: NextFunction) => {
  if (!req.session || Object.keys(req.session).length === 0) {
    return res.status(401).json(APIResponse.Error(APIErrorType.SESSION_EXPIRED));
  }

  if (!req.session.accessToken) {
    return res.status(401).json(APIResponse.Error(APIErrorType.NOT_AUTHORIZED));
  }

  if (!req.session.user) {
    const user = await UsersService.ensureUserWithAccessToken(req.session.accessToken);
    if (!user) {
      return res.status(401).json(APIResponse.Error(APIErrorType.AUTHENTICATION_FAILED));
    }

    req.session.user = user;
  }

  next();
};

/**
 * Middleware that validates server membership and sets server context
 */
export const isServerMember = async (req: Request, res: Response, next: NextFunction) => {
  const { serverId } = req.params;
  if (!serverId) {
    return res.status(400).json(APIResponse.Error(APIErrorType.BAD_REQUEST, "Server ID is required"));
  }

  const server = await ServersService.getServerById(serverId);
  if (!server) {
    return res
      .status(404)
      .json(APIResponse.Error(APIErrorType.BOT_NOT_INSTALLED, "Bot is not installed on this server"));
  }

  req.context.server = server;

  if (!req.session?.user?.id) {
    return res.status(401).json(APIResponse.Error(APIErrorType.NOT_AUTHORIZED, "User not authenticated"));
  }

  const userId = req.session.user.id;

  let discordMember;
  try {
    discordMember = await DiscordService.getCurrentUserGuildMember(serverId, {
      type: "user",
      token: req.session.accessToken,
    });
    if (!discordMember) {
      return res
        .status(403)
        .json(APIResponse.Error(APIErrorType.NOT_AUTHORIZED, "You are not a member of this server"));
    }
  } catch {
    return res.status(403).json(APIResponse.Error(APIErrorType.NOT_AUTHORIZED, "You are not a member of this server"));
  }

  const member = await ServersService.ensureServerMember(serverId, userId);
  if (member) {
    req.context.member = fromDiscordMember(discordMember, member);
  }

  next();
};

/**
 * Middleware that validates admin permissions
 */
export const hasAdminPermission = async (req: Request, res: Response, next: NextFunction) => {
  const { server, member } = req.context;

  if (!server) {
    return res.status(404).json(APIResponse.Error(APIErrorType.NOT_FOUND, "Server not found"));
  }

  if (!member?.userId) {
    return res.status(401).json(APIResponse.Error(APIErrorType.NOT_AUTHORIZED, "User not authenticated"));
  }

  const hasAdminPermission = await PermissionsService.hasRole(server.id, member.userId, "admin");
  if (!hasAdminPermission) {
    return res
      .status(403)
      .json(APIResponse.Error(APIErrorType.NOT_AUTHORIZED, "You do not have the admin permission."));
  }

  next();
};

/**
 * Middleware that validates caller permissions
 */
export const hasCallerPermission = async (req: Request, res: Response, next: NextFunction) => {
  const { server, member } = req.context;

  if (!server) {
    return res.status(400).json(APIResponse.Error(APIErrorType.BAD_REQUEST, "Server ID is required"));
  }

  if (!member?.userId) {
    return res.status(401).json(APIResponse.Error(APIErrorType.NOT_AUTHORIZED, "User not authenticated"));
  }

  const hasCallerPermission = await PermissionsService.hasRole(server.id, member.userId, "caller");
  if (!hasCallerPermission) {
    return res
      .status(403)
      .json(APIResponse.Error(APIErrorType.NOT_AUTHORIZED, "You do not have the caller permission."));
  }

  next();
};
