import { useState } from "react";

import { cn } from "@albion-raid-manager/core/helpers";
import { faCalendar, faChevronLeft, faChevronRight, faCog, faPlus, faRefresh } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CalendarHeaderProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onRefresh: () => void;
  view: "day" | "week" | "month";
  onViewChange: (view: "day" | "week" | "month") => void;
  isRefreshing?: boolean;
}

export function CalendarHeader({
  currentDate,
  onDateChange,
  onRefresh,
  view,
  onViewChange,
  isRefreshing = false,
}: CalendarHeaderProps) {
  const [isToday, setIsToday] = useState(true);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const goToToday = () => {
    const today = new Date();
    onDateChange(today);
    setIsToday(true);
  };

  const navigateDate = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);

    switch (view) {
      case "day":
        newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1));
        break;
      case "week":
        newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
        break;
      case "month":
        newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1));
        break;
    }

    onDateChange(newDate);
    setIsToday(newDate.toDateString() === new Date().toDateString());
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

        {/* Title with calendar */}
        <div className="ml-4 flex items-baseline gap-2">
          <h1 className="text-foreground text-xl font-normal">{formatDate(currentDate)}</h1>
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-muted h-8 w-8">
                <FontAwesomeIcon icon={faCalendar} className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={currentDate}
                onSelect={(date) => {
                  if (date) {
                    onDateChange(date);
                    setIsCalendarOpen(false);
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          {!isToday && (
            <Button variant="ghost" size="sm" onClick={goToToday} className="px-3 py-1 text-sm font-normal">
              Today
            </Button>
          )}
        </div>
      </div>

      {/* Right side - Controls */}
      <div className="flex items-center gap-1">
        <Select value={view} onValueChange={(value: "day" | "week" | "month") => onViewChange(value)}>
          <SelectTrigger className="hover:bg-muted h-8 w-24 border-0 shadow-none">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Day</SelectItem>
            <SelectItem value="week">Week</SelectItem>
            <SelectItem value="month">Month</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="ghost"
          size="icon"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="hover:bg-muted h-8 w-8"
        >
          <FontAwesomeIcon icon={faRefresh} className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
        </Button>

        <Button variant="ghost" size="icon" className="hover:bg-muted h-8 w-8">
          <FontAwesomeIcon icon={faCog} className="h-4 w-4" />
        </Button>

        <Link to="create" tabIndex={-1}>
          <Button className="h-8 gap-1 px-3 text-sm font-normal">
            <FontAwesomeIcon icon={faPlus} className="h-4 w-4" />
            <span className="hidden sm:inline">New Raid</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
