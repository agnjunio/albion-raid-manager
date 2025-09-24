import { z } from "zod";

import { serverSettingsSchema } from "../schemas";

import { Server } from "./servers";

export type ServerSettings = z.infer<typeof serverSettingsSchema>;

export function createServerSettings(server: Server): ServerSettings {
  return {
    name: server.name,
    icon: server.icon || "",
    auditChannelId: server.auditChannelId || "",
    adminRoles: server.adminRoles || [],
    callerRoles: server.callerRoles || [],
    raidAnnouncementChannelId: server.raidAnnouncementChannelId || "",
    serverGuildId: server.serverGuildId || "",
    memberRoleId: server.memberRoleId || "",
    friendRoleId: server.friendRoleId || "",
    language: server.language || "en",
  };
}
