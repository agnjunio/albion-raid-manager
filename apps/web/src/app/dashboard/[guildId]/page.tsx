"use client";

import { useDashboardContext } from "../context";

export default function Page() {
  const { selectedGuild } = useDashboardContext();

  return <div>Guild: {selectedGuild?.name}</div>;
}
