import { Server } from "@albion-raid-manager/types/entities";
import { useTranslation } from "react-i18next";

import { ServerInfoCard } from "@/components/discord";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";

interface ServerInfoProps {
  server: Server;
  onNext: () => void;
}

export function ServerInfo({ server, onNext }: ServerInfoProps) {
  const { t } = useTranslation();

  return (
    <CardContent className="space-y-4">
      <div className="flex justify-center text-center">
        <ServerInfoCard server={server} />
      </div>

      <p className="text-muted-foreground text-center text-xs">{t("setup.serverInfo.description")}</p>

      <Button onClick={onNext} className="w-full">
        {t("setup.serverInfo.continueButton")}
      </Button>
    </CardContent>
  );
}
