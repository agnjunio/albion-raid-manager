export interface AlbionUser {
  Id: string;
  Name: string;
  GuildId: string;
  GuildName: string;
  AllianceId: string;
  AllianceName: string;
  Avatar: string;
  AvatarRing: string;
  KillFame: number;
  DeathFame: number;
  FameRatio: number;
  totalKills: number | null;
  gvgKills: number | null;
  gvgWon: number | null;
}

export interface AlbionGuild {
  Id: string;
  Name: string;
  AllianceId: string;
  AllianceName: string;
  KillFame: number;
  DeathFame: number;
  MemberCount: number;
}

export interface AlbionSearchResponse {
  guilds: AlbionGuild[];
  players: AlbionUser[];
}

export interface AlbionPlayerResponse {
  Id: string;
  Name: string;
  GuildId: string;
  GuildName: string;
  AllianceId: string;
  AllianceName: string;
  Avatar: string;
  AvatarRing: string;
  KillFame: number;
  DeathFame: number;
  FameRatio: number;
  totalKills: number | null;
  gvgKills: number | null;
  gvgWon: number | null;
  Equipment: AlbionEquipment;
  Inventory: AlbionItem[];
}

export interface AlbionEquipment {
  MainHand: AlbionItem | null;
  OffHand: AlbionItem | null;
  Head: AlbionItem | null;
  Armor: AlbionItem | null;
  Shoes: AlbionItem | null;
  Bag: AlbionItem | null;
  Cape: AlbionItem | null;
  Mount: AlbionItem | null;
  Potion: AlbionItem | null;
  Food: AlbionItem | null;
}

export interface AlbionItem {
  Type: string;
  Count: number;
  Quality: number;
  ActiveSpells: string[];
  PassiveSpells: string[];
}

export interface AlbionGuildResponse {
  Id: string;
  Name: string;
  AllianceId: string;
  AllianceName: string;
  KillFame: number;
  DeathFame: number;
  MemberCount: number;
  Members: AlbionGuildMember[];
}

export interface AlbionGuildMember {
  Id: string;
  Name: string;
  GuildId: string;
  GuildName: string;
  AllianceId: string;
  AllianceName: string;
  Avatar: string;
  AvatarRing: string;
  KillFame: number;
  DeathFame: number;
  FameRatio: number;
  totalKills: number | null;
  gvgKills: number | null;
  gvgWon: number | null;
  JoinDate: string;
  AllianceJoinDate: string;
}

export interface AlbionKillboardResponse {
  EventId: number;
  TimeStamp: string;
  Killer: AlbionKillboardParticipant;
  Victim: AlbionKillboardParticipant;
  TotalVictimKillFame: number;
  Location: AlbionLocation;
  Participants: AlbionKillboardParticipant[];
  GroupMembers: AlbionKillboardParticipant[];
}

export interface AlbionKillboardParticipant {
  AverageItemPower: number;
  Equipment: AlbionEquipment;
  Inventory: AlbionItem[];
  Name: string;
  Id: string;
  GuildName: string;
  GuildId: string;
  AllianceName: string;
  AllianceId: string;
  KillFame: number;
  DeathFame: number;
  FameRatio: number;
  DamageDone: number;
  SupportHealingDone: number;
}

export interface AlbionLocation {
  Id: number;
  Name: string;
  Type: string;
}

export interface AlbionSearchOptions {
  q: string;
  server?: string;
}

export interface AlbionAPIError {
  message: string;
  status: number;
  url: string;
}
