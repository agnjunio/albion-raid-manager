import * as React from "react";

import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "bg-background border-border text-foreground placeholder:text-muted-foreground",
        "flex min-h-[120px] w-full rounded-lg border px-4 py-3 text-base",
        "outline-none transition-all duration-200 ease-in-out",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "hover:border-border/80 hover:shadow-sm",
        "focus-visible:border-primary focus-visible:ring-primary/20 focus-visible:shadow-md focus-visible:ring-2",
        "aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20",
        "resize-none",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
