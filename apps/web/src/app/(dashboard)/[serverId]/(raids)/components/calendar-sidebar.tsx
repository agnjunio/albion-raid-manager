import { faFilter, faUsers } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/datetime-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { raidStatuses } from "@/lib/constants";

import { useCalendar } from "../contexts/calendar-context";

export function CalendarSidebar() {
  const { raids, currentDate, filters, setCurrentDate, setFilters } = useCalendar();

  const getRaidStats = () => {
    const total = raids.length;
    const scheduled = raids.filter((r) => r.status === "SCHEDULED").length;
    const open = raids.filter((r) => r.status === "OPEN").length;
    const ongoing = raids.filter((r) => r.status === "ONGOING").length;
    const finished = raids.filter((r) => r.status === "FINISHED").length;
    const cancelled = raids.filter((r) => r.status === "CANCELLED").length;

    return { total, scheduled, open, ongoing, finished, cancelled };
  };

  const stats = getRaidStats();

  const handleStatusFilter = (status: string, checked: boolean) => {
    const newStatuses = checked ? [...filters.status, status] : filters.status.filter((s) => s !== status);

    setFilters({ ...filters, status: newStatuses });
  };

  const isQuickFilterActive = (statuses: string[]) => {
    return statuses.length === filters.status.length && statuses.every((status) => filters.status.includes(status));
  };

  const handleQuickFilter = (statuses: string[]) => {
    if (isQuickFilterActive(statuses)) {
      setFilters({ ...filters, status: [] });
    } else {
      setFilters({ ...filters, status: statuses });
    }
  };

  const handleSearchChange = (search: string) => {
    setFilters({ ...filters, search });
  };

  const clearFilters = () => {
    setFilters({ status: [], type: [], search: "" });
  };

  const hasActiveFilters = filters.status.length > 0 || filters.type.length > 0 || filters.search.length > 0;

  return (
    <div className="space-y-4 p-4 pb-6">
      {/* Calendar */}
      <Card className="p-2">
        <Calendar
          mode="single"
          selected={currentDate}
          onSelect={(date) => {
            if (date) {
              setCurrentDate(date);
            }
          }}
          className="rounded-md border-0 p-2"
          hideNavigation
          footer={false}
        />
      </Card>

      {/* Raid Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <FontAwesomeIcon icon={faUsers} className="h-4 w-4" />
            Raid Statistics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <div className="mb-4 flex justify-between text-sm font-semibold">
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
          <div className="flex justify-between text-sm">
            <span className="text-red-600">Cancelled</span>
            <span className="font-medium">{stats.cancelled}</span>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
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
        <CardContent className="space-y-3">
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
                variant={isQuickFilterActive(["SCHEDULED", "OPEN"]) ? "primary" : "outline"}
                size="sm"
                className="h-7 text-xs"
                onClick={() => handleQuickFilter(["SCHEDULED", "OPEN"])}
              >
                Upcoming
              </Button>
              <Button
                variant={isQuickFilterActive(["ONGOING"]) ? "primary" : "outline"}
                size="sm"
                className="h-7 text-xs"
                onClick={() => handleQuickFilter(["ONGOING"])}
              >
                Active
              </Button>
              <Button
                variant={isQuickFilterActive(["FINISHED"]) ? "primary" : "outline"}
                size="sm"
                className="h-7 text-xs"
                onClick={() => handleQuickFilter(["FINISHED"])}
              >
                Completed
              </Button>
              <Button
                variant={isQuickFilterActive(["CANCELLED"]) ? "primary" : "outline"}
                size="sm"
                className="h-7 text-xs"
                onClick={() => handleQuickFilter(["CANCELLED"])}
              >
                Cancelled
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
