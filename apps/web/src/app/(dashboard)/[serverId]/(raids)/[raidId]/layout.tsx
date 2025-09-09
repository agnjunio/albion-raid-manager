import { Outlet, useParams } from "react-router-dom";

import Loading from "@/components/ui/loading";
import { PageError } from "@/components/ui/page";
import { isAPIError } from "@/lib/api";
import { useGetRaidQuery } from "@/store/raids";

import { RaidProvider } from "./contexts/raid-context";

export function RaidLayout() {
  const { serverId, raidId } = useParams();

  const { isLoading, data, error } = useGetRaidQuery({
    params: {
      serverId: serverId as string,
      raidId: raidId as string,
    },
    query: {
      slots: true,
    },
  });

  if (isLoading) {
    return <Loading />;
  }

  if (error || !data) {
    return <PageError variant="error" error={isAPIError(error) ? error.data : "Failed to get raid"} />;
  }

  return (
    <RaidProvider raid={data.raid} serverId={serverId as string} raidId={raidId as string}>
      <Outlet />
    </RaidProvider>
  );
}
