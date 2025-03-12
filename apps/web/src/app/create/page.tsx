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
    .filter((server: any) => hasPermissions(server.permissions, [PERMISSIONS.ADMINISTRATOR]))
    .map(transformGuild);

  return (
    <div className="flex flex-col justify-center min-h-screen p-4 gap-3">
      <Link href="/dashboard" className="text-accent flex gap-1 items-center text-sm leading-none">
        <FontAwesomeIcon icon={faChevronCircleLeft} className="size-4" />
        <span className="font-sans">Back to dashboard</span>
      </Link>
      <CreateGuild servers={servers} userId={session.user.id} />
    </div>
  );
}
