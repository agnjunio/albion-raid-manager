import { getErrorMessage } from "@albion-raid-manager/common/errors";
import { prisma } from "@albion-raid-manager/database";
import logger from "@albion-raid-manager/logger";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const guildId = url.searchParams.get("guildId");

    const raids = await prisma.raid.findMany({
      where: {
        guildId: Number(guildId),
      },
    });

    return NextResponse.json(raids);
  } catch (error) {
    logger.error(`Failed to retrieve raids. (${getErrorMessage(error)})`, { error });
    return NextResponse.json({ message: "Failed to retrieve raids" }, { status: 500 });
  }
}
