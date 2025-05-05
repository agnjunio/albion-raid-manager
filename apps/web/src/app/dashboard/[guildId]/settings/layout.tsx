import { getGuildServer } from "@/actions/servers";
import { SettingsProvider } from "./context";
import { SettingsLayoutProps } from "./types";

export default async function SettingsLayout({ params, children }: SettingsLayoutProps) {
  const { guildId } = await params;
  const serverResponse = await getGuildServer(guildId);

  if (!serverResponse.success) {
    return <div>Failed to get server</div>;
  }

  return <SettingsProvider server={serverResponse.data}>{children}</SettingsProvider>;
}
