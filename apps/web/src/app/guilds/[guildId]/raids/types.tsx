export type RaidPageProps = {
  params: Promise<{
    guildId: string;
    raidId: string;
  }>;
};

export type RaidLayoutProps = RaidPageProps & {
  children: React.ReactNode;
};
