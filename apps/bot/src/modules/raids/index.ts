import { InteractionHandlerProps, type Module } from "@/modules/modules";

import { raidCommand } from "./commands/raid";
import { initRaidEvents } from "./events";
import { handleMessageCreate, handleSelectRole, handleSignout, handleSignUp } from "./handlers";

export const raids: Module = {
  id: "raids",
  enabled: true,
  commands: [raidCommand],
  onReady: async ({ discord }) => {
    initRaidEvents({ discord });
  },

  onMessageCreate: handleMessageCreate,

  onMessageComponent: async ({ actionId, interaction, context }: InteractionHandlerProps) => {
    const discord = interaction.client;

    switch (actionId) {
      case "signup":
        return handleSignUp({ discord, actionId, interaction, context });
      case "select":
        return handleSelectRole({ discord, actionId, interaction, context });
      case "signout":
        return handleSignout({ discord, actionId, interaction, context });
      default:
        console.warn(`Unknown action: ${actionId}`, { interaction: interaction.toJSON() });
    }
  },
};
