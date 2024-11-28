export type RaidParams = {
  guildId: string;
  raidId: string;
};

export type RaidPageProps = {
  params: Promise<RaidParams>;
};

export type RaidLayoutProps = RaidPageProps & {
  children: React.ReactNode;
};
