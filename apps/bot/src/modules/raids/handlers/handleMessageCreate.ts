import {
  DiscordMessageContext,
  getContentTypeInfo,
  parseDiscordMessage,
  ParsedRaidData,
} from "@albion-raid-manager/ai";
import { memoize } from "@albion-raid-manager/core/cache";
import { Raid, RaidRole, RaidSlot, Server } from "@albion-raid-manager/core/types";
import { getErrorMessage } from "@albion-raid-manager/core/utils/errors";
import { prisma, RaidStatus } from "@albion-raid-manager/database";
import { logger } from "@albion-raid-manager/logger";
import { Client, Message } from "discord.js";

import { buildRaidCreationConfirmationMessage } from "../messages";

export const handleMessageCreate = async ({ message }: { discord: Client; message: Message }) => {
  try {
    // Skip bot messages and messages without guild
    if (message.author.bot || !message.guild) return;

    // Check if the guild is enabled for raid parsing
    const guild = await memoize(
      `guild-${message.guild.id}`,
      async () => {
        if (!message.guild) return;
        return await prisma.server.findUnique({
          where: {
            id: message.guild.id,
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
    logger.debug(`Message received in raid channel: #${message.guild.channels.cache.get(message.channel.id)?.name}`, {
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

    // Create the raid and get raid data for message building
    const { raid } = await createRaidFromParsedData(guild, parsedData);

    // Create confirmation message using the messages module
    const replyMessage = buildRaidCreationConfirmationMessage(raid, raid.slots || [], parsedData);

    await message.reply(replyMessage);
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
// Now returns the created raid and slots for message building
async function createRaidFromParsedData(
  guild: Server,
  parsedData: ParsedRaidData,
): Promise<{ raid: Raid & { slots: RaidSlot[] } }> {
  logger.info("Creating raid from parsed data", {
    parsedData,
  });

  try {
    // Use content type information from parsed data (now integrated into parseDiscordMessage)
    const contentType =
      parsedData.contentType && parsedData.contentTypeConfidence && parsedData.contentTypeConfidence >= 0.1
        ? parsedData.contentType
        : null;

    // Get content type info to determine raid type
    const contentTypeInfo = contentType ? getContentTypeInfo(contentType) : null;
    const raidType = contentTypeInfo?.raidType || "FLEX";

    const slots = [];
    if (parsedData.roles && parsedData.roles.length > 0) {
      for (const role of parsedData.roles) {
        // Validate and map the role to a valid RaidRole enum value
        const validRole = mapToValidRaidRole(role.role);
        if (!validRole) {
          logger.warn(`Skipping role with invalid value: ${role.role}`, {
            roleName: role.name,
            roleValue: role.role,
          });
          continue;
        }
        // Create one slot per role entry
        const slotName = role.name;
        slots.push({
          name: slotName,
          comment: role.requirements?.join(", "),
          role: validRole,
        });
        logger.debug("Created slot", { slotName, validRole });
      }
    }

    // Create the raid
    const raid = await prisma.raid.create({
      data: {
        serverId: guild.id,
        title: parsedData.title,
        description: parsedData.description || `Raid created from Discord message`,
        date: parsedData.date,
        status: "SCHEDULED" as RaidStatus,
        note: parsedData.notes,
        contentType,
        type: raidType,
        slots: {
          create: slots,
        },
      },
      include: {
        slots: true,
      },
    });

    logger.info("Successfully created raid from AI parsing", {
      raidId: raid.id,
      title: raid.title,
      date: raid.date,
      guildId: guild.id,
      slotsCount: slots.length,
      contentType: contentType,
      raidType: raidType,
    });

    return { raid };
  } catch (error) {
    logger.error("Failed to create raid from parsed data", {
      parsedData,
      error: getErrorMessage(error),
    });
    throw error;
  }
}

// Helper function to map AI role values to valid RaidRole enum values
function mapToValidRaidRole(roleValue: string): RaidRole | null {
  const upperRole = roleValue.toUpperCase().trim();

  // Direct matches
  if (
    upperRole === "CALLER" ||
    upperRole === "TANK" ||
    upperRole === "SUPPORT" ||
    upperRole === "HEALER" ||
    upperRole === "RANGED_DPS" ||
    upperRole === "MELEE_DPS" ||
    upperRole === "BATTLEMOUNT"
  ) {
    return upperRole as RaidRole;
  }

  // Handle common variations and mappings
  switch (upperRole) {
    case "NOT SPECIFIED":
    case "UNSPECIFIED":
    case "UNKNOWN":
      // Default to RANGED_DPS for unspecified roles
      return "RANGED_DPS";
    case "DPS":
    case "DAMAGE":
      // Default to RANGED_DPS for generic DPS
      return "RANGED_DPS";
    case "MELEE":
      return "MELEE_DPS";
    case "RANGED":
      return "RANGED_DPS";
    case "MOUNT":
    case "BATTLE MOUNT":
      return "BATTLEMOUNT";
    default:
      // Try to infer from role name patterns
      if (upperRole.includes("TANK") || upperRole.includes("GUARDIAN") || upperRole.includes("PROTECTOR")) {
        return "TANK";
      }
      if (upperRole.includes("HEAL") || upperRole.includes("SANADOR") || upperRole.includes("CURADOR")) {
        return "HEALER";
      }
      if (upperRole.includes("SUPPORT") || upperRole.includes("SUPORTE") || upperRole.includes("CURSED")) {
        return "SUPPORT";
      }
      if (upperRole.includes("CALLER") || upperRole.includes("CHAMADOR") || upperRole.includes("LEADER")) {
        return "CALLER";
      }
      if (upperRole.includes("MOUNT") || upperRole.includes("MONTARIA") || upperRole.includes("CAVALO")) {
        return "BATTLEMOUNT";
      }
      if (
        upperRole.includes("MELEE") ||
        upperRole.includes("MELE") ||
        upperRole.includes("LANÇA") ||
        upperRole.includes("LANCA")
      ) {
        return "MELEE_DPS";
      }
      // Default to RANGED_DPS for anything else
      return "RANGED_DPS";
  }
}
