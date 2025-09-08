import { DiscordServer } from "@albion-raid-manager/types/api";

import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";

interface ServerInfoProps {
  server: DiscordServer;
  onNext: () => void;
}

export function ServerInfo({ server, onNext }: ServerInfoProps) {
  return (
    <CardContent className="space-y-4">
      <div className="text-center">
        <div className="bg-muted mb-4 rounded-lg p-4">
          <div className="flex items-center gap-3">
            {server.icon && (
              <img
                src={`https://cdn.discordapp.com/icons/${server.id}/${server.icon}.png`}
                alt={`${server.name} icon`}
                className="h-12 w-12 rounded-full"
              />
            )}
            <div className="text-left">
              <p className="text-sm font-medium">{server.name}</p>
            </div>
          </div>
        </div>
      </div>
      <p className="text-muted-foreground text-center text-xs">
        This server will be added to your account once you complete the setup process.
      </p>
      <Button onClick={onNext} className="w-full">
        Continue to Discord Invitation
      </Button>
    </CardContent>
  );
}
