"use client";

import { useParams } from "next/navigation";

export default function RaidPage() {
  const params = useParams();
  const { raidId } = params;

  return (
    <div>
      <h1>Raid Details</h1>
      <p>Raid ID: {raidId}</p>
      {/* Add more raid details and components here */}
    </div>
  );
}
