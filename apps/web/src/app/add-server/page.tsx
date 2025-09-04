import { faChevronCircleLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";

import Loading from "@/components/ui/loading";
import { PageError } from "@/components/ui/page";
import { useGetServersQuery } from "@/store/servers";

import { AddServerForm } from "./components/add-server";

export function CreateGuildPage() {
  const getServers = useGetServersQuery();

  if (getServers.isLoading) return <Loading />;
  if (getServers.isError) return <PageError error="Failed to load servers" variant="error" />;
  if (!getServers.data) return <PageError error="No servers found" />;
  const { servers } = getServers.data;

  return (
    <div className="flex grow items-center justify-center">
      <div className="flex flex-col items-start gap-3">
        <Link to="/dashboard" className="text-accent flex justify-center gap-1 text-sm leading-none">
          <FontAwesomeIcon icon={faChevronCircleLeft} className="size-4" />
          <span className="font-sans">Back to dashboard</span>
        </Link>
        <AddServerForm servers={servers} />
      </div>
    </div>
  );
}
