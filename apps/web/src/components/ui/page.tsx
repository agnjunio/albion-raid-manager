import { PropsWithChildren } from "react";

export function Page({ children }: PropsWithChildren) {
  return <div className="flex h-full grow flex-col gap-4 px-4 py-2">{children}</div>;
}

export function PageTitle({ children }: PropsWithChildren) {
  return <h2 className="font-title text-center text-2xl font-normal">{children}</h2>;
}
