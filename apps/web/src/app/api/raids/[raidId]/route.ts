import { getErrorMessage } from "@albion-raid-manager/common/utils";
import { prisma } from "@albion-raid-manager/database";
import logger from "@albion-raid-manager/logger";
import { NextRequest, NextResponse } from "next/server";
import { RaidRouteProps } from "./types";

export async function GET(req: NextRequest, { params }: RaidRouteProps) {
  try {
    const raidId = (await params).raidId;

    const raid = await prisma.raid.findUnique({
      where: {
        id: Number(raidId),
      },
      include: {
        slots: {
          include: {
            build: true,
            user: true,
          },
        },
      },
    });

    return NextResponse.json(raid);
  } catch (error) {
    logger.error(`Failed to retrieve raid. (${getErrorMessage(error)})`, { error, req });
    return NextResponse.json({ message: "Failed to retrieve raid" }, { status: 500 });
  }
}
