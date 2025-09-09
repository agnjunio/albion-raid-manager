import type { RaidStatus } from "@albion-raid-manager/types";

import { faLock, faPlay, faStop, faUnlock, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { useRaidContext } from "../contexts/raid-context";

export function RaidActions() {
  const { raid, handleUpdateRaidStatus } = useRaidContext();
  const hasStatus = (...statuses: RaidStatus[]) => statuses.includes(raid.status);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FontAwesomeIcon icon={faPlay} className="h-5 w-5" />
          Raid Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        {hasStatus("CANCELLED") ? (
          <div className="py-8 text-center">
            <div className="text-muted-foreground mb-4">
              <FontAwesomeIcon icon={faXmark} className="mx-auto mb-3 h-12 w-12 text-red-500" />
              <h3 className="mb-2 text-lg font-semibold">Raid Cancelled</h3>
              <p className="text-sm">This raid has been cancelled and is no longer available for management.</p>
            </div>
            <div className="text-muted-foreground text-xs">Cancelled raids cannot be reopened or modified.</div>
          </div>
        ) : hasStatus("FINISHED") ? (
          <div className="py-8 text-center">
            <div className="text-muted-foreground mb-4">
              <FontAwesomeIcon icon={faStop} className="mx-auto mb-3 h-12 w-12 text-green-500" />
              <h3 className="mb-2 text-lg font-semibold">Raid Completed</h3>
              <p className="text-sm">This raid has been finished successfully.</p>
            </div>
            <div className="text-muted-foreground text-xs">Completed raids are read-only and cannot be modified.</div>
          </div>
        ) : (
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
        )}
      </CardContent>
    </Card>
  );
}
