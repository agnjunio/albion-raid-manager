import { z } from "zod";

import { serverSettingsSchema } from "../schemas";

import { Server } from "./servers";

export type ServerSettings = z.infer<typeof serverSettingsSchema>;

export function createServerSettings(server: Server): ServerSettings {
  return {
    name: server.name,
    icon: server.icon || "",
    adminRoles: server.adminRoles || [],
    raidRoles: server.raidRoles || [],
    compositionRoles: server.compositionRoles || [],
    raidAnnouncementChannelId: server.raidAnnouncementChannelId || "",
    serverGuildId: server.serverGuildId || "",
    memberRoleId: server.memberRoleId || "",
    friendRoleId: server.friendRoleId || "",
    auditChannelId: server.auditChannelId || "",
    language: server.language || "en",
  };
}
