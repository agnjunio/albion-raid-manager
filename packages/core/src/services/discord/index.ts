import { exchangeCode, refreshToken } from "./auth";
import { getApplicationEmojis } from "./emojis";
import {
  addGuildMemberRole,
  getGuild,
  getGuildChannels,
  getGuildMember,
  getGuildMembers,
  getGuildRoles,
  getGuilds,
  hasAdministratorPermission,
  leaveGuild,
  removeGuildMemberRole,
} from "./guilds";
import { sendMessage } from "./messages";
import { getCurrentUser, getCurrentUserGuildMember, getUser } from "./users";

export const DiscordService = {
  // Auth functions
  exchangeCode,
  refreshToken,

  // Emoji functions
  getApplicationEmojis,

  // Message functions
  sendMessage,

  // User functions
  getCurrentUser,
  getCurrentUserGuildMember,

  getUser,

  // Guild functions (renamed from servers)
  getGuilds,
  getGuild,
  getGuildChannels,
  getGuildMembers,
  getGuildMember,
  getGuildRoles,
  hasAdministratorPermission,
  addGuildMemberRole,
  removeGuildMemberRole,
  leaveGuild,
};

export * from "./types";
