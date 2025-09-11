import * as React from "react";

import { type IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: IconDefinition;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: IconDefinition;
  };
  className?: string;
  size?: "sm" | "md" | "lg";
}

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ icon, title, description, action, className, size = "md", ...props }, ref) => {
    const sizeClasses = {
      sm: {
        container: "py-8",
        icon: "h-12 w-12",
        iconSize: "h-6 w-6",
        title: "text-base font-semibold",
        description: "text-sm",
        action: "sm",
      },
      md: {
        container: "py-12",
        icon: "h-16 w-16",
        iconSize: "h-8 w-8",
        title: "text-lg font-semibold",
        description: "text-base",
        action: "md",
      },
      lg: {
        container: "py-16",
        icon: "h-20 w-20",
        iconSize: "h-10 w-10",
        title: "text-xl font-semibold",
        description: "text-lg",
        action: "lg",
      },
    };

    const currentSize = sizeClasses[size];

    return (
      <div
        ref={ref}
        className={cn("flex flex-col items-center justify-center text-center", currentSize.container, className)}
        {...props}
      >
        {icon && (
          <div className={cn("bg-muted/30 flex items-center justify-center rounded-full", currentSize.icon)}>
            <FontAwesomeIcon icon={icon} className={cn("text-muted-foreground", currentSize.iconSize)} />
          </div>
        )}

        <div className="mt-4 space-y-2">
          <h3 className={cn("text-foreground", currentSize.title)}>{title}</h3>
          <p className={cn("text-muted-foreground max-w-md", currentSize.description)}>{description}</p>
        </div>

        {action && (
          <div className="mt-6">
            <Button
              onClick={action.onClick}
              size={currentSize.action as "sm" | "md" | "lg"}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {action.icon && <FontAwesomeIcon icon={action.icon} className="mr-2 h-4 w-4" />}
              {action.label}
            </Button>
          </div>
        )}
      </div>
    );
  },
);

EmptyState.displayName = "EmptyState";

export { EmptyState };
