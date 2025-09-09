import { logger } from "@albion-raid-manager/logger";
import { Events } from "discord.js";

import { type Module } from "@/modules/modules";

import { raidCommand } from "./commands/raid";
import { initRaidEvents } from "./events";
import { handleMessageCreate, handleSelectRole, handleSignout, handleSignup } from "./handlers";

export const raids: Module = {
  id: "raids",
  enabled: true,
  commands: [raidCommand],
  onReady: async ({ discord }) => {
    initRaidEvents({ discord });

    discord.on(Events.MessageCreate, async (message) => handleMessageCreate({ discord, message }));

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
