export type GuildPageProps = {
  params: Promise<{
    guildId: string;
  }>;
};

export type GuildLayoutProps = GuildPageProps & {
  children: React.ReactNode;
};
