import { PropsWithChildren } from "react";

export function Page({ children }: PropsWithChildren) {
  return <div className="grow h-full flex flex-col px-4">{children}</div>;
}

export function PageTitle({ children }: PropsWithChildren) {
  return <h2 className="text-2xl font-semibold text-center py-4">{children}</h2>;
}
