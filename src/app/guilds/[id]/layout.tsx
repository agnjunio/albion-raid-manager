import Link from "next/link";
import React from "react";

type LayoutProps = {
  params: Promise<{
    id: string;
  }>;
  children: React.ReactNode;
};

export default async function Layout({ params, children }: LayoutProps) {
  const { id } = await params;

  return (
    <div className="flex p-2">
      <div>
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

      <div className="grow">{children}</div>
    </div>
  );
}
