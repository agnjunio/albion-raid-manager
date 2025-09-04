import { useParams } from "react-router-dom";

import { PageLoading } from "@/components/ui/page";
import { useGetRaidsQuery } from "@/store/raids";

import { RaidList } from "./components/raid-list";

export function RaidsPage() {
  const { serverId } = useParams();
  const { data, isLoading, refetch, status } = useGetRaidsQuery(
    { params: { serverId: serverId as string } },
    {
      skip: !serverId,
    },
  );

  if (isLoading) {
    return <PageLoading label="Loading raids..." />;
  }

  return <RaidList raids={data?.raids} status={status} onRefresh={refetch} />;
}
