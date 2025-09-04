import { DiscordServer } from "@albion-raid-manager/core/types/api/servers";

import { CardContent } from "@/components/ui/card";
import Loading from "@/components/ui/loading";

interface ServerVerificationProps {
  server: DiscordServer;
  isVerifying: boolean;
}

export function ServerVerification({ server, isVerifying }: ServerVerificationProps) {
  return (
    <CardContent>
      <Loading label={`Verifying server ${server.name}...`} />
      {isVerifying && (
        <div className="mt-4 text-center">
          <p className="text-muted-foreground text-sm">Please wait while we verify your server setup...</p>
        </div>
      )}
    </CardContent>
  );
}
