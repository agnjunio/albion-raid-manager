// Export the main functions
export {
  AlbionAPIError,
  getAlbionGuild,
  getAlbionGuildKillboard,
  getAlbionPlayer,
  getAlbionPlayerKillboard,
  searchAlbionPlayers,
  verifyAlbionPlayer,
} from "./client";

// Export server utilities
export {
  getAllServers,
  getServer,
  getServerById,
  getServerByLiveId,
  getServerUrl,
  SERVERS,
  type Server,
  type ServerId,
} from "./servers";

// Export types
export type {
  AlbionAPIError as AlbionAPIErrorType,
  AlbionEquipment,
  AlbionGuild,
  AlbionGuildMember,
  AlbionGuildResponse,
  AlbionItem,
  AlbionKillboardParticipant,
  AlbionKillboardResponse,
  AlbionLocation,
  AlbionPlayerResponse,
  AlbionSearchOptions,
  AlbionSearchResponse,
  AlbionUser,
} from "./types";
