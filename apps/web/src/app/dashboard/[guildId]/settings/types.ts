import { PropsWithChildren } from "react";

export type SettingsPageProps = {
  params: {
    guildId: string;
  };
};

export type SettingsLayoutProps = SettingsPageProps & PropsWithChildren;
