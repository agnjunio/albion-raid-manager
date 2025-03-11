import { NextResponse } from "next/server";

export async function createGuild(serverId: string) {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return NextResponse.json({
    status: 200,
    body: {
      serverId,
    },
  });
}
