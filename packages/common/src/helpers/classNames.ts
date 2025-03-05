import clsx from "clsx";
import { twMerge } from "tailwind-merge";

export default function cn(...classes: clsx.ClassValue[]) {
  return twMerge(clsx(...classes));
}
