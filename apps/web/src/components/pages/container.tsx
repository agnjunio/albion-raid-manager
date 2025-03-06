import { PropsWithChildren } from "react";

export function Container({ children }: PropsWithChildren) {
  return <main className="bg-gray-500/10 dark:bg-gray-200/5 grow flex flex-col container">{children}</main>;
}
