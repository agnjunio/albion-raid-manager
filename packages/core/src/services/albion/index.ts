import {
  AlbionAPIError,
  getAlbionGuild,
  getAlbionGuildKillboard,
  getAlbionPlayer,
  getAlbionPlayerKillboard,
  searchAlbionPlayers,
  verifyAlbionPlayer,
} from "./client";
import { getAlbionItemImageUrl, getItemIdAndEnchantment } from "./items";
import { getAllServers, getServer, getServerById, getServerByLiveId, getServerUrl, SERVERS } from "./servers";

export const AlbionService = {
  players: {
    searchAlbionPlayers,
    getAlbionPlayer,
    verifyAlbionPlayer,
  },
  guilds: {
    getAlbionGuild,
  },
  items: {
    getItemIdAndEnchantment,
    getAlbionItemImageUrl,
  },
  killboard: {
    getAlbionPlayerKillboard,
    getAlbionGuildKillboard,
  },
  servers: {
    getAllServers,
    getServer,
    getServerById,
    getServerByLiveId,
    getServerUrl,
    SERVERS,
  },
  errors: {
    AlbionAPIError,
  },
};
