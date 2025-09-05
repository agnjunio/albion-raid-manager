import type { Raid } from "@albion-raid-manager/core/types";

import { useMemo, useState } from "react";

import { CalendarGrid } from "./calendar-grid";
import { CalendarHeader } from "./calendar-header";
import { CalendarSidebar } from "./calendar-sidebar";

interface CalendarPageProps {
  raids: Raid[];
  onRefresh: () => void;
  isRefreshing?: boolean;
}

interface RaidFilters {
  status: string[];
  type: string[];
  search: string;
}

export function CalendarPage({ raids, onRefresh, isRefreshing = false }: CalendarPageProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"day" | "week" | "month">("week");
  const [filters, setFilters] = useState<RaidFilters>({
    status: [],
    type: [],
    search: "",
  });

  const filteredRaids = useMemo(() => {
    return raids.filter((raid) => {
      // Status filter
      if (filters.status.length > 0 && !filters.status.includes(raid.status)) {
        return false;
      }

      // Type filter (if we add type filtering later)
      if (filters.type.length > 0 && raid.type && !filters.type.includes(raid.type)) {
        return false;
      }

      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const titleMatch = raid.title.toLowerCase().includes(searchLower);
        const descriptionMatch = raid.description?.toLowerCase().includes(searchLower) || false;
        const locationMatch = raid.location?.toLowerCase().includes(searchLower) || false;

        if (!titleMatch && !descriptionMatch && !locationMatch) {
          return false;
        }
      }

      return true;
    });
  }, [raids, filters]);

  const handleDateChange = (date: Date) => {
    setCurrentDate(date);
  };

  const handleViewChange = (newView: "day" | "week" | "month") => {
    setView(newView);
  };

  const handleFilterChange = (newFilters: RaidFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex-shrink-0">
        <CalendarHeader
          currentDate={currentDate}
          onDateChange={handleDateChange}
          onRefresh={onRefresh}
          view={view}
          onViewChange={handleViewChange}
          isRefreshing={isRefreshing}
        />
      </div>

      {/* Main Content */}
      <div className="flex min-h-0 flex-1">
        {/* Sidebar - Hidden on mobile, visible on desktop */}
        <div className="hidden lg:block lg:w-80 lg:flex-shrink-0">
          <div className="border-border/50 bg-muted/20 h-full overflow-y-auto border-r">
            <CalendarSidebar
              raids={raids}
              currentDate={currentDate}
              onDateChange={handleDateChange}
              onFilterChange={handleFilterChange}
              filters={filters}
            />
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="bg-background flex-1 overflow-y-auto">
          <CalendarGrid raids={filteredRaids} currentDate={currentDate} view={view} />
        </div>
      </div>
    </div>
  );
}
