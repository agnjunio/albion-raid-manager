import { DiscordMessageContext, mapRoleNameToEnum, parseDiscordMessage, ParsedRaidData } from "@albion-raid-manager/ai";
import { memoize } from "@albion-raid-manager/core/cache";
import { getErrorMessage } from "@albion-raid-manager/core/utils/errors";
import { prisma, RaidStatus } from "@albion-raid-manager/database";
import { logger } from "@albion-raid-manager/logger";
import { Client, Message } from "discord.js";

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
    const parsedData = await parseDiscordMessage(message.content, context);

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

// Function to create raid from parsed data
async function createRaidFromParsedData(parsedData: ParsedRaidData, context: DiscordMessageContext): Promise<void> {
  try {
    // Get or create guild
    const guild = await prisma.guild.findUnique({
      where: { discordId: context.guildId },
    });

    if (!guild) {
      throw new Error(`Guild not found: ${context.guildId}`);
    }

    // Create the raid
    const raid = await prisma.raid.create({
      data: {
        guildId: guild.id,
        title: parsedData.title,
        description: parsedData.description || `Raid created from Discord message`,
        date: parsedData.date,
        status: "SCHEDULED" as RaidStatus,
        note: parsedData.notes,
      },
    });

    // Create raid slots if roles are specified
    if (parsedData.roles && parsedData.roles.length > 0) {
      const slots = [];
      for (const role of parsedData.roles) {
        for (let i = 0; i < role.count; i++) {
          const _preAssignedUser = role.preAssignedUsers?.[i]; // Prefixed with _ to indicate unused
          const slotName = role.count === 1 ? role.name : `${role.name} ${i + 1}`;

          slots.push({
            raidId: raid.id,
            name: slotName,
            comment: role.requirements?.join(", "),
            role: mapRoleNameToEnum(role.name), // Map to enum value
            // If there's a pre-assigned user, we'll need to look them up and assign them
            // This would require additional logic to resolve Discord usernames to user IDs
          });
        }
      }

      await prisma.raidSlot.createMany({
        data: slots,
      });

      // TODO: Handle pre-assigned users by resolving Discord usernames to user IDs
      // and updating the raid slots accordingly
    }

    logger.info("Successfully created raid from AI parsing", {
      raidId: raid.id,
      title: raid.title,
      date: raid.date,
      guildId: guild.id,
      slotsCount: parsedData.roles?.reduce((sum, role) => sum + role.count, 0) || 0,
    });
  } catch (error) {
    logger.error("Failed to create raid from parsed data", {
      parsedData,
      context,
      error: getErrorMessage(error),
    });
    throw error;
  }
}
