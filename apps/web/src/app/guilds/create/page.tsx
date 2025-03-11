import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchServers } from "@/lib/discord";
import { nextAuthOptions } from "@/lib/next-auth";
import { Server } from "@/types/discord";
import { hasPermissions, PERMISSIONS, transformGuild } from "@albion-raid-manager/common/helpers/discord";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import ServerSelect from "./server-select";

export default async function Page() {
  const session = await getServerSession(nextAuthOptions);
  if (!session?.accessToken) return redirect("/");

  const servers: Server[] = (await fetchServers(session.accessToken))
    .filter((server: any) => hasPermissions(server.permissions, [PERMISSIONS.ADMINISTRATOR]))
    .map(transformGuild);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <Card className="w-full min-w-[30vw] max-w-lg max-h-[80vh]">
        <CardHeader>
          <CardTitle>Create guild</CardTitle>
        </CardHeader>

        <CardContent className="overflow-auto">
          <div className="flex flex-col gap-2">
            {servers.map((server) => (
              <ServerSelect key={server.id} server={server} />
            ))}
          </div>
        </CardContent>

        <CardFooter>Please select a discord server to create a guild.</CardFooter>
      </Card>
    </div>
  );
}
