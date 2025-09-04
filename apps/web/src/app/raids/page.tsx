import { useParams } from "react-router-dom";

import Loading from "@/components/ui/loading";
import { useGetGuildRaidsQuery } from "@/store/raids";

import { RaidList } from "./components/raid-list";

export function RaidsPage() {
  const { guildId } = useParams();
  const { data, isLoading, refetch, status } = useGetGuildRaidsQuery(
    { params: { guildId: guildId as string } },
    {
      skip: !guildId,
    },
  );

  if (isLoading) {
    return <Loading label="Loading raids..." />;
  }

  return <RaidList raids={data?.raids} status={status} onRefresh={refetch} />;
}
