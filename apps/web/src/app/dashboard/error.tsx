"use client";

import Alert from "@/components/ui/alert";

export default function Error() {
  return (
    <div className="flex size-full flex-col items-center justify-center gap-2">
      <Alert>Something went wrong. Please try again.</Alert>
    </div>
  );
}
