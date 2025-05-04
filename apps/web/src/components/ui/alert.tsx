import { cn } from "@albion-raid-manager/common/helpers/classNames";
import React from "react";

interface Props {
  children: React.ReactNode;
  className?: string;
}

export default function Alert({ children, className }: Props) {
  return <div className={cn("rounded-md bg-red-500 p-2 text-red-100", className)}>{children}</div>;
}
