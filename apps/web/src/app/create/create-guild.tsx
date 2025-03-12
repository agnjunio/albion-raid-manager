"use client";

import { createGuild } from "@/actions/guilds";
import Alert from "@/components/ui/alert";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { getErrorMessage } from "@/helpers/errors";
import { getServerPictureUrl } from "@albion-raid-manager/common/helpers/discord";
import { Server } from "@albion-raid-manager/discord";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface CreateGuildProps {
  servers: Server[];
  userId: string;
}

export function CreateGuild({ servers, userId }: CreateGuildProps) {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleCreateGuild = async (server: Server) => {
    const response = await createGuild(server, userId);

    if (!response.success) {
      return setError(response.error);
    }

    router.push(`/dashboard/${response.data.guild.id}`);
  };

  return (
    <Card className="w-full min-w-[30vw] max-w-lg max-h-[80vh]">
      <CardHeader>
        <CardTitle>Create guild</CardTitle>
      </CardHeader>

      <CardContent className="overflow-auto">
        <div className="flex flex-col gap-2">
          {error && <Alert>{getErrorMessage(error)}</Alert>}
          {servers.map((server) => (
            <div
              key={server.id}
              className="flex items-center p-4 border border-border/20 rounded-lg shadow-md hover:shadow-lg cursor-pointer hover:bg-accent transition-all duration-200"
              onClick={() => handleCreateGuild(server)}
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
          ))}
        </div>
      </CardContent>

      <CardFooter>Please select a discord server to create a guild.</CardFooter>
    </Card>
  );
}
