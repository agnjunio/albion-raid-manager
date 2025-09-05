import type { Raid } from "@albion-raid-manager/core/types";

import { useState } from "react";

import { faCalendar, faFilter, faUsers } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { raidStatuses } from "@/lib/constants";

interface CalendarSidebarProps {
  raids: Raid[];
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onFilterChange: (filters: RaidFilters) => void;
  filters: RaidFilters;
}

interface RaidFilters {
  status: string[];
  type: string[];
  search: string;
}

export function CalendarSidebar({ raids, currentDate, onDateChange, onFilterChange, filters }: CalendarSidebarProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const getRaidStats = () => {
    const total = raids.length;
    const scheduled = raids.filter((r) => r.status === "SCHEDULED").length;
    const open = raids.filter((r) => r.status === "OPEN").length;
    const ongoing = raids.filter((r) => r.status === "ONGOING").length;
    const finished = raids.filter((r) => r.status === "FINISHED").length;

    return { total, scheduled, open, ongoing, finished };
  };

  const stats = getRaidStats();

  const handleStatusFilter = (status: string, checked: boolean) => {
    const newStatuses = checked ? [...filters.status, status] : filters.status.filter((s) => s !== status);

    onFilterChange({ ...filters, status: newStatuses });
  };

  const handleSearchChange = (search: string) => {
    onFilterChange({ ...filters, search });
  };

  const clearFilters = () => {
    onFilterChange({ status: [], type: [], search: "" });
  };

  const hasActiveFilters = filters.status.length > 0 || filters.type.length > 0 || filters.search.length > 0;

  return (
    <div className="space-y-6 p-6 pb-8">
      {/* Mini Calendar */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <FontAwesomeIcon icon={faCalendar} className="h-4 w-4" />
            Calendar
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start rounded-none border-0 text-left font-normal">
                {currentDate.toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
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
        </CardContent>
      </Card>

      {/* Raid Statistics */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <FontAwesomeIcon icon={faUsers} className="h-4 w-4" />
            Raid Statistics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Total Raids</span>
            <span className="font-medium">{stats.total}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-blue-600">Scheduled</span>
            <span className="font-medium">{stats.scheduled}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-green-600">Open</span>
            <span className="font-medium">{stats.open}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-yellow-600">Ongoing</span>
            <span className="font-medium">{stats.ongoing}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Finished</span>
            <span className="font-medium">{stats.finished}</span>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <FontAwesomeIcon icon={faFilter} className="h-4 w-4" />
              Filters
            </CardTitle>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="h-6 px-2 text-xs">
                Clear
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="search" className="text-xs">
              Search raids
            </Label>
            <Input
              id="search"
              placeholder="Search by title or description..."
              value={filters.search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="h-8"
            />
          </div>

          <Separator />

          {/* Status Filter */}
          <div className="space-y-2">
            <Label className="text-xs">Status</Label>
            <div className="space-y-2">
              {Object.entries(raidStatuses).map(([status, statusData]) => {
                if (status === "ALL") return null;

                return (
                  <div key={status} className="flex items-center space-x-2">
                    <Checkbox
                      id={`status-${status}`}
                      checked={filters.status.includes(status)}
                      onCheckedChange={(checked) => handleStatusFilter(status, checked as boolean)}
                    />
                    <Label htmlFor={`status-${status}`} className="flex cursor-pointer items-center gap-2 text-xs">
                      <FontAwesomeIcon icon={statusData.icon} className="h-3 w-3" />
                      {status}
                    </Label>
                  </div>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Quick Filters */}
          <div className="space-y-2">
            <Label className="text-xs">Quick Filters</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={() => onFilterChange({ ...filters, status: ["SCHEDULED", "OPEN"] })}
              >
                Upcoming
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={() => onFilterChange({ ...filters, status: ["ONGOING"] })}
              >
                Active
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={() => onFilterChange({ ...filters, status: ["FINISHED"] })}
              >
                Completed
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={() => onFilterChange({ ...filters, status: ["CLOSED"] })}
              >
                Closed
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
