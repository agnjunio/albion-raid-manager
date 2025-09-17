import { prisma } from "@albion-raid-manager/core/database";
import { logger } from "@albion-raid-manager/core/logger";
import { getErrorMessage } from "@albion-raid-manager/core/utils";
import { Client, Interaction } from "discord.js";

import { buildRaidSignupReply } from "../messages";


export const handleSignup = async ({ discord, interaction }: { discord: Client; interaction: Interaction }) => {
  try {
    if (!interaction.isButton()) throw new Error("Invalid interaction type");

    const raidId = interaction.customId.split(":")[2];
    if (!raidId) throw new Error("Missing raid id");

    const raid = await prisma.raid.findUnique({
      where: { id: raidId },
      include: {
        server: true,
        slots: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!raid) throw new Error("Raid not found");
    if (raid.status !== "OPEN") throw new Error("Raid is not open for signups");

    // Check if all slots are taken (for FIXED raids)
    const allSlotsTaken = raid.slots.length > 0 && raid.slots.every((slot) => !!slot.userId);
    if (allSlotsTaken) throw new Error("All raid slots are taken");

    const users = await Promise.all(
      raid.slots.filter((slot) => !!slot.userId).map(async (slot) => discord.users.fetch(slot.userId as string)),
    );

    await interaction.reply(buildRaidSignupReply(raid, raid.slots, users));
  } catch (error) {
    if (!interaction.isRepliable()) return;
    if (interaction.replied) return;

    logger.error(`Failed to sign up for raid: ${getErrorMessage(error)}`, { interaction: interaction.toJSON(), error });
    await interaction.reply({
      content: `Failed to sign up for the raid. Please try again later.`,
      ephemeral: true,
    });
  }
};
