import type { RaidSlot, RaidStatus, ContentType } from "@albion-raid-manager/types";

import { faUsers, faCopy, faShare, faPlay, faStop, faLock, faUnlock } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

import { RaidStatusBadge } from "@/components/raids/raid-badge";
import { BackButton } from "@/components/ui/back-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Loading from "@/components/ui/loading";
import { Page, PageError } from "@/components/ui/page";
import { Separator } from "@/components/ui/separator";
import { isAPIError } from "@/lib/api";
import { useGetRaidQuery, useUpdateRaidMutation } from "@/store/raids";

import { RaidNotes } from "./components/raid-notes";
import { RaidSlotCard } from "./components/raid-slot";
import { RaidStats } from "./components/raid-stats";

// Content type display names
const contentTypeNames: Record<ContentType, string> = {
  SOLO_DUNGEON: "Solo Dungeon",
  OPEN_WORLD_FARMING: "Open World Farming",
  GROUP_DUNGEON: "Group Dungeon",
  AVALONIAN_DUNGEON_FULL_CLEAR: "Avalonian Dungeon (Full Clear)",
  AVALONIAN_DUNGEON_BUFF_ONLY: "Avalonian Dungeon (Buff Only)",
  ROADS_OF_AVALON_PVE: "Roads of Avalon (PvE)",
  ROADS_OF_AVALON_PVP: "Roads of Avalon (PvP)",
  DEPTHS_DUO: "Depths (Duo)",
  DEPTHS_TRIO: "Depths (Trio)",
  GANKING_SQUAD: "Ganking Squad",
  FIGHTING_SQUAD: "Fighting Squad",
  ZVZ_CALL_TO_ARMS: "ZvZ Call to Arms",
  HELLGATE_2V2: "Hellgate 2v2",
  HELLGATE_5V5: "Hellgate 5v5",
  HELLGATE_10V10: "Hellgate 10v10",
  MISTS_SOLO: "Mists (Solo)",
  MISTS_DUO: "Mists (Duo)",
  OTHER: "Other",
};

export function RaidPage() {
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
  const [updateRaidStatus, updateRaidStatusResult] = useUpdateRaidMutation();

  if (isLoading || updateRaidStatusResult.isLoading) {
    return <Loading />;
  }

  if (error || !data) {
    return <PageError variant="error" error={isAPIError(error) ? error.data : "Failed to get raid"} />;
  }

  const { raid } = data;
  const hasStatus = (...statuses: RaidStatus[]) => statuses.includes(raid.status);

  const handleUpdateRaidStatus = async (status: RaidStatus) => {
    try {
      await updateRaidStatus({
        params: {
          serverId: serverId as string,
          raidId: raidId as string,
        },
        body: { status },
      }).unwrap();

      toast.success("Raid status updated successfully", {
        description: `Raid status changed to ${status}`,
      });
    } catch {
      toast.error("Failed to update raid status", {
        description: "There was an error updating the raid status. Please try again.",
      });
    }
  };

  const handleCopyRaidLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success("Raid link copied to clipboard");
  };

  const handleShareRaid = () => {
    if (navigator.share) {
      navigator.share({
        title: raid.title,
        text: `Join ${raid.title} - ${new Date(raid.date).toLocaleString()}`,
        url: window.location.href,
      });
    } else {
      handleCopyRaidLink();
    }
  };

  // Calculate raid statistics for display
  const totalSlots = raid.slots?.length || 0;
  const filledSlots = raid.slots?.filter((slot) => slot.user).length || 0;

  // Group slots by role
  const slotsByRole =
    raid.slots?.reduce(
      (acc, slot) => {
        const role = slot.role || "UNASSIGNED";
        if (!acc[role]) acc[role] = [];
        acc[role].push(slot);
        return acc;
      },
      {} as Record<string, RaidSlot[]>,
    ) || {};

  const roleOrder = ["CALLER", "TANK", "HEALER", "SUPPORT", "RANGED_DPS", "MELEE_DPS", "BATTLEMOUNT", "UNASSIGNED"];

  return (
    <Page>
      <div className="mx-auto w-full max-w-7xl space-y-6 pb-8">
        {/* Raid Header with integrated back button */}
        <Card>
          <CardHeader className="pb-4">
            {/* Top navigation bar */}
            <div className="border-border/50 mb-6 flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-4">
                <BackButton label="Back to Raids" />

                <div className="text-muted-foreground flex items-center gap-2 text-sm">
                  <span>•</span>
                  <span>Raid Management</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyRaidLink}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <FontAwesomeIcon icon={faCopy} className="mr-2 h-4 w-4" />
                  Copy Link
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShareRaid}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <FontAwesomeIcon icon={faShare} className="mr-2 h-4 w-4" />
                  Share
                </Button>
              </div>
            </div>

            {/* Main content */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <CardTitle className="text-3xl font-bold">{raid.title}</CardTitle>
                <RaidStatusBadge status={raid.status} />
                {raid.contentType && (
                  <Badge variant="secondary" className="text-sm">
                    {contentTypeNames[raid.contentType]}
                  </Badge>
                )}
              </div>

              {raid.description && (
                <p className="text-muted-foreground max-w-4xl text-lg leading-relaxed">{raid.description}</p>
              )}
            </div>
          </CardHeader>

          <CardContent>
            <RaidStats raid={raid} />
          </CardContent>
        </Card>

        {/* Raid Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FontAwesomeIcon icon={faPlay} className="h-5 w-5" />
              Raid Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {hasStatus("SCHEDULED", "CLOSED") && (
                <Button
                  onClick={() => handleUpdateRaidStatus("OPEN")}
                  className="bg-green-600 text-white hover:bg-green-700"
                >
                  <FontAwesomeIcon icon={faUnlock} className="mr-2 h-4 w-4" />
                  Open Registration
                </Button>
              )}
              {hasStatus("OPEN") && (
                <Button
                  onClick={() => handleUpdateRaidStatus("CLOSED")}
                  className="bg-red-600 text-white hover:bg-red-700"
                >
                  <FontAwesomeIcon icon={faLock} className="mr-2 h-4 w-4" />
                  Close Registration
                </Button>
              )}
              {hasStatus("OPEN", "CLOSED", "FINISHED") && (
                <Button
                  onClick={() => handleUpdateRaidStatus("ONGOING")}
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  <FontAwesomeIcon icon={faPlay} className="mr-2 h-4 w-4" />
                  Start Raid
                </Button>
              )}
              {hasStatus("ONGOING") && (
                <Button
                  onClick={() => handleUpdateRaidStatus("FINISHED")}
                  className="bg-gray-600 text-white hover:bg-gray-700"
                >
                  <FontAwesomeIcon icon={faStop} className="mr-2 h-4 w-4" />
                  Finish Raid
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Raid Notes */}
        {raid.note && <RaidNotes raid={raid} />}

        {/* Raid Composition */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FontAwesomeIcon icon={faUsers} className="h-5 w-5" />
              Raid Composition
              <Badge variant="outline" className="ml-2">
                {filledSlots} / {totalSlots}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {raid.slots && raid.slots.length > 0 ? (
              <div className="space-y-6">
                {roleOrder.map((role) => {
                  const roleSlots = slotsByRole[role];
                  if (!roleSlots || roleSlots.length === 0) return null;

                  return (
                    <div key={role} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <h4 className="text-lg font-semibold capitalize">
                          {role === "UNASSIGNED" ? "Unassigned" : role.replace("_", " ").toLowerCase()}
                        </h4>
                        <Badge variant="secondary" className="text-xs">
                          {roleSlots.length} slot{roleSlots.length !== 1 ? "s" : ""}
                        </Badge>
                      </div>

                      <div className="grid gap-2">
                        {roleSlots.map((slot) => (
                          <RaidSlotCard key={slot.id} slot={slot} />
                        ))}
                      </div>

                      {role !== roleOrder[roleOrder.length - 1] && <Separator className="my-4" />}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center">
                <FontAwesomeIcon icon={faUsers} className="text-muted-foreground mb-4 h-12 w-12" />
                <h3 className="mb-2 text-lg font-semibold">No Raid Slots</h3>
                <p className="text-muted-foreground">This raid doesn&apos;t have any slots defined yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Page>
  );
}
