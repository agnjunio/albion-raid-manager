import { Outlet, useParams } from "react-router-dom";

import { RaidProvider } from "./contexts/raid-context";
import { RaidSlotProvider } from "./contexts/raid-slot-context";
import { ViewModeProvider } from "./contexts/view-mode-context";

export function RaidLayout() {
  const { serverId, raidId } = useParams();

  return (
    <RaidProvider serverId={serverId as string} raidId={raidId as string}>
      <RaidSlotProvider>
        <ViewModeProvider>
          <Outlet />
        </ViewModeProvider>
      </RaidSlotProvider>
    </RaidProvider>
  );
}
