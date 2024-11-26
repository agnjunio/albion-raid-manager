import { prisma } from "@albion-raid-manager/database";
import { PrismaClientValidationError } from "@albion-raid-manager/database/errors";
import logger from "@albion-raid-manager/logger";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { guildId, description, date, compositionId } = await req.json();

    const guild = await prisma.guild.findUnique({
      where: {
        id: guildId,
      },
    });

    if (!guild) {
      return NextResponse.json({ message: "Guild not found" }, { status: 404 });
    }

    const raid = await prisma.raid.create({
      data: {
        description,
        date: new Date(date),
        compositionId,
        guildId,
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
