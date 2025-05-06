import { guildActions } from "@/actions";
import { getGuildServer } from "@/actions/servers";
import { PageError } from "@/components/ui/page";
import { nextAuthOptions } from "@/lib/auth";
import { translateErrorCode } from "@/lib/errors";
import { GuildPermissionType } from "@/types/database";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { SettingsProvider } from "./context";
import { SettingsLayoutProps } from "./types";

export default async function SettingsLayout({ params, children }: SettingsLayoutProps) {
  const session = await getServerSession(nextAuthOptions);
  if (!session) return redirect("/");
  const { guildId } = await params;

  const hasPermissionResponse = await guildActions.hasPermission(guildId, session.user.id, [GuildPermissionType.ADMIN]);
  if (!hasPermissionResponse.success) {
    return <PageError error={translateErrorCode(hasPermissionResponse.error)} />;
  }

  if (!hasPermissionResponse.data.hasPermission) {
    return <PageError error={"You are not authorized to access this page"} variant="error" />;
  }

  const serverResponse = await getGuildServer(guildId);
  if (!serverResponse.success) {
    return <PageError error={translateErrorCode(serverResponse.error)} />;
  }

  return (
    <SettingsProvider server={serverResponse.data} guild={hasPermissionResponse.data.guild}>
      {children}
    </SettingsProvider>
  );
}
