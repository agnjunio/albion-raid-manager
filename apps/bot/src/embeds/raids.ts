import { Raid } from "@albion-raid-manager/database/models";
import { EmbedBuilder } from "discord.js";

export const getEmbedRaidAnnouncement = (raid: Raid) => {
  return new EmbedBuilder()
    .setColor("#0099ff")
    .setTitle("Raid Announcement")
    .setDescription(`A new raid has been scheduled for ${raid.date.toISOString()}`);
};
