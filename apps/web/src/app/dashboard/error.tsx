"use client";

import Alert from "@/components/ui/alert";

export default function Error() {
  return (
    <div className="flex justify-center items-center size-full flex-col gap-2">
      <Alert>Something went wrong. Please try again.</Alert>
    </div>
  );
}
