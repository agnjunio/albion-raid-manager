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
    const user = await UsersService.ensureUserWithAccessToken(req.session.accessToken, {
      cache: req.context.cache,
    });
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
  if (req.context.server) {
    next();
    return;
  }

  const { serverId } = req.params;
  if (!serverId) {
    return res.status(400).json(APIResponse.Error(APIErrorType.BAD_REQUEST, "Server ID is required"));
  }

  const server = await ServersService.getServerById(serverId, {
    cache: req.context.cache,
  });
  if (!server) {
    return res
      .status(404)
      .json(APIResponse.Error(APIErrorType.BOT_NOT_INSTALLED, "Bot is not installed on this server"));
  }

  if (!req.session?.user?.id || !req.session.accessToken) {
    return res.status(401).json(APIResponse.Error(APIErrorType.NOT_AUTHORIZED, "User not authenticated"));
  }

  const userId = req.session.user.id;
  const [hasAdminPermission, hasCallerPermission] = await Promise.all([
    PermissionsService.hasRole(serverId, userId, "admin", {
      cache: req.context.cache,
    }),
    PermissionsService.hasRole(serverId, userId, "caller", {
      cache: req.context.cache,
    }),
  ]);

  req.context.server = {
    ...server,
    admin: hasAdminPermission,
    caller: hasCallerPermission,
  };

  if (req.context.member) {
    next();
    return;
  }

  let discordMember;
  try {
    discordMember = await DiscordService.getCurrentUserGuildMember(serverId, {
      type: "user",
      token: req.session.accessToken,
    });
    if (!discordMember) {
      return res
        .status(403)
        .json(APIResponse.Error(APIErrorType.NOT_SERVER_MEMBER, "You are not a member of this server"));
    }
  } catch {
    return res
      .status(403)
      .json(APIResponse.Error(APIErrorType.NOT_SERVER_MEMBER, "You are not a member of this server"));
  }

  const member = await ServersService.ensureServerMember(serverId, userId, undefined, {
    cache: req.context.cache,
  });
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

  const hasAdminPermission = await PermissionsService.hasRole(server.id, member.userId, "admin", {
    cache: req.context.cache,
  });
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

  const hasCallerPermission = await PermissionsService.hasRole(server.id, member.userId, "caller", {
    cache: req.context.cache,
  });
  if (!hasCallerPermission) {
    return res
      .status(403)
      .json(APIResponse.Error(APIErrorType.NOT_AUTHORIZED, "You do not have the caller permission."));
  }

  next();
};
