import type { Raid } from "@albion-raid-manager/types";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { faClock } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

import { CalendarView, useCalendar } from "@/app/(dashboard)/[serverId]/(raids)/contexts/calendar-context";
import { getShortWeekdayName } from "@/lib/locale";
import { cn } from "@/lib/utils";
import { useUpdateRaidMutation } from "@/store/raids";

import { RaidEventCard } from "./raid-event-card";

export function CalendarGrid() {
  const { view } = useCalendar();
  const { serverId } = useParams<{ serverId: string }>();
  const { t } = useTranslation();
  const [updateRaid] = useUpdateRaidMutation();
  const [activeRaid, setActiveRaid] = useState<Raid | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveRaid(event.active.data.current?.raid);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveRaid(null);
    const { active, over } = event;

    if (!active.data.current?.raid || !over?.data.current) {
      return;
    }

    const raid = active.data.current.raid;
    const targetDate = over.data.current.date;
    const targetHour = over.data.current.hour;

    if (!targetDate) {
      return;
    }

    const originalDate = new Date(raid.date);
    const newDate = new Date(targetDate);
    newDate.setHours(targetHour ?? originalDate.getHours(), 0, 0, 0);

    if (newDate.getTime() === originalDate.getTime()) {
      return;
    }

    try {
      if (!serverId) {
        throw new Error("Server ID is required");
      }

      await updateRaid({
        params: {
          serverId,
          raidId: raid.id,
        },
        body: {
          date: newDate,
        },
      }).unwrap();

      toast.success(t("toasts.raid.updated"), {
        description: t("toasts.raid.dateUpdatedDescription"),
      });
    } catch {
      toast.error(t("toasts.raid.updateError"), {
        description: t("toasts.raid.dateUpdateErrorDescription"),
      });
    }
  };

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd} sensors={sensors}>
      {view === CalendarView.DAY && <CalendarGridDayAndWeek />}
      {view === CalendarView.WEEK && <CalendarGridDayAndWeek />}
      {view === CalendarView.MONTH && <CalendarGridMonth />}

      <DragOverlay>
        {activeRaid ? (
          <RaidEventCard
            raid={activeRaid}
            variant="time-slot"
            className="scale-105 cursor-grabbing opacity-90 shadow-lg"
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

interface CalendarGridTimeSlotProps {
  date: Date;
  hour: number;
}

function CalendarGridTimeSlot({ date, hour }: CalendarGridTimeSlotProps) {
  const { handleTimeSlotClick } = useCalendar();
  const { t } = useTranslation();
  const { raids, isRaidFiltered } = useCalendar();
  const { setNodeRef, isOver } = useDroppable({
    id: `${hour}-${date.getDate()}`,
    data: { date: date.toISOString(), hour },
  });
  const isToday = date.toDateString() === new Date().toDateString();

  const timeSlotRaids = useMemo(() => {
    return raids.filter((raid) => {
      const raidDate = new Date(raid.date);
      const raidHour = raidDate.getHours();
      return (
        raidDate.getFullYear() === date.getFullYear() &&
        raidDate.getMonth() === date.getMonth() &&
        raidDate.getDate() === date.getDate() &&
        raidHour === hour
      );
    });
  }, [date, hour, raids]);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "border-border/20 hover:bg-primary/20 border-b p-1 transition-colors",
        isToday && "bg-foreground/5 border-primary/10",
        "hover:bg-primary/10 group cursor-pointer",
        isOver && "bg-primary/20 border-primary/50 ring-primary/30 ring-2",
      )}
      onClick={() => handleTimeSlotClick(date, hour)}
    >
      <div className="space-y-1">
        {timeSlotRaids.map((raid) => (
          <RaidEventCard
            key={raid.id}
            raid={raid}
            variant="time-slot"
            className={isRaidFiltered(raid) ? "opacity-30" : ""}
          />
        ))}
        {timeSlotRaids.length === 0 && (
          <div className="text-muted-foreground/50 text-xs opacity-0 transition-opacity group-hover:opacity-100">
            {t("calendar.grid.clickToCreateRaid")}
          </div>
        )}
      </div>
    </div>
  );
}

function CalendarGridDayAndWeek() {
  const { currentDate, view } = useCalendar();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const hasScrolledToCurrentTimeRef = useRef(false);

  const days = useMemo(() => {
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
    }

    return days;
  }, [view, currentDate]);

  const currentTime = useMemo(() => {
    const currentTime = new Date();
    const currentHour = currentTime.getHours();
    const currentMinutes = currentTime.getMinutes();
    const currentSeconds = currentTime.getSeconds();
    const today = new Date();
    const todayString = today.toDateString();

    // Check if current time should be visible in this view
    const shouldShow = (() => {
      if (view === CalendarView.DAY) {
        return currentDate.toDateString() === todayString;
      } else if (view === CalendarView.WEEK) {
        return days.some((day) => day.toDateString() === todayString);
      }
      return false;
    })();

    // Calculate position within the current hour (0-100%)
    const positionTop = ((currentMinutes + currentSeconds / 60) / 60) * 100;

    return {
      shouldShow,
      currentHour,
      positionTop,
    };
  }, [view, currentDate, days]);

  const hourSlots = useMemo(() => {
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

  // Auto-scroll to current time on mount for non-month views
  useEffect(() => {
    if (!scrollContainerRef.current || !currentTime.shouldShow) {
      // Reset the scroll flag when view changes or when we shouldn't show current time
      hasScrolledToCurrentTimeRef.current = false;
      return;
    }

    // Only scroll if we haven't already scrolled to current time for this view
    if (hasScrolledToCurrentTimeRef.current) return;

    const scrollToCurrentTime = () => {
      const container = scrollContainerRef.current;
      if (!container) return;

      const { currentHour, positionTop } = currentTime;

      // Get the time slot element for the current hour
      const timeSlotElement = container.querySelector(`[data-hour="${currentHour}"]`) as HTMLElement;
      if (!timeSlotElement) return;

      // Calculate the scroll position
      const timeSlotRect = timeSlotElement.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const timeSlotHeight = timeSlotRect.height;

      // Calculate offset from top of the time slot based on position within the hour
      const offsetInSlot = (positionTop / 100) * timeSlotHeight;
      const scrollTop = timeSlotElement.offsetTop + offsetInSlot - containerRect.top - 100; // 100px offset from top

      // Smooth scroll to the calculated position
      container.scrollTo({
        top: Math.max(0, scrollTop),
        behavior: "smooth",
      });

      // Mark that we've scrolled to current time for this view
      hasScrolledToCurrentTimeRef.current = true;
    };

    // Small delay to ensure DOM is fully rendered
    const timeoutId = setTimeout(scrollToCurrentTime, 100);

    return () => clearTimeout(timeoutId);
  }, [view, currentTime]);

  return (
    <div
      ref={scrollContainerRef}
      className="bg-background primary-scrollbar relative flex h-full flex-col overflow-y-auto overflow-x-hidden"
    >
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
                  isToday && "bg-primary/35 border-primary/20",
                )}
              >
                <div className="text-sm font-semibold capitalize">{getShortWeekdayName(day)}</div>
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
        {hourSlots.map((slot) => {
          const isCurrentHour = slot.hour === currentTime.currentHour;
          const shouldShowCurrentTime = currentTime.shouldShow && isCurrentHour;

          return (
            <div
              key={slot.hour}
              data-hour={slot.hour}
              className="bg-background hover:bg-muted/5 relative grid"
              style={{ gridTemplateColumns: `80px repeat(${days.length}, 1fr)` }}
            >
              {/* Current time line for this hour */}
              {shouldShowCurrentTime && (
                <div
                  className="pointer-events-none absolute left-0 right-0 z-10"
                  style={{
                    top: `${currentTime.positionTop}%`,
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
              {days.map((day, dayIndex) => (
                <CalendarGridTimeSlot key={`${slot.hour}-${dayIndex}`} date={day} hour={slot.hour} />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CalendarGridDaySlot({ day }: { day: Date }) {
  const { raids, isRaidFiltered, currentDate, setCurrentDate, setView } = useCalendar();
  const { t } = useTranslation();
  const { setNodeRef, isOver } = useDroppable({
    id: `${day.getDate()}`,
    data: { date: day.toISOString() },
  });

  const getRaidsForDay = useCallback(
    (date: Date) => {
      return raids.filter((raid) => {
        const raidDate = new Date(raid.date);
        return (
          raidDate.getFullYear() === date.getFullYear() &&
          raidDate.getMonth() === date.getMonth() &&
          raidDate.getDate() === date.getDate()
        );
      });
    },
    [raids],
  );

  const handleDayClick = (day: Date) => {
    setCurrentDate(day);
    setView(CalendarView.WEEK);
  };

  const dayRaids = getRaidsForDay(day);
  const isCurrentMonth = day.getMonth() === currentDate.getMonth();
  const isToday = day.toDateString() === new Date().toDateString();

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "bg-background hover:bg-primary/25 min-h-31 cursor-pointer p-2 transition-colors",
        !isCurrentMonth && "text-muted-foreground",
        isToday && "bg-foreground/5 ring-primary ring-1",
        isOver && "bg-primary/20 border-primary/50 ring-primary/30 ring-2",
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
            {t("calendar.grid.raidCount", { count: dayRaids.length })}
          </span>
        )}
      </div>
      <div className="mt-1 space-y-1">
        {dayRaids.slice(0, 3).map((raid) => (
          <RaidEventCard
            key={raid.id}
            raid={raid}
            variant="compact"
            className={`text-xs ${isRaidFiltered(raid) ? "opacity-30" : ""}`}
          />
        ))}
        {dayRaids.length > 3 && (
          <div className="text-muted-foreground text-xs">
            {t("calendar.grid.moreRaids", { count: dayRaids.length - 3 })}
          </div>
        )}
      </div>
    </div>
  );
}

function CalendarGridMonth() {
  const { t } = useTranslation();
  const { currentDate } = useCalendar();

  const days = useMemo(() => {
    const days = [];
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const startOfCalendar = new Date(startOfMonth);
    startOfCalendar.setDate(startOfMonth.getDate() - startOfMonth.getDay());

    for (let i = 0; i < 42; i++) {
      const day = new Date(startOfCalendar);
      day.setDate(startOfCalendar.getDate() + i);
      days.push(day);
    }
    return days;
  }, [currentDate]);

  return (
    <div className="primary-scrollbar h-full overflow-y-auto">
      <div className="bg-border grid min-h-full grid-cols-7 gap-px">
        {/* Month view header */}
        <div className="bg-primary/30 p-2 text-center text-sm font-medium">{t("calendar.days.sun")}</div>
        <div className="bg-primary/30 p-2 text-center text-sm font-medium">{t("calendar.days.mon")}</div>
        <div className="bg-primary/30 p-2 text-center text-sm font-medium">{t("calendar.days.tue")}</div>
        <div className="bg-primary/30 p-2 text-center text-sm font-medium">{t("calendar.days.wed")}</div>
        <div className="bg-primary/30 p-2 text-center text-sm font-medium">{t("calendar.days.thu")}</div>
        <div className="bg-primary/30 p-2 text-center text-sm font-medium">{t("calendar.days.fri")}</div>
        <div className="bg-primary/30 p-2 text-center text-sm font-medium">{t("calendar.days.sat")}</div>

        {days.map((day, index) => {
          return <CalendarGridDaySlot key={index} day={day} />;
        })}
      </div>
    </div>
  );
}
