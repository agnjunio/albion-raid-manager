import { getErrorMessage } from "@albion-raid-manager/common/errors";
import { prisma } from "@albion-raid-manager/database";
import logger from "@albion-raid-manager/logger";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_request: NextRequest) {
  try {
    const guilds = await prisma.guild.findMany({});

    return NextResponse.json(guilds);
  } catch (error) {
    logger.error(`Failed to retrieve guilds. (${getErrorMessage(error)})`, { error });
    return NextResponse.json({ message: "Failed to retrieve guilds" }, { status: 500 });
  }
}
