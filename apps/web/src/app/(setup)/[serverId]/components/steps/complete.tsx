import { useEffect, useMemo } from "react";

import { SetupServer } from "@albion-raid-manager/core/types/api/servers";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, useNavigate } from "react-router-dom";

import { CardContent } from "@/components/ui/card";

interface CompleteProps {
  addServerResponse?: SetupServer.Response;
}

export function Complete({ addServerResponse }: CompleteProps) {
  const navigate = useNavigate();

  const link = useMemo(() => `/dashboard/${addServerResponse?.server.id}`, [addServerResponse?.server.id]);

  useEffect(() => {
    if (addServerResponse) {
      navigate(link);
    }
  }, [addServerResponse, link, navigate]);

  return (
    <CardContent className="flex flex-col items-center gap-3">
      <FontAwesomeIcon icon={faCheck} size="2xl" />
      <p className="text-muted-foreground text-base">
        Verification complete. You will be redirected to the dashboard page. Please <Link to={link}>click here</Link> if
        that doesn&apos;t happen.
      </p>
    </CardContent>
  );
}
