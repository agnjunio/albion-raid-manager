export type RaidProps = {
  guildId: string;
  raidId: string;
};

export type RaidsPageProps = {
  params: Promise<RaidProps>;
};
