import { APIGuild } from "discord-api-types/v10";

import { Server as DBServer } from "@albion-raid-manager/types";

import { hasPermissions, PERMISSIONS } from "../discord";

import { Channel } from "./server-channels";
import { Role } from "./server-roles";

export type Server = DBServer & {
  owner?: boolean;
  admin?: boolean;
  bot?: boolean;
  channels?: Channel[];
  roles?: Role[];
};

export function fromDiscordGuild(guild: APIGuild): Server {
  const server: Server = {
    id: guild.id,
    name: guild.name,
    icon: guild.icon || null,
    owner: guild.owner,
    admin: false,
    active: true,
    adminRoles: [],
    raidRoles: [],
    compositionRoles: [],
  };

  if (guild.permissions) {
    server.admin = hasPermissions(guild.permissions, [PERMISSIONS.ADMINISTRATOR]);
  }

  return server;
}
