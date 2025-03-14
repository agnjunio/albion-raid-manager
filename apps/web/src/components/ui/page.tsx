import { cn } from "@albion-raid-manager/common/helpers/classNames";
import { PropsWithChildren } from "react";

export function Page({ children }: PropsWithChildren) {
  return <div className="flex h-full grow flex-col gap-4 p-4">{children}</div>;
}

export function PageTitle({ children, className }: { className?: string } & PropsWithChildren) {
  return <h2 className={cn("font-title text-center text-2xl font-normal", className)}>{children}</h2>;
}
