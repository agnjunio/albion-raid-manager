import type { RaidStatus } from "@albion-raid-manager/types";

import { useMemo } from "react";

import { getContentTypeInfo } from "@albion-raid-manager/types/entities";
import { faCopy, faLock, faPlay, faShare, faStop, faUnlock, faXmark } from "@fortawesome/free-solid-svg-icons";
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
import { isAPIError } from "@/lib/api";
import { useGetRaidQuery, useUpdateRaidMutation } from "@/store/raids";

import { RaidCompositionManager } from "./components/raid-composition-manager";
import { RaidNotes } from "./components/raid-notes";
import { RaidStats } from "./components/raid-stats";

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
  const contentTypeInfo = useMemo(() => getContentTypeInfo(data?.raid.contentType ?? "OTHER"), [data]);

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
                    {contentTypeInfo.displayName}
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
              {hasStatus("SCHEDULED", "OPEN", "CLOSED", "ONGOING") && (
                <Button
                  onClick={() => handleUpdateRaidStatus("CANCELLED")}
                  className="bg-red-600 text-white hover:bg-red-700"
                >
                  <FontAwesomeIcon icon={faXmark} className="mr-2 h-4 w-4" />
                  Cancel Raid
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Raid Notes */}
        {raid.note && <RaidNotes raid={raid} />}

        {/* Raid Composition */}
        <RaidCompositionManager
          raid={raid}
          onSlotUpdate={(slotId, updates) => {
            // TODO: Implement slot update API call
            console.log("Update slot:", slotId, updates);
          }}
          onSlotDelete={(slotId) => {
            // TODO: Implement slot delete API call
            console.log("Delete slot:", slotId);
          }}
          onSlotCreate={(slot) => {
            // TODO: Implement slot create API call
            console.log("Create slot:", slot);
          }}
        />
      </div>
    </Page>
  );
}
