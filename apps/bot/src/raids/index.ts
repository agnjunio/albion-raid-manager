import { Module } from "@/modules";
import { runCronjob } from "@albion-raid-manager/common/scheduler";
import { logger } from "@albion-raid-manager/logger";
import { Events } from "discord.js";
import { testCommand } from "./commands/test";
import { handleAnnounceRaids, handleSelect, handleSignout, handleSignup } from "./handlers";

export const raids: Module = {
  id: "raids",
  commands: [testCommand],
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
      if (action === "select") return handleSelect({ discord, interaction });
      if (action === "signout") return handleSignout({ discord, interaction });

      logger.warn(`Unknown action: ${interaction.customId}`, { interaction: interaction.toJSON() });
    });
  },
};
