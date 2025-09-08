import type { Raid } from "@albion-raid-manager/types";

import { CalendarProvider } from "../contexts/calendar-context";

import { CalendarGrid } from "./calendar-grid";
import { CalendarHeader } from "./calendar-header";
import { CalendarSidebar } from "./calendar-sidebar";
import { CreateRaidSidebar, useTimeSlotClick } from "./create-raid-sidebar";

interface CalendarPageProps {
  raids: Raid[];
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export function CalendarPage({ raids, onRefresh, isRefreshing = false }: CalendarPageProps) {
  return (
    <CalendarProvider raids={raids} onRefresh={onRefresh} isRefreshing={isRefreshing}>
      <CalendarPageContent />
    </CalendarProvider>
  );
}

function CalendarPageContent() {
  const { selectedDateTime, handleTimeSlotClick } = useTimeSlotClick();

  const handleTimeSlotSelect = (_dateTime: Date) => {
    // This is called when the form is opened with a pre-selected time
    // The actual time slot clicking is handled by handleTimeSlotClick
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex-shrink-0">
        <CalendarHeader />
      </div>

      {/* Main Content */}
      <div className="flex min-h-0 flex-1">
        {/* Sidebar - Hidden on mobile, visible on desktop */}
        <div className="hidden lg:block lg:w-80 lg:flex-shrink-0">
          <div className="border-border/50 bg-muted/20 h-full overflow-y-auto border-r">
            <CalendarSidebar />
          </div>
        </div>

        {/* Calendar Grid with Create Raid Sidebar */}
        <div className="flex-1">
          <CreateRaidSidebar selectedDateTime={selectedDateTime} onTimeSlotSelect={handleTimeSlotSelect}>
            <div className="h-full">
              <CalendarGrid onTimeSlotClick={handleTimeSlotClick} />
            </div>
          </CreateRaidSidebar>
        </div>
      </div>
    </div>
  );
}
