import { faChevronLeft, faChevronRight, faCog, faPlus, faRefresh } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { HotkeysHelp } from "@/components/ui/hotkeys-help";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getCurrentLanguage } from "@/lib/locale";
import { cn } from "@/lib/utils";

import { useServerContext } from "../../context";
import { CalendarView, useCalendar } from "../contexts/calendar-context";

import { CreateRaidSheet } from "./create-raid-sheet";

export function CalendarHeader() {
  const { hasAdminPermission, hasCallerPermission } = useServerContext();
  const { currentDate, view, isRefreshing, hotkeys, setCurrentDate, setView, refresh } = useCalendar();
  const { t } = useTranslation();
  const { serverId } = useParams<{ serverId: string }>();

  const formatDateRange = (date: Date, view: CalendarView) => {
    const language = getCurrentLanguage();

    switch (view) {
      case CalendarView.DAY:
        return date.toLocaleDateString(language, {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });

      case CalendarView.WEEK: {
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);

        const startDate = startOfWeek.toLocaleDateString(language, {
          month: "long",
          day: "numeric",
        });
        const endDate = endOfWeek.toLocaleDateString(language, {
          month: "long",
          day: "numeric",
        });

        return `${startDate} - ${endDate}`;
      }

      case CalendarView.MONTH:
        return date.toLocaleDateString(language, {
          year: "numeric",
          month: "long",
        });

      default:
        return date.toLocaleDateString(language, {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
    }
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
  };

  const isCurrentlyShowingToday = () => {
    const today = new Date();

    switch (view) {
      case CalendarView.DAY:
        return currentDate.toDateString() === today.toDateString();

      case CalendarView.WEEK: {
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);

        return today >= startOfWeek && today <= endOfWeek;
      }

      case CalendarView.MONTH:
        return currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear();

      default:
        return false;
    }
  };

  const navigateDate = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);

    switch (view) {
      case CalendarView.DAY:
        newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1));
        break;
      case CalendarView.WEEK:
        newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
        break;
      case CalendarView.MONTH:
        newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1));
        break;
    }

    setCurrentDate(newDate);
  };

  return (
    <div className="bg-background border-border flex items-center justify-between border-b px-4 py-3">
      {/* Left side - Navigation and title */}
      <div className="flex items-center gap-2">
        {/* Navigation arrows */}
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={() => navigateDate("prev")} className="hover:bg-muted h-8 w-8">
            <FontAwesomeIcon icon={faChevronLeft} className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => navigateDate("next")} className="hover:bg-muted h-8 w-8">
            <FontAwesomeIcon icon={faChevronRight} className="h-4 w-4" />
          </Button>
        </div>

        {/* Title */}
        <div className="ml-4 flex items-center gap-4">
          <h1 className="text-foreground capitalize-first text-xl font-normal">{formatDateRange(currentDate, view)}</h1>

          {!isCurrentlyShowingToday() && (
            <Button variant="outline" size="sm" onClick={goToToday} className="px-3 py-1 text-sm font-normal">
              {t("calendar.navigation.today")}
            </Button>
          )}
        </div>
      </div>

      {/* Right side - Controls */}
      <div className="flex items-center gap-1">
        <Select value={view} onValueChange={setView}>
          <SelectTrigger className="hover:bg-muted h-8 border-0 shadow-none">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={CalendarView.DAY}>{t("calendar.views.day")}</SelectItem>
            <SelectItem value={CalendarView.WEEK}>{t("calendar.views.week")}</SelectItem>
            <SelectItem value={CalendarView.MONTH}>{t("calendar.views.month")}</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="ghost"
          size="icon"
          onClick={refresh}
          disabled={isRefreshing}
          className="hover:bg-muted h-8 w-8"
        >
          <FontAwesomeIcon icon={faRefresh} className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
        </Button>

        {hasAdminPermission && (
          <Link to={`/dashboard/${serverId}/settings/raids`} tabIndex={-1}>
            <Button variant="ghost" size="icon" className="hover:bg-muted hidden h-8 w-8 lg:flex">
              <FontAwesomeIcon icon={faCog} className="h-4 w-4" />
            </Button>
          </Link>
        )}

        <HotkeysHelp hotkeys={hotkeys} />

        {hasCallerPermission && (
          <CreateRaidSheet>
            <Button className="h-8 gap-1 px-3 text-sm font-normal">
              <FontAwesomeIcon icon={faPlus} className="h-4 w-4" />
              <span className="hidden sm:inline">{t("calendar.navigation.newRaid")}</span>
            </Button>
          </CreateRaidSheet>
        )}
      </div>
    </div>
  );
}
