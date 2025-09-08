import { DiscordServer } from "@albion-raid-manager/types/api";
import { faCrown, faShield } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";

interface ServerInfoProps {
  server: DiscordServer;
  onNext: () => void;
}

export function ServerInfo({ server, onNext }: ServerInfoProps) {
  return (
    <CardContent className="space-y-4">
      <div className="flex justify-center text-center">
        <div className="bg-muted/70 hover:bg-muted rounded-lg px-5 py-4">
          <div className="flex select-none items-center gap-4">
            {server.icon && (
              <img
                src={`https://cdn.discordapp.com/icons/${server.id}/${server.icon}.png`}
                alt={`${server.name} icon`}
                className="h-12 w-12 rounded-full"
              />
            )}
            <div className="text-left">
              <p className="text-sm font-medium">{server.name}</p>
              {server.owner && (
                <Badge variant="outline" size="xs">
                  <FontAwesomeIcon icon={faCrown} className="text-primary mr-1 size-3" />
                  Owner
                </Badge>
              )}
              {!server.owner && server.admin && (
                <Badge variant="outline" size="xs">
                  <FontAwesomeIcon icon={faShield} className="text-secondary mr-1 size-3" />
                  Admin
                </Badge>
              )}
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
