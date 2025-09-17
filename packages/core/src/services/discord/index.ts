import { exchangeCode, refreshToken } from "./auth";
import { getApplicationEmojis } from "./emojis";
import { sendMessage } from "./messages";
import {
  addServerMemberRole,
  getServer,
  getServerChannels,
  getServerMember,
  getServerMembers,
  getServers,
  removeServerMemberRole,
} from "./servers";
import { getCurrentUser, getUser } from "./users";

export const DiscordService = {
  auth: {
    exchangeCode,
    refreshToken,
  },
  emojis: {
    getApplicationEmojis,
  },
  messages: {
    sendMessage,
  },
  users: {
    getCurrentUser,
    getUser,
  },
  servers: {
    getServers,
    getServer,
    getServerChannels,
    getServerMembers,
    getServerMember,
    addServerMemberRole,
    removeServerMemberRole,
  },
};

export * from "./types";
