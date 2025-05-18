import type { Server } from "@albion-raid-manager/discord";

import { getUserGuilds, isAxiosError } from "@albion-raid-manager/discord";
import logger from "@albion-raid-manager/logger";
import { faChevronCircleLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AddServer } from "./add-server";
async;

export function CreateGuildPage() {
  let servers: Server[] = [];
  try {
    servers = (await getUserGuilds(session.accessToken)).filter((server) => server.admin);
  } catch (error) {
    if (isAxiosError(error) && error.status === 401) return redirect("/");
    logger.error(`Failed to fetch user guilds:`, error);
  }

  return (
    <div className="flex min-h-screen flex-col justify-center gap-3 p-4">
      <Link href="/dashboard" className="text-accent flex items-center gap-1 text-sm leading-none">
        <FontAwesomeIcon icon={faChevronCircleLeft} className="size-4" />
        <span className="font-sans">Back to dashboard</span>
      </Link>
      <AddServer servers={servers} userId={session.user.id} />
    </div>
  );
}
