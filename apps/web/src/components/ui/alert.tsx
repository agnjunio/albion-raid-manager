import React from "react";

import { cn } from "@/lib/utils";

interface Props {
  children: React.ReactNode;
  className?: string;
  variant?: "info" | "warning" | "error";
}

export default function Alert({ children, className, variant = "error" }: Props) {
  const variantClassName = {
    info: "bg-info dark:bg-info/90 text-info-foreground",
    warning: "bg-warning/50 text-warning-foreground",
    error: "bg-destructive/50 text-destructive-foreground",
  }[variant];

  return <div className={cn("rounded-md p-3", variantClassName, className)}>{children}</div>;
}
