import { getServerPictureUrl } from "@albion-raid-manager/discord/helpers";
import { faCrown, faShield, faUsers } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Loading from "@/components/ui/loading";
import { PageError } from "@/components/ui/page";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useGetServersQuery } from "@/store/servers";

export function ServerList() {
  const { data, isLoading, isError } = useGetServersQuery();

  if (isLoading) {
    return (
      <Card className="w-full max-w-6xl space-y-6">
        <CardContent>
          <Loading label="Loading servers..." />
        </CardContent>
      </Card>
    );
  }

  if (isError || !data) {
    return (
      <div>
        <PageError error="Failed to load servers. Please try again later." variant="error" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl space-y-6">
      {/* Servers List */}
      {data.servers.length > 0 && (
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          {data.servers.map((server) => (
            <ServerCard key={server.id} server={server} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {data.servers.length === 0 && (
        <div className="py-12 text-center">
          <div className="bg-muted/50 mx-auto mb-4 flex size-12 items-center justify-center rounded-full">
            <FontAwesomeIcon icon={faUsers} className="text-muted-foreground" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">No servers found</h3>
          <p className="text-muted-foreground mb-4 text-sm">
            You don&apos;t have any servers configured yet. Make sure you are a server administrator and try again.
          </p>
        </div>
      )}
    </div>
  );
}

interface ServerCardProps {
  server: {
    id: string;
    name: string;
    icon: string | null;
    owner?: boolean;
    admin: boolean;
    bot?: boolean;
  };
}

function ServerCard({ server }: ServerCardProps) {
  const isBotActive = server.bot === true;
  const canSetup = server.admin === true && !isBotActive;

  const cardContent = (
    <Card className="from-card/90 to-card/60 group relative cursor-pointer overflow-hidden bg-gradient-to-br shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
      {/* Blurred background with server icon */}
      <div
        className="absolute inset-0 opacity-50 blur-2xl"
        style={{
          backgroundImage: `url(${getServerPictureUrl(server.id, server.icon)})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
      <CardContent className="relative z-10 flex h-full flex-col p-6">
        {/* Header Section */}
        <div className="flex items-start gap-4">
          <div className="relative">
            <Avatar className="ring-background/50 h-14 w-14 shadow-lg ring-2">
              <AvatarImage src={getServerPictureUrl(server.id, server.icon)} alt={`${server.name} icon`} />
              <AvatarFallback className="from-primary/20 to-primary/10 text-primary bg-gradient-to-br text-lg font-bold">
                {server.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="min-w-0 flex-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <h3 className="group-hover:text-primary mb-2 truncate text-xl font-bold transition-colors">
                    {server.name}
                  </h3>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{server.name}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <div className="flex items-center gap-2">
              {server.owner && (
                <Badge variant="outline" className="text-xs">
                  <FontAwesomeIcon icon={faCrown} className="text-primary mr-1" />
                  Owner
                </Badge>
              )}
              {server.admin && !server.owner && (
                <Badge variant="outline" className="text-xs">
                  <FontAwesomeIcon icon={faShield} className="text-secondary mr-1" />
                  Admin
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Status Section */}
        <div className="mt-6 flex items-baseline justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`size-2.5 rounded-full ${
                isBotActive ? "bg-success" : canSetup ? "bg-primary" : "bg-muted-foreground"
              }`}
            />
            <span className="text-muted-foreground text-sm font-medium">
              {isBotActive ? "Bot Active" : canSetup ? "Setup Available" : "No Access"}
            </span>
          </div>
          <div className="text-right">
            <div className="text-muted-foreground/70 text-xs">
              {isBotActive ? "Click to access" : canSetup ? "Click to setup" : "Read only"}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // If bot is active, make the entire card clickable to go to dashboard
  if (isBotActive) {
    return <Link to={`/dashboard/${server.id}`}>{cardContent}</Link>;
  }

  // If user can setup but bot isn't active, show setup button (non-clickable card)
  if (canSetup) {
    return <Link to={`/setup/${server.id}`}>{cardContent}</Link>;
  }

  // If user has no permissions, show non-clickable card
  return cardContent;
}
