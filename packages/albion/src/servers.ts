export const SERVERS = {
  AMERICAS: {
    id: "americas",
    name: "Albion Americas",
    liveId: "live_us",
    url: "https://gameinfo.albiononline.com/api/gameinfo",
  },
  ASIA: {
    id: "asia",
    name: "Albion Asia",
    liveId: "live_sgp",
    url: "https://gameinfo-sgp.albiononline.com/api/gameinfo",
  },
  EUROPE: {
    id: "europe",
    name: "Albion Europe",
    liveId: "live_ams",
    url: "https://gameinfo-ams.albiononline.com/api/gameinfo",
  },
} as const;

export type ServerId = keyof typeof SERVERS;
export type Server = (typeof SERVERS)[ServerId];

export function getServer(serverId: ServerId): Server {
  return SERVERS[serverId];
}

export function getServerUrl(serverId: ServerId): string {
  return SERVERS[serverId].url;
}

export function getAllServers(): Server[] {
  return Object.values(SERVERS);
}

export function getServerById(id: string): Server | undefined {
  return Object.values(SERVERS).find((server) => server.id === id);
}

export function getServerByLiveId(liveId: string): Server | undefined {
  return Object.values(SERVERS).find((server) => server.liveId === liveId);
}
