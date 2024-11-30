import { getErrorMessage } from "@albion-raid-manager/common/utils";
import { prisma } from "@albion-raid-manager/database";
import logger from "@albion-raid-manager/logger";
import { NextRequest, NextResponse } from "next/server";
import { CompositionRouteProps } from "./types";

export async function GET(req: NextRequest, { params }: CompositionRouteProps) {
  try {
    const compositionId = (await params).compositionId;

    const composition = await prisma.composition.findUnique({
      where: {
        id: Number(compositionId),
      },
      include: {
        slots: {
          include: {
            build: true,
          },
        },
      },
    });

    return NextResponse.json(composition);
  } catch (error) {
    logger.error(`Failed to retrieve composition. (${getErrorMessage(error)})`, { error, req });
    return NextResponse.json({ message: "Failed to retrieve composition." }, { status: 500 });
  }
}
