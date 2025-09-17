import { Events, Interaction } from "discord.js";

import { type GuildContext } from "@/modules/guild-context";
import { type Module } from "@/modules/modules";

import { raidCommand } from "./commands/raid";
import { initRaidEvents } from "./events";
import { handleMessageCreate, handleSelectRole, handleSignout, handleSignUp } from "./handlers";

export const raids: Module = {
  id: "raids",
  enabled: true,
  commands: [raidCommand],
  onReady: async ({ discord }) => {
    initRaidEvents({ discord });

    discord.on(Events.MessageCreate, async (message) => handleMessageCreate({ discord, message }));
  },

  onMessageComponent: async (action: string, interaction: Interaction, context: GuildContext) => {
    const discord = interaction.client;

    switch (action) {
      case "signup":
        return handleSignUp({ discord, interaction, context });
      case "select":
        return handleSelectRole({ discord, interaction, context });
      case "signout":
        return handleSignout({ discord, interaction, context });
      default:
        console.warn(`Unknown action: ${action}`, { interaction: interaction.toJSON() });
    }
  },
};
