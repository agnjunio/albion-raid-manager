import { Module } from "@/modules";
import { runCronjob } from "@albion-raid-manager/core/scheduler";
import { logger } from "@albion-raid-manager/logger";
import { Events } from "discord.js";
import { raidCommand } from "./commands/raid";
import { handleAnnounceRaids, handleSelectRole, handleSignout, handleSignup } from "./handlers";

export const raids: Module = {
  id: "raids",
  commands: [raidCommand],
  onReady: async ({ discord }) => {
    runCronjob({
      name: "Announce Raids",
      cron: "*/30 * * * *", // Every 30 minutes
      callback: () => handleAnnounceRaids({ discord }),
      runOnStart: true,
    });

    discord.on(Events.InteractionCreate, async (interaction) => {
      if (!interaction.isMessageComponent()) return;

      const [controllerId, action] = interaction.customId.split(":");

      if (controllerId !== raids.id) return;
      if (action === "signup") return handleSignup({ discord, interaction });
      if (action === "select") return handleSelectRole({ discord, interaction });
      if (action === "signout") return handleSignout({ discord, interaction });

      logger.warn(`Unknown action: ${interaction.customId}`, { interaction: interaction.toJSON() });
    });
  },
};
