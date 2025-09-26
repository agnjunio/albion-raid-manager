import { useTranslation } from "react-i18next";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Page } from "@/components/ui/page";

import { DashboardHeader } from "./components/header";
import { ServerList } from "./components/server-list";

export function DashboardPage() {
  const { t } = useTranslation();

  return (
    <div>
      <DashboardHeader hasSidebar={false} />
      <Page className="flex flex-col items-center justify-start gap-8 py-8">
        <Card className="max-w-md text-center">
          <CardHeader>
            <div className="bg-primary/10 mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full">
              <img src="/book.jpg" alt="Albion Raid Manager" className="rounded-full" width={80} height={80} />
            </div>
            <CardTitle className="text-2xl">{t("dashboard.welcome")}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <p className="text-muted-foreground text-sm">{t("dashboard.selectServer")}</p>
            <p className="text-muted-foreground text-sm">{t("dashboard.description")}</p>
          </CardContent>
        </Card>

        <ServerList />
      </Page>
    </div>
  );
}
