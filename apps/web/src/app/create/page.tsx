import { nextAuthOptions } from "@/lib/auth";
import { hasPermissions, PERMISSIONS, transformGuild } from "@albion-raid-manager/common/helpers/discord";
import type { Server } from "@albion-raid-manager/discord";
import { getUserGuilds } from "@albion-raid-manager/discord";
import { faChevronCircleLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CreateGuild } from "./create-guild";

export default async function Page() {
  const session = await getServerSession(nextAuthOptions);
  if (!session?.accessToken) return redirect("/");

  const servers: Server[] = (await getUserGuilds(session.accessToken))
    .filter((server) => hasPermissions(server.permissions, [PERMISSIONS.ADMINISTRATOR]))
    .map(transformGuild);

  return (
    <div className="flex min-h-screen flex-col justify-center gap-3 p-4">
      <Link href="/dashboard" className="text-accent flex items-center gap-1 text-sm leading-none">
        <FontAwesomeIcon icon={faChevronCircleLeft} className="size-4" />
        <span className="font-sans">Back to dashboard</span>
      </Link>
      <CreateGuild servers={servers} userId={session.user.id} />
    </div>
  );
}
