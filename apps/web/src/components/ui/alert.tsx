import { cn } from "@albion-raid-manager/common/helpers/classNames";
import React from "react";

interface Props {
  children: React.ReactNode;
}

export default function Alert({ children }: Props) {
  return <div className={cn("rounded-md bg-red-500 p-2 text-red-100")}>{children}</div>;
}
