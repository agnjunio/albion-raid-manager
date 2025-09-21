import { useMemo } from "react";

import { faCrown, faShield } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTranslation } from "react-i18next";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getServerPictureUrl } from "@/lib/discord-utils";
import { useGetServersQuery } from "@/store/servers";

interface ServerInfoProps {
  serverId: string;
  className?: string;
}

export function ServerInfo({ serverId, className = "" }: ServerInfoProps) {
  const { data, isLoading } = useGetServersQuery();
  const server = useMemo(() => {
    if (!data) return null;
    return data.servers.find((server) => server.id === serverId);
  }, [data, serverId]);

  if (isLoading) return <ServerInfoSkeleton className={className} />;
  if (!data || !server) return null;

  return <ServerInfoCard server={server} className={className} />;
}

interface ServerInfoCardProps {
  server: {
    id: string;
    icon?: string | null;
    name: string;
    owner?: boolean;
    admin?: boolean;
  };
  className?: string;
}

export function ServerInfoCard({ server, className = "" }: ServerInfoCardProps) {
  const { t } = useTranslation();
  const { icon, name, owner, admin } = server;

  return (
    <div className={`bg-muted/70 hover:bg-muted rounded-lg px-5 py-4 ${className}`}>
      <div className="flex select-none items-center gap-4">
        <img src={getServerPictureUrl(server.id, icon)} alt={`${name} icon`} className="h-12 w-12 rounded-full" />
        <div className="text-left">
          <p className="text-sm font-medium">{name}</p>
          {owner && (
            <Badge variant="outline" size="xs">
              <FontAwesomeIcon icon={faCrown} className="text-primary mr-1 size-3" />
              {t("servers.owner")}
            </Badge>
          )}
          {!owner && admin && (
            <Badge variant="outline" size="xs">
              <FontAwesomeIcon icon={faShield} className="text-secondary mr-1 size-3" />
              {t("servers.admin")}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}

function ServerInfoSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`bg-muted/70 rounded-lg px-5 py-4 ${className}`}>
      <div className="flex items-center gap-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2 text-left">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-6 w-20" />
        </div>
      </div>
    </div>
  );
}
