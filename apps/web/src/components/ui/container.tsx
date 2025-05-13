import type { ReactNode } from "react";

import { cn } from "@albion-raid-manager/core/helpers";

interface Props {
  className?: string;
  children: ReactNode;
}

export function Container({ className, children }: Props) {
  return <main className={cn("overflow-auto bg-gray-500/10 dark:bg-gray-200/5", className)}>{children}</main>;
}
