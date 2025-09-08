import React from "react";

import { cn } from "@/lib/utils";

interface Props {
  children: React.ReactNode;
  className?: string;
  variant?: "info" | "warning" | "error";
}

export default function Alert({ children, className, variant = "error" }: Props) {
  const variantClassName = {
    info: "bg-blue-50 p-3 dark:bg-blue-950 text-blue-800 dark:text-blue-200",
    warning: "bg-yellow-500 text-yellow-50",
    error: "bg-red-500 text-red-100",
  }[variant];

  return <div className={cn("rounded-md p-2", variantClassName, className)}>{children}</div>;
}
