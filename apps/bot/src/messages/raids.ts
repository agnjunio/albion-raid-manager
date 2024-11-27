import { Raid } from "@albion-raid-manager/database/models";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, MessageCreateOptions } from "discord.js";

export const createRaidAnnouncementMessage = (raid: Raid): MessageCreateOptions => {
  const embed = new EmbedBuilder()
    .setColor("#ffbd59")
    .setTitle("Raid Announcement")
    .setDescription(`A new raid has been scheduled. Click sign up to join.`)
    .setTimestamp(new Date(raid.date));

  const confirm = new ButtonBuilder().setCustomId("signup").setLabel("Sign Up").setStyle(ButtonStyle.Primary);

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(confirm);

  return {
    embeds: [embed],
    components: [row],
  };
};
