import { logger } from "@albion-raid-manager/logger";
import { Events } from "discord.js";

import { type Module } from "@/modules";

import { raidCommand } from "./commands/raid";
import { handleSelectRole, handleSignout, handleSignup } from "./handlers";

export const raids: Module = {
  id: "raids",
  commands: [raidCommand],
  onReady: async ({ discord }) => {
    discord.on(Events.MessageCreate, async (message) => {
      if (message.author.bot) return;

      logger.info(`Message received: ${message.content}`, { message: message.toJSON() });
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
