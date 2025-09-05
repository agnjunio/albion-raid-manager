import type { Raid } from "@albion-raid-manager/core/types";

import React, { useMemo } from "react";

import { cn } from "@albion-raid-manager/core/helpers";
import { faClock } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { RaidEventCard } from "./raid-event-card";

interface CalendarGridProps {
  raids: Raid[];
  currentDate: Date;
  view: "day" | "week" | "month";
}

export function CalendarGrid({ raids, currentDate, view }: CalendarGridProps) {
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      slots.push({
        hour,
        time: `${hour.toString().padStart(2, "0")}:00`,
        displayTime:
          hour === 0 ? "12:00 AM" : hour < 12 ? `${hour}:00 AM` : hour === 12 ? "12:00 PM" : `${hour - 12}:00 PM`,
      });
    }
    return slots;
  }, []);

  const getDaysForView = () => {
    const days = [];

    switch (view) {
      case "day": {
        days.push(new Date(currentDate));
        break;
      }
      case "week": {
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
        for (let i = 0; i < 7; i++) {
          const day = new Date(startOfWeek);
          day.setDate(startOfWeek.getDate() + i);
          days.push(day);
        }
        break;
      }
      case "month": {
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const startOfCalendar = new Date(startOfMonth);
        startOfCalendar.setDate(startOfMonth.getDate() - startOfMonth.getDay());

        for (let i = 0; i < 42; i++) {
          const day = new Date(startOfCalendar);
          day.setDate(startOfCalendar.getDate() + i);
          days.push(day);
        }
        break;
      }
    }

    return days;
  };

  const getRaidsForDay = (date: Date) => {
    return raids.filter((raid) => {
      const raidDate = new Date(raid.date);
      return (
        raidDate.getFullYear() === date.getFullYear() &&
        raidDate.getMonth() === date.getMonth() &&
        raidDate.getDate() === date.getDate()
      );
    });
  };

  const getRaidsForTimeSlot = (date: Date, hour: number) => {
    const dayRaids = getRaidsForDay(date);
    return dayRaids.filter((raid) => {
      const raidDate = new Date(raid.date);
      return raidDate.getHours() === hour;
    });
  };

  const days = getDaysForView();

  if (view === "month") {
    return (
      <div className="flex-1 overflow-auto">
        <div className="bg-border grid grid-cols-7 gap-px">
          {/* Month view header */}
          <div className="bg-muted p-2 text-center text-sm font-medium">Sun</div>
          <div className="bg-muted p-2 text-center text-sm font-medium">Mon</div>
          <div className="bg-muted p-2 text-center text-sm font-medium">Tue</div>
          <div className="bg-muted p-2 text-center text-sm font-medium">Wed</div>
          <div className="bg-muted p-2 text-center text-sm font-medium">Thu</div>
          <div className="bg-muted p-2 text-center text-sm font-medium">Fri</div>
          <div className="bg-muted p-2 text-center text-sm font-medium">Sat</div>

          {days.map((day, index) => {
            const dayRaids = getRaidsForDay(day);
            const isCurrentMonth = day.getMonth() === currentDate.getMonth();
            const isToday = day.toDateString() === new Date().toDateString();

            return (
              <div
                key={index}
                className={cn(
                  "bg-background min-h-24 p-2",
                  !isCurrentMonth && "text-muted-foreground",
                  isToday && "bg-primary/5 ring-primary ring-1",
                )}
              >
                <div className="flex items-center justify-between">
                  <span className={cn("text-sm", isToday && "font-semibold")}>{day.getDate()}</span>
                  {dayRaids.length > 0 && (
                    <span className="text-muted-foreground text-xs">
                      {dayRaids.length} raid{dayRaids.length !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
                <div className="mt-1 space-y-1">
                  {dayRaids.slice(0, 3).map((raid) => (
                    <RaidEventCard key={raid.id} raid={raid} variant="compact" className="text-xs" />
                  ))}
                  {dayRaids.length > 3 && (
                    <div className="text-muted-foreground text-xs">+{dayRaids.length - 3} more</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background flex flex-1 overflow-hidden">
      {/* Time column - Hidden on mobile for day/week views */}
      <div
        className={cn(
          "bg-muted/20 border-border/30 flex-shrink-0 border-r-2",
          view === "month" ? "hidden" : "w-16 sm:w-20",
        )}
      >
        <div className="bg-muted/40 border-border/30 flex h-12 items-center justify-center border-b">
          <FontAwesomeIcon icon={faClock} className="text-muted-foreground h-4 w-4" />
        </div>
        {timeSlots.map((slot) => (
          <div
            key={slot.hour}
            className="text-muted-foreground border-border/30 flex h-12 items-center justify-center border-b font-mono text-xs"
          >
            {slot.hour.toString().padStart(2, "0")}:00
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="flex-1 overflow-auto">
        <div
          className="bg-border/30 grid min-h-full gap-px"
          style={{
            gridTemplateColumns: `repeat(${days.length}, 1fr)`,
            gridTemplateRows: `repeat(${timeSlots.length + 1}, 48px)`,
          }}
        >
          {/* Day headers */}
          {days.map((day, index) => (
            <div
              key={`header-${index}`}
              className="bg-muted/60 border-border/50 sticky top-0 z-10 flex h-12 flex-col justify-center border-b-2 text-center shadow-sm"
            >
              <div className="text-sm font-semibold">{day.toLocaleDateString("en-US", { weekday: "short" })}</div>
              <div className="text-muted-foreground mt-1 text-xs">{day.getDate()}</div>
            </div>
          ))}

          {/* Time slots */}
          {timeSlots.map((slot) => (
            <React.Fragment key={slot.hour}>
              {days.map((day, dayIndex) => {
                const timeSlotRaids = getRaidsForTimeSlot(day, slot.hour);
                const isToday = day.toDateString() === new Date().toDateString();

                return (
                  <div
                    key={`${slot.hour}-${dayIndex}`}
                    className={cn(
                      "bg-background border-border/20 hover:bg-muted/20 flex h-12 items-start border-b p-2 transition-colors",
                      isToday && "bg-primary/10 border-primary/20",
                    )}
                  >
                    <div className="w-full space-y-1">
                      {timeSlotRaids.map((raid) => (
                        <RaidEventCard key={raid.id} raid={raid} variant="time-slot" />
                      ))}
                    </div>
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
