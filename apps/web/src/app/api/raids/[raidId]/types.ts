export type RaidParams = {
  guildId: string;
  raidId: string;
};

export type RaidRouteProps = {
  params: Promise<RaidParams>;
};
