import { getErrorMessage } from "@albion-raid-manager/common/utils";
import { prisma } from "@albion-raid-manager/database";
import { PrismaClientValidationError } from "@albion-raid-manager/database/errors";
import logger from "@albion-raid-manager/logger";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
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

export async function POST(req: NextRequest) {
  try {
    const { guildId, description, date, compositionId } = await req.json();

    const guild = await prisma.guild.findUnique({
      where: {
        id: guildId,
      },
    });

    if (!guild) return NextResponse.json({ message: "Guild not found" }, { status: 404 });

    const composition = await prisma.composition.findUnique({
      where: {
        id: compositionId,
      },
      include: {
        slots: true,
      },
    });

    if (!composition) return NextResponse.json({ message: "Composition not found" }, { status: 404 });

    const raid = await prisma.raid.create({
      data: {
        description,
        date: new Date(date),
        guildId,
        slots: {
          create: composition.slots.map((slot) => ({
            buildId: slot.buildId,
          })),
        },
      },
    });

    return NextResponse.json(raid, { status: 201 });
  } catch (error) {
    logger.error("Failed to create raid:", { error });
    if (error instanceof PrismaClientValidationError) {
      return NextResponse.json({ message: "Invalid raid data" }, { status: 400 });
    }
    return NextResponse.json({ message: "Failed to create raid" }, { status: 500 });
  }
}
