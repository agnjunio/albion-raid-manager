import { exchangeCode, refreshToken } from "./service/auth";
import { sendMessage } from "./service/messages";
import {
  addServerMemberRole,
  getServer,
  getServerChannels,
  getServerMember,
  getServerMembers,
  getServers,
  removeServerMemberRole,
} from "./service/servers";
import { getCurrentUser, getUser } from "./service/users";

export const DiscordService = {
  auth: {
    exchangeCode,
    refreshToken,
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
