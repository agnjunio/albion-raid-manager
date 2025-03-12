"use client";

import { createGuild } from "@/actions/guilds";
import { getServerPictureUrl } from "@albion-raid-manager/common/helpers/discord";
import type { Server } from "@albion-raid-manager/discord";
import Image from "next/image";

interface ServerCardProps {
  server: Server;
}

export function ServerSelect({ server }: ServerCardProps) {
  const handleClick = async () => {
    const guild = await createGuild(server);
    console.log(guild);
  };

  return (
    <div
      className="flex items-center p-4 border border-border/20 rounded-lg shadow-md hover:shadow-lg cursor-pointer hover:bg-accent transition-all duration-200"
      onClick={handleClick}
    >
      <Image
        src={server.icon ? getServerPictureUrl(server.id, server.icon) : "/default-server-icon.png"}
        alt={`${server.name} icon`}
        width={50}
        height={50}
        className="rounded-full"
      />
      <div className="ml-4 flex-grow">
        <h3 className="text-lg font-semibold whitespace-nowrap truncate">{server.name}</h3>
      </div>
    </div>
  );
}
