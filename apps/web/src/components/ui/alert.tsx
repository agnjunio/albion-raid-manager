import { cn } from "@albion-raid-manager/common/helpers/classNames";
import React from "react";

interface Props {
  children: React.ReactNode;
}

export default function Alert({ children }: Props) {
  return <div className={cn("text-red-100 p-2 bg-red-500 rounded-md")}>{children}</div>;
}
