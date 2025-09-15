import { useCallback, useEffect } from "react";

import { CalendarView } from "@/app/(dashboard)/[serverId]/(raids)/contexts/calendar-context";

interface HotkeyConfig {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
  action: () => void;
  description: string;
}

interface UseHotkeysOptions {
  enabled?: boolean;
}

export function useHotkeys(hotkeys: HotkeyConfig[], options: UseHotkeysOptions = {}) {
  const { enabled = true } = options;

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      const pressedKey = event.key.toLowerCase();
      const isCtrl = event.ctrlKey || event.metaKey; // Support both Ctrl and Cmd
      const isAlt = event.altKey;
      const isShift = event.shiftKey;

      for (const hotkey of hotkeys) {
        const matchesKey = hotkey.key.toLowerCase() === pressedKey;
        const matchesCtrl = (hotkey.ctrlKey ?? false) === isCtrl;
        const matchesAlt = (hotkey.altKey ?? false) === isAlt;
        const matchesShift = (hotkey.shiftKey ?? false) === isShift;

        if (matchesKey && matchesCtrl && matchesAlt && matchesShift) {
          event.preventDefault();
          hotkey.action();
          break;
        }
      }
    },
    [hotkeys, enabled],
  );

  useEffect(() => {
    if (!enabled) return;

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown, enabled]);
}

// Common hotkey configurations
export const createCalendarHotkeys = (
  onViewChange: (view: CalendarView) => void,
  onDateChange: (date: Date) => void,
  currentDate: Date,
  currentView: CalendarView,
  t: (key: string) => string,
  onCreateRaid?: () => void,
  onRefresh?: () => void,
): HotkeyConfig[] => [
  // View switching
  {
    key: "1",
    ctrlKey: true,
    action: () => onViewChange(CalendarView.DAY),
    description: t("hotkeys.descriptions.switchToDayView"),
  },
  {
    key: "2",
    ctrlKey: true,
    action: () => onViewChange(CalendarView.WEEK),
    description: t("hotkeys.descriptions.switchToWeekView"),
  },
  {
    key: "3",
    ctrlKey: true,
    action: () => onViewChange(CalendarView.MONTH),
    description: t("hotkeys.descriptions.switchToMonthView"),
  },
  // Date navigation - same logic as header arrows
  {
    key: "ArrowLeft",
    ctrlKey: true,
    action: () => {
      const newDate = new Date(currentDate);
      switch (currentView) {
        case CalendarView.DAY:
          newDate.setDate(newDate.getDate() - 1);
          break;
        case CalendarView.WEEK:
          newDate.setDate(newDate.getDate() - 7);
          break;
        case CalendarView.MONTH:
          newDate.setMonth(newDate.getMonth() - 1);
          break;
      }
      onDateChange(newDate);
    },
    description:
      currentView === CalendarView.DAY
        ? t("hotkeys.descriptions.goToPreviousDay")
        : currentView === CalendarView.WEEK
          ? t("hotkeys.descriptions.goToPreviousWeek")
          : t("hotkeys.descriptions.goToPreviousMonth"),
  },
  {
    key: "ArrowRight",
    ctrlKey: true,
    action: () => {
      const newDate = new Date(currentDate);
      switch (currentView) {
        case CalendarView.DAY:
          newDate.setDate(newDate.getDate() + 1);
          break;
        case CalendarView.WEEK:
          newDate.setDate(newDate.getDate() + 7);
          break;
        case CalendarView.MONTH:
          newDate.setMonth(newDate.getMonth() + 1);
          break;
      }
      onDateChange(newDate);
    },
    description:
      currentView === CalendarView.DAY
        ? t("hotkeys.descriptions.goToNextDay")
        : currentView === CalendarView.WEEK
          ? t("hotkeys.descriptions.goToNextWeek")
          : t("hotkeys.descriptions.goToNextMonth"),
  },
  // Today
  {
    key: "t",
    ctrlKey: true,
    action: () => onDateChange(new Date()),
    description: t("hotkeys.descriptions.goToToday"),
  },
  // Actions
  ...(onCreateRaid
    ? [
        {
          key: "n",
          ctrlKey: true,
          action: onCreateRaid,
          description: t("hotkeys.descriptions.createNewRaid"),
        },
      ]
    : []),
  ...(onRefresh
    ? [
        {
          key: "r",
          ctrlKey: true,
          action: onRefresh,
          description: t("hotkeys.descriptions.refreshCalendar"),
        },
      ]
    : []),
];
