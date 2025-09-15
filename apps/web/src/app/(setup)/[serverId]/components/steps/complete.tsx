import { useEffect, useMemo } from "react";

import { SetupServer } from "@albion-raid-manager/types/api";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";

import { CardContent } from "@/components/ui/card";

interface CompleteProps {
  addServerResponse?: SetupServer.Response;
}

export function Complete({ addServerResponse }: CompleteProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const link = useMemo(() => `/dashboard/${addServerResponse?.server.id}`, [addServerResponse?.server.id]);

  useEffect(() => {
    if (addServerResponse) {
      navigate(link);
    }
  }, [addServerResponse, link, navigate]);

  return (
    <CardContent className="flex flex-col items-center gap-3">
      <FontAwesomeIcon icon={faCheck} size="2xl" className="animate-pulse" />
      <p className="text-muted-foreground text-center text-sm">
        {t("setup.complete.message")}{" "}
        <Link to={link} className="text-primary font-bold">
          {t("setup.complete.clickHere")}
        </Link>{" "}
        {t("setup.complete.redirectFallback")}
      </p>
    </CardContent>
  );
}
