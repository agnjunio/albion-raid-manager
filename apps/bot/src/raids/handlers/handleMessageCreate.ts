import { DiscordMessageContext, parseDiscordMessage } from "@albion-raid-manager/ai";
import { memoize } from "@albion-raid-manager/core/cache";
import { getErrorMessage } from "@albion-raid-manager/core/utils/errors";
import { prisma } from "@albion-raid-manager/database";
import { logger } from "@albion-raid-manager/logger";
import { Client, Message } from "discord.js";

import { createRaidFromParsedData } from "../helpers/aiRaidHandler";

export const handleMessageCreate = async ({ discord: _discord, message }: { discord: Client; message: Message }) => {
  try {
    // Skip bot messages and messages without guild
    if (message.author.bot || !message.guild) return;

    // Check if the guild is enabled for raid parsing
    const guild = await memoize(
      `guild-${message.guild.id}`,
      async () => {
        if (!message.guild) return;
        return await prisma.guild.findUnique({
          where: {
            discordId: message.guild.id,
          },
        });
      },
      {
        timeout: 1000 * 60 * 5, // 5 minutes
        ignoreCache: () => !message.guild,
      },
    );
    if (!guild || message.channel.id !== guild.raidAnnouncementChannelId) return;

    // Log the message for debugging
    logger.info(`Message received in raid channel: ${message.content}`, {
      guildId: message.guild.id,
      channelId: message.channel.id,
      authorId: message.author.id,
    });

    // Create context for the message
    const context: DiscordMessageContext = {
      guildId: message.guild.id,
      channelId: message.channel.id,
      authorId: message.author.id,
      messageId: message.id,
      timestamp: message.createdAt,
      mentions: message.mentions.users.map((user) => user.id),
      attachments: message.attachments.map((attachment) => attachment.url),
    };

    // Parse the message
    const aiService = getAIService();
    const parsedData = await parseDiscordMessage(aiService, message.content, context);

    // Check if we should create a raid (confidence threshold)
    if (parsedData.confidence < 0.7) {
      logger.debug("Parsed data confidence too low, skipping raid creation", {
        confidence: parsedData.confidence,
        title: parsedData.title,
      });
      return;
    }

    // Create the raid
    await createRaidFromParsedData(parsedData, context);

    // Send confirmation message
    await message.reply({
      content: `✅ Raid created: **${parsedData.title}** on ${parsedData.date.toLocaleDateString()}`,
    });
  } catch (error) {
    logger.error(`Failed to handle message: ${getErrorMessage(error)}`, {
      guildId: message.guild?.id,
      channelId: message.channel.id,
      authorId: message.author.id,
      error: getErrorMessage(error),
    });
  }
};
