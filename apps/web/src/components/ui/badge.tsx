import * as React from "react";

import { cn } from "@albion-raid-manager/core/helpers";

interface BadgeProps extends React.ComponentProps<"div"> {
  variant?: "default" | "secondary" | "outline" | "destructive";
}

function Badge({ variant = "default", className, ...props }: BadgeProps) {
  const variantClass = {
    default: "bg-primary text-primary-foreground",
    secondary: "bg-secondary text-secondary-foreground",
    outline: "border border-input bg-background text-foreground",
    destructive: "bg-destructive text-destructive-foreground",
  }[variant];

  return (
    <div
      data-slot="badge"
      className={cn(
        "ring-current/10 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        variantClass,
        className,
      )}
      {...props}
    />
  );
}

export { Badge };
