import type { Raid } from "@albion-raid-manager/types";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

import { useTranslation } from "react-i18next";

import { createCalendarHotkeys, useHotkeys } from "@/hooks/use-hotkeys";

export enum CalendarView {
  DAY = "day",
  WEEK = "week",
  MONTH = "month",
}

interface RaidFilters {
  status: string[];
  type: string[];
  search: string;
}

interface CalendarContextValue {
  // State
  currentDate: Date;
  view: CalendarView;
  filters: RaidFilters;
  raids: Raid[];
  isRefreshing: boolean;

  // Actions
  setCurrentDate: (date: Date) => void;
  setView: (view: CalendarView) => void;
  setFilters: (filters: RaidFilters) => void;
  refresh: () => void;

  // Helper functions
  isRaidFiltered: (raid: Raid) => boolean;

  // Computed
  hotkeys: Array<{
    key: string;
    ctrlKey?: boolean;
    altKey?: boolean;
    shiftKey?: boolean;
    metaKey?: boolean;
    description: string;
  }>;
}

const CalendarContext = createContext<CalendarContextValue | undefined>(undefined);

interface CalendarProviderProps {
  children: ReactNode;
  raids: Raid[];
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export function CalendarProvider({ children, raids, onRefresh, isRefreshing = false }: CalendarProviderProps) {
  const { t } = useTranslation();

  // State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>(() => {
    // Load saved view preference from localStorage
    const savedView = localStorage.getItem("calendar-view");
    return (savedView as CalendarView) || CalendarView.WEEK;
  });
  const [filters, setFilters] = useState<RaidFilters>({
    status: [],
    type: [],
    search: "",
  });

  // Helper function to check if a raid is filtered out
  const isRaidFiltered = useMemo(() => {
    return (raid: Raid) => {
      // Status filter
      if (filters.status.length > 0 && !filters.status.includes(raid.status)) {
        return true;
      }

      // Type filter (if we add type filtering later)
      if (filters.type.length > 0 && raid.type && !filters.type.includes(raid.type)) {
        return true;
      }

      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const titleMatch = raid.title.toLowerCase().includes(searchLower);
        const descriptionMatch = raid.description?.toLowerCase().includes(searchLower) || false;
        const locationMatch = raid.location?.toLowerCase().includes(searchLower) || false;

        if (!titleMatch && !descriptionMatch && !locationMatch) {
          return true;
        }
      }

      return false;
    };
  }, [filters]);

  // Actions
  const handleViewChange = (newView: CalendarView) => {
    setView(newView);
    // Save view preference to localStorage
    localStorage.setItem("calendar-view", newView);
  };

  const handleDateChange = (date: Date) => {
    setCurrentDate(date);
  };

  const handleFilterChange = (newFilters: RaidFilters) => {
    setFilters(newFilters);
  };

  // Set up hotkeys
  const hotkeys = createCalendarHotkeys(
    handleViewChange,
    handleDateChange,
    currentDate,
    view,
    t,
    undefined, // onCreateRaid - can be added later
    onRefresh,
  );

  useHotkeys(hotkeys, { enabled: true });

  const value: CalendarContextValue = {
    // State
    currentDate,
    view,
    filters,
    raids,
    isRefreshing,

    // Actions
    setCurrentDate: handleDateChange,
    setView: handleViewChange,
    setFilters: handleFilterChange,
    refresh: onRefresh,

    // Helper functions
    isRaidFiltered,

    // Computed
    hotkeys,
  };

  return <CalendarContext.Provider value={value}>{children}</CalendarContext.Provider>;
}

export function useCalendar() {
  const context = useContext(CalendarContext);
  if (context === undefined) {
    throw new Error("useCalendar must be used within a CalendarProvider");
  }
  return context;
}
