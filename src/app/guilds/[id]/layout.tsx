import Link from "next/link";
import React, { Suspense } from "react";

type LayoutProps = {
  params: {
    id: string;
  };
  children: React.ReactNode;
};

export default function Layout({ params, children }: LayoutProps) {
  const { id } = params;

  return (
    <div className="flex p-2">
      <div className="sidebar">
        <ul>
          <li>
            <Link href={`/guilds/${id}/raids`}>Raids</Link>
          </li>
          <li>
            <Link href="compositions">Compositions</Link>
          </li>
          <li>
            <Link href="builds">Builds</Link>
          </li>
          <li>
            <Link href="settings">Settings</Link>
          </li>
        </ul>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <div className="grow">{children}</div>
      </Suspense>
    </div>
  );
}
