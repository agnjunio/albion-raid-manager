import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function SettingsLoading() {
  return (
    <div className="space-y-6">
      {/* Header Card Skeleton */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="from-muted/30 to-muted/10 bg-gradient-to-r pb-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Form Card Skeleton */}
      <Card className="border-border/50 shadow-sm">
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <Skeleton className="h-5 w-48" />
              </div>
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-4 w-96" />
            </div>

            <div className="border-border border-t pt-6">
              <div className="flex flex-col gap-3 sm:flex-row">
                <Skeleton className="h-12 flex-1" />
                <Skeleton className="h-12 flex-1" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function SettingsSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="flex flex-col items-center gap-4">
        <FontAwesomeIcon icon={faSpinner} className="text-primary h-8 w-8 animate-spin" />
        <p className="text-muted-foreground text-sm">Loading settings...</p>
      </div>
    </div>
  );
}
