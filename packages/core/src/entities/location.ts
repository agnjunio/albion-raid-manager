export interface LocationInfo {
  key: string;
  name: string;
  type: LocationType;
  region?: string;
  alias?: string;
}

export type LocationType =
  | "CITY"
  | "PORTAL"
  | "ZONE"
  | "HIDEOUT"
  | "TERRITORY"
  | "OUTPOST"
  | "CASTLE"
  | "DUNGEON"
  | "OTHER";

const LOCATION_MAPPING: LocationInfo[] = [
  // Cities
  { key: "MARTLOCK_CITY", name: "Martlock", type: "CITY" },
  { key: "BRIDGEWATCH_CITY", name: "Bridgewatch", type: "CITY" },
  { key: "CAERLEON_CITY", name: "Caerleon", type: "CITY" },
  { key: "LYMHURST_CITY", name: "Lymhurst", type: "CITY" },
  { key: "FORT_STERLING_CITY", name: "Fort Sterling", type: "CITY" },
  { key: "THETFORD_CITY", name: "Thetford", type: "CITY" },
  { key: "BRECILIEN_CITY", name: "Brecilien", type: "CITY" },

  // Portals
  { key: "MARTLOCK_PORTAL", name: "Martlock Portal", type: "PORTAL" },
  { key: "BRIDGEWATCH_PORTAL", name: "Bridgewatch Portal", type: "PORTAL" },
  { key: "CAERLEON_PORTAL", name: "Caerleon Portal", type: "PORTAL" },
  { key: "LYMHURST_PORTAL", name: "Lymhurst Portal", type: "PORTAL" },
  { key: "FORT_STERLING_PORTAL", name: "Fort Sterling Portal", type: "PORTAL" },
  { key: "THETFORD_PORTAL", name: "Thetford Portal", type: "PORTAL" },
  { key: "BRECILIEN_PORTAL", name: "Brecilien Portal", type: "PORTAL" },

  // Hideouts
  { key: "HIDEOUT", name: "Hideout", type: "HIDEOUT" },

  // Territories
  { key: "TERRITORY", name: "Territory", type: "TERRITORY" },

  // Outposts
  { key: "OUTPOST", name: "Outpost", type: "OUTPOST" },

  // Castles
  { key: "CASTLE", name: "Castle", type: "CASTLE" },
];

const LOCATION_ALIASES: Record<string, string> = {
  // City aliases
  martlock: "MARTLOCK_CITY",
  bridgewatch: "BRIDGEWATCH_CITY",
  caerleon: "CAERLEON_CITY",
  lymhurst: "LYMHURST_CITY",
  fortsterling: "FORT_STERLING_CITY",
  "fort sterling": "FORT_STERLING_CITY",
  thetford: "THETFORD_CITY",
  brecilien: "BRECILIEN_CITY",

  // Portal aliases
  "martlock portal": "MARTLOCK_PORTAL",
  "bridgewatch portal": "BRIDGEWATCH_PORTAL",
  "caerleon portal": "CAERLEON_PORTAL",
  "lymhurst portal": "LYMHURST_PORTAL",
  "fort sterling portal": "FORT_STERLING_PORTAL",
  "thetford portal": "THETFORD_PORTAL",
  "brecilien portal": "BRECILIEN_PORTAL",

  // Hideout aliases
  hideout: "HIDEOUT",
  hideouts: "HIDEOUT",
  ho: "HIDEOUT",
};

export function getLocation(input: string): LocationInfo {
  const locationInfo = LOCATION_MAPPING.find((loc) => loc.key === input);
  if (locationInfo) {
    return locationInfo;
  }

  const alias = input.trim().toLowerCase();
  const locationKey = LOCATION_ALIASES[alias];
  if (locationKey) {
    const locationInfo = LOCATION_MAPPING.find((loc) => loc.key === locationKey);
    if (locationInfo) {
      return {
        ...locationInfo,
        alias,
      };
    }
  }

  return {
    key: "UNKNOWN",
    name: input,
    type: "ZONE",
    alias,
  };
}
