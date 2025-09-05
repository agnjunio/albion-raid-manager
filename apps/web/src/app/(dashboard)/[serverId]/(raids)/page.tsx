import { useEffect } from "react";

import { useParams } from "react-router-dom";
import { toast } from "sonner";

import { PageLoading } from "@/components/ui/page";
import { useGetRaidsQuery } from "@/store/raids";

import { RaidList } from "./components/raid-list";

export function RaidsPage() {
  const { serverId } = useParams();
  const { data, isLoading, refetch, status, error } = useGetRaidsQuery(
    { params: { serverId: serverId as string } },
    {
      skip: !serverId,
    },
  );

  useEffect(() => {
    if (!error) return;
    toast.error("Failed to load raids", {
      description: "There was an error loading raids. Please try again.",
      action: {
        label: "Retry",
        onClick: () => refetch(),
      },
    });
  }, [error, refetch]);

  if (isLoading) {
    return <PageLoading label="Loading raids..." />;
  }

  return <RaidList raids={data?.raids} status={status} onRefresh={refetch} />;
}
