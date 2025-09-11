import {
  AlbionAPIError,
  getAlbionGuild,
  getAlbionGuildKillboard,
  getAlbionPlayer,
  getAlbionPlayerKillboard,
  searchAlbionPlayers,
  verifyAlbionPlayer,
} from "./client";
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
