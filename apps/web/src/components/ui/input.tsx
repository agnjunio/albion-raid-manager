import * as React from "react";

import { cn } from "@albion-raid-manager/core/helpers";

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        data-slot="input"
        className={cn(
          "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground",
          "bg-background border-border text-foreground",
          "flex h-12 w-full min-w-0 rounded-lg border px-4 py-3 text-base",
          "outline-none transition-all duration-200 ease-in-out",
          "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium",
          "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
          "hover:border-border/80 hover:shadow-sm",
          "focus-visible:border-primary focus-visible:ring-primary/20 focus-visible:shadow-md focus-visible:ring-2",
          "aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20",
          "md:text-sm",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
