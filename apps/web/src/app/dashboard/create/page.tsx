import { faChevronCircleLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";

import Loading from "@/components/ui/loading";
import { PageError } from "@/components/ui/page";
import { useGetServersQuery } from "@/store/servers";

import { AddServer } from "./add-server";

export function CreateGuildPage() {
  const getServers = useGetServersQuery();

  if (getServers.isLoading) return <Loading />;
  if (getServers.isError) return <PageError error={getServers.error} />;
  if (!getServers.data) return <PageError error="No servers found" />;
  const { servers } = getServers.data;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 p-4">
      <Link to="/dashboard" className="text-accent flex items-center gap-1 text-sm leading-none">
        <FontAwesomeIcon icon={faChevronCircleLeft} className="size-4" />
        <span className="font-sans">Back to dashboard</span>
      </Link>
      <AddServer servers={servers} />
    </div>
  );
}
