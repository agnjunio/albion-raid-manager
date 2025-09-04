import * as React from "react";

import { cn } from "@albion-raid-manager/core/helpers";
import { type VariantProps, cva } from "class-variance-authority";

const badgeVariants = cva("ring-current/10 inline-flex items-center rounded-full font-medium ring-1 ring-inset", {
  variants: {
    variant: {
      default: "bg-primary text-primary-foreground",
      secondary: "bg-secondary text-secondary-foreground",
      outline: "border border-input bg-background text-foreground",
      destructive: "bg-destructive text-destructive-foreground",
    },
    size: {
      default: "px-2.5 py-0.5 text-xs",
      xs: "px-1.5 py-0.5 text-[10px]",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

interface BadgeProps extends React.ComponentProps<"div">, VariantProps<typeof badgeVariants> {}

function Badge({ variant = "default", size = "default", className, ...props }: BadgeProps) {
  return <div data-slot="badge" className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}

export { Badge };
