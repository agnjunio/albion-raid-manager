import { getErrorMessage } from "@albion-raid-manager/common/utils";
import { prisma } from "@albion-raid-manager/database";
import { PrismaClientValidationError } from "@albion-raid-manager/database/errors";
import logger from "@albion-raid-manager/logger";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const guildId = url.searchParams.get("guildId");

    const compositions = await prisma.composition.findMany({
      where: {
        guildId: Number(guildId),
      },
    });

    return NextResponse.json(compositions);
  } catch (error) {
    logger.error(`Failed to retrieve compositions. (${getErrorMessage(error)})`, { error });
    return NextResponse.json({ message: "Failed to retrieve compositions." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { guildId, name } = await req.json();

    let composition = await prisma.composition.findFirst({
      where: {
        guildId: Number(guildId),
        name,
      },
    });
    if (composition) {
      return NextResponse.json({ message: "A composition with this name already exists." }, { status: 422 });
    }

    composition = await prisma.composition.create({
      data: {
        guildId: Number(guildId),
        name,
      },
    });

    return NextResponse.json(composition, { status: 201 });
  } catch (error) {
    logger.error("Failed to create composition:", { error });
    if (error instanceof PrismaClientValidationError) {
      return NextResponse.json({ message: "Invalid composition data" }, { status: 400 });
    }
    return NextResponse.json({ message: "Failed to create composition" }, { status: 500 });
  }
}
