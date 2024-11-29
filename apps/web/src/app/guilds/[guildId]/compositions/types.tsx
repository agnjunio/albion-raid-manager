export type CompositionParams = {
  guildId: string;
  raidId: string;
};

export type CompositionPageProps = {
  params: Promise<CompositionParams>;
};

export type CompositionLayoutProps = CompositionPageProps & {
  children: React.ReactNode;
};
