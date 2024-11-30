export type CompositionParams = {
  guildId: string;
  compositionId: string;
};

export type CompositionRouteProps = {
  params: Promise<CompositionParams>;
};
