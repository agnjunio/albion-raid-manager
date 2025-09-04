import type { RaidSlot, RaidStatus } from "@albion-raid-manager/core/types";

import { useParams } from "react-router-dom";

import { RaidStatusBadge } from "@/components/raids/raid-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Loading from "@/components/ui/loading";
import { Page, PageBackButton, PageError } from "@/components/ui/page";
import { isAPIError } from "@/lib/api";
import { useGetGuildRaidQuery, useUpdateGuildRaidMutation } from "@/store/raids";

import { RaidSlotCard } from "./components/raid-slot";

export function RaidPage() {
  const { guildId, raidId } = useParams();

  const { isLoading, data, error } = useGetGuildRaidQuery({
    params: {
      guildId: guildId as string,
      raidId: raidId as string,
    },
    query: {
      slots: true,
    },
  });
  const [updateRaidStatus, updateRaidStatusResult] = useUpdateGuildRaidMutation();

  if (isLoading || updateRaidStatusResult.isLoading) {
    return <Loading />;
  }

  if (error || !data) {
    return <PageError variant="error" error={isAPIError(error) ? error.data : "Failed to get raid"} />;
  }

  const hasStatus = (...statuses: RaidStatus[]) => statuses.includes(raid.status);
  const handleUpdateRaidStatus = async (status: RaidStatus) => {
    updateRaidStatus({
      params: {
        guildId: guildId as string,
        raidId: raidId as string,
      },
      body: { status },
    });
  };

  const { raid } = data;
  return (
    <Page className="mx-auto w-full max-w-screen-lg">
      <div>
        <PageBackButton />
      </div>

      <Card variant="outline">
        <CardHeader>
          <CardTitle size="small">{raid.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
            <div>Description:</div>
            <div className="font-semibold">{raid.description}</div>
            <div>Status:</div>
            <RaidStatusBadge status={raid.status} />
            <div>Start date:</div>
            <div>
              {new Date(raid.date).toLocaleString(navigator.language, {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card variant="outline">
        <CardHeader>
          <CardTitle size="small">Raid Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {hasStatus("SCHEDULED", "CLOSED") && (
              <Button className="btn-primary-yellow" onClick={() => handleUpdateRaidStatus("OPEN")}>
                Open Registration
              </Button>
            )}
            {hasStatus("OPEN") && (
              <Button className="btn-primary-yellow" onClick={() => handleUpdateRaidStatus("CLOSED")}>
                Close Registration
              </Button>
            )}
            {hasStatus("OPEN", "CLOSED", "FINISHED") && (
              <Button className="btn-primary-yellow" onClick={() => handleUpdateRaidStatus("ONGOING")}>
                Start Raid
              </Button>
            )}
            {hasStatus("ONGOING") && (
              <Button className="btn-primary-yellow" onClick={() => handleUpdateRaidStatus("FINISHED")}>
                Finish Raid
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card variant="outline">
        <CardHeader>
          <CardTitle size="small">Raid Slots</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            {raid.slots ? (
              raid.slots.map((slot: RaidSlot) => <RaidSlotCard key={slot.id} slot={slot} />)
            ) : (
              <div className="py-4 text-center">No players registered.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </Page>
  );
}
