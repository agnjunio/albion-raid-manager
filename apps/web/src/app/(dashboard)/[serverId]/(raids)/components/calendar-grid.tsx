import { useMemo } from "react";

import { cn } from "@/lib/utils";
import { faClock } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { useCalendar, CalendarView } from "@/app/(dashboard)/[serverId]/(raids)/contexts/calendar-context";

import { RaidEventCard } from "./raid-event-card";

interface CalendarGridProps {
  onTimeSlotClick?: (date: Date, hour: number) => void;
}

export function CalendarGrid({ onTimeSlotClick }: CalendarGridProps = {}) {
  const { filteredRaids: raids, currentDate, view, setCurrentDate, setView } = useCalendar();
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
      case CalendarView.DAY: {
        days.push(new Date(currentDate));
        break;
      }
      case CalendarView.WEEK: {
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
        for (let i = 0; i < 7; i++) {
          const day = new Date(startOfWeek);
          day.setDate(startOfWeek.getDate() + i);
          days.push(day);
        }
        break;
      }
      case CalendarView.MONTH: {
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
      const raidHour = raidDate.getHours();
      // Include raids that start in this hour or span into this hour
      return raidHour === hour;
    });
  };

  const handleDayClick = (day: Date) => {
    setCurrentDate(day);
    setView(CalendarView.WEEK);
  };

  const days = getDaysForView();

  if (view === CalendarView.MONTH) {
    return (
      <div className="primary-scrollbar h-full overflow-y-auto">
        <div className="bg-border grid min-h-full grid-cols-7 gap-px">
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
                  "bg-background hover:bg-primary/25 min-h-31 cursor-pointer p-2 transition-colors",
                  !isCurrentMonth && "text-muted-foreground",
                  isToday && "bg-primary/5 ring-primary ring-1",
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDayClick(day);
                }}
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
    <div className="bg-background primary-scrollbar relative flex h-full flex-col overflow-y-auto overflow-x-hidden">
      {/* Header */}
      <div className="sticky top-0 z-30 w-full">
        <div
          className="bg-background grid shadow-sm"
          style={{ gridTemplateColumns: `80px repeat(${days.length}, 1fr)` }}
        >
          {/* Time column header */}
          <div className="bg-muted/30 border-border/30 flex h-12 items-center justify-center border-b-2 border-r-2">
            <FontAwesomeIcon icon={faClock} className="text-muted-foreground h-4 w-4" />
          </div>

          {/* Day headers */}
          {days.map((day, index) => {
            const isToday = day.toDateString() === new Date().toDateString();

            return (
              <div
                key={`header-${index}`}
                className={cn(
                  "bg-background border-border/50 flex h-12 flex-col justify-center border-b-2 text-center",
                  isToday && "bg-primary/5 border-primary/20",
                )}
              >
                <div className="text-sm font-semibold">{day.toLocaleDateString("en-US", { weekday: "short" })}</div>
                <div className={cn("mt-1 text-xs", isToday ? "text-primary" : "text-muted-foreground")}>
                  {day.getDate()}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Calendar content */}
      <div className="relative w-full">
        {timeSlots.map((slot) => {
          const currentTime = new Date();
          const isCurrentHour = slot.hour === currentTime.getHours();
          const currentMinutes = currentTime.getMinutes();
          const currentSeconds = currentTime.getSeconds();
          const positionInSlot = ((currentMinutes + currentSeconds / 60) / 60) * 100;

          const shouldShowCurrentTime = (() => {
            const today = new Date();
            const todayString = today.toDateString();

            if (view === CalendarView.DAY) {
              return currentDate.toDateString() === todayString;
            } else if (view === CalendarView.WEEK) {
              return days.some((day) => day.toDateString() === todayString);
            }

            return false;
          })();

          return (
            <div
              key={slot.hour}
              className="bg-background hover:bg-muted/5 relative grid"
              style={{ gridTemplateColumns: `80px repeat(${days.length}, 1fr)` }}
            >
              {/* Current time line for this hour */}
              {isCurrentHour && shouldShowCurrentTime && (
                <div
                  className="pointer-events-none absolute left-0 right-0 z-10"
                  style={{
                    top: `${positionInSlot}%`,
                  }}
                >
                  <div className="flex h-0">
                    {/* Time column indicator */}
                    <div className="flex w-20 items-center">
                      <div className="bg-primary/50 h-[2px] w-full"></div>
                    </div>
                    {/* Day columns indicator */}
                    <div className="flex flex-1">
                      {days.map((_, dayIndex) => {
                        return (
                          <div key={dayIndex} className="flex flex-1 items-center">
                            <div className={cn("bg-primary/50 h-[2px] w-full")}></div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Time column cell */}
              <div className="bg-muted/20 text-muted-foreground border-border/30 flex min-h-14 items-center justify-center border-b font-mono text-xs">
                {slot.hour.toString().padStart(2, "0")}:00
              </div>

              {/* Day cells */}
              {days.map((day, dayIndex) => {
                const timeSlotRaids = getRaidsForTimeSlot(day, slot.hour);
                const isToday = day.toDateString() === new Date().toDateString();

                return (
                  <div
                    key={`${slot.hour}-${dayIndex}`}
                    className={cn(
                      "border-border/20 hover:bg-primary/20 border-b p-1 transition-colors",
                      isToday && "bg-primary/5 border-primary/10",
                      onTimeSlotClick && "hover:bg-primary/10 group cursor-pointer",
                    )}
                    onClick={() => onTimeSlotClick?.(day, slot.hour)}
                  >
                    <div className="space-y-1">
                      {timeSlotRaids.map((raid) => (
                        <RaidEventCard key={raid.id} raid={raid} variant="time-slot" />
                      ))}
                      {timeSlotRaids.length === 0 && onTimeSlotClick && (
                        <div className="text-muted-foreground/50 text-xs opacity-0 transition-opacity group-hover:opacity-100">
                          Click to create raid
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
