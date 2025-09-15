import { useEffect } from "react";

import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

import { PageLoading } from "@/components/ui/page";
import { useGetRaidsQuery } from "@/store/raids";

import { CalendarPage } from "./components/calendar-page";

export function RaidsPage() {
  const { t } = useTranslation();
  const { serverId } = useParams();

  const { data, isLoading, refetch, status, error } = useGetRaidsQuery(
    { params: { serverId: serverId as string } },
    {
      skip: !serverId,
      pollingInterval: 30000, // Poll every 30 seconds
    },
  );

  useEffect(() => {
    if (!error) return;
    toast.error(t("toasts.raids.loadError"), {
      description: t("toasts.raids.loadErrorDescription"),
      action: {
        label: "Retry",
        onClick: () => refetch(),
      },
    });
  }, [error, refetch]);

  if (isLoading) {
    return <PageLoading label="Loading raids..." />;
  }

  return <CalendarPage raids={data?.raids || []} onRefresh={refetch} isRefreshing={status === "pending"} />;
}
