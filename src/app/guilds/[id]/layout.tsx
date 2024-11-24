import Link from "next/link";
import React from "react";

type LayoutProps = {
  children: React.ReactNode;
};

export default async function Layout({ children }: LayoutProps) {
  return (
    <div className="flex p-2">
      <div>
        <ul>
          <li>
            <Link href="raids">Raids</Link>
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
