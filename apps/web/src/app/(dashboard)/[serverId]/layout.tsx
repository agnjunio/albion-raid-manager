import { useTranslation } from "react-i18next";
import { Navigate, Outlet, useParams } from "react-router-dom";

import { PageLoading } from "@/components/ui/page";
import { useGetServerQuery } from "@/store/servers";

import { ServerProvider } from "./context";

export function ServerLayout() {
  const { serverId } = useParams();
  const { data, isLoading, error } = useGetServerQuery(
    { params: { serverId: serverId as string } },
    { skip: !serverId },
  );
  const { t } = useTranslation();

  if (isLoading) return <PageLoading label={t("dashboard.loadingServer")} />;
  if (error) return <Navigate to="/dashboard" />;

  const server = data?.server;
  return (
    <ServerProvider server={server}>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <Outlet />
      </div>
    </ServerProvider>
  );
}
