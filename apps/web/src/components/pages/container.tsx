import { cn } from "@albion-raid-manager/common/helpers/classNames";
import { ReactNode } from "react";

interface Props {
  className?: string;
  children: ReactNode;
}

export function Container({ className, children }: Props) {
  return <main className={cn("bg-gray-500/10 dark:bg-gray-200/5 overflow-auto", className)}>{children}</main>;
}
