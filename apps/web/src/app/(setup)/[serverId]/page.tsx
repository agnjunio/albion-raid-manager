import { useMemo } from "react";

import { faChevronCircleLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, Navigate, useParams } from "react-router-dom";

import Loading from "@/components/ui/loading";
import { useGetServersQuery } from "@/store/servers";

import { ServerSetup } from "./components/server-setup";

export function ServerSetupPage() {
  const { data, isLoading } = useGetServersQuery();
  const { serverId } = useParams<{ serverId: string }>();

  const server = useMemo(() => data?.servers.find((server) => server.id === serverId), [data, serverId]);

  if (isLoading) return <Loading label="Loading server..." />;
  if (!server) return <Navigate to="/dashboard" />;

  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex flex-col items-start gap-3">
        <Link to="/dashboard" className="text-accent flex justify-center gap-1 text-sm leading-none">
          <FontAwesomeIcon icon={faChevronCircleLeft} className="size-4" />
          <span className="font-sans">Back to dashboard</span>
        </Link>
        <ServerSetup server={server} />
      </div>
    </div>
  );
}
