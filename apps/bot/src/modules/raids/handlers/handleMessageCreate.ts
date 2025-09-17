import { parseDiscordMessage, ParsedRaidData } from "@albion-raid-manager/ai";
import { prisma } from "@albion-raid-manager/core/database";
import { getContentTypeInfo } from "@albion-raid-manager/core/entities";
import { logger } from "@albion-raid-manager/core/logger";
import { ServersService } from "@albion-raid-manager/core/services";
import { getErrorMessage } from "@albion-raid-manager/core/utils";
import { Raid, RaidRole, RaidSlot, RaidStatus, RaidType, Server } from "@albion-raid-manager/types";
import { MessageCreateOptions } from "discord.js";

import { buildRaidCreationConfirmationMessage } from "../messages/creation-confirmation";

import { type MessageHandlerProps } from "./index";

export const handleMessageCreate = async ({ message, context }: MessageHandlerProps) => {
  if (message.author.bot || !message.guild) return;

  try {
    const server = await ServersService.getServerById(message.guild.id);
    if (!server || message.channel.id !== server.raidAnnouncementChannelId) return;

    logger.debug(`Message received in raid channel: #${message.guild.channels.cache.get(message.channel.id)?.name}`, {
      guildId: message.guild.id,
      channelId: message.channel.id,
      authorId: message.author.id,
    });

    const parsedData = await parseDiscordMessage(message.content, {
      guildId: message.guild.id,
      channelId: message.channel.id,
      authorId: message.author.id,
      messageId: message.id,
      timestamp: message.createdAt,
      mentions: message.mentions.users.map((user) => user.id),
      attachments: message.attachments.map((attachment) => attachment.url),
    });

    if (parsedData.confidence < 0.7) {
      logger.debug("Parsed data confidence too low, skipping raid creation", {
        confidence: parsedData.confidence,
        title: parsedData.title,
      });
      return;
    }

    const { raid } = await createRaidFromParsedData(server, parsedData);

    const replyMessage = await buildRaidCreationConfirmationMessage(raid, raid.slots || [], context, parsedData);
    await message.reply(replyMessage as MessageCreateOptions);
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
    // Get content type info to determine raid configuration
    const contentTypeInfo = parsedData.contentType ? getContentTypeInfo(parsedData.contentType) : null;
    let raidType = "FLEX";
    let maxPlayers: number | null = null;
    let shouldCreateSlots = false;

    if (contentTypeInfo) {
      raidType = contentTypeInfo.raidType;
      maxPlayers = contentTypeInfo.partySize.max;
      shouldCreateSlots = contentTypeInfo.partySize.min === contentTypeInfo.partySize.max;
    }

    const slots = [];
    // Only create slots for FIXED raids or if roles are explicitly provided
    if (shouldCreateSlots && parsedData.roles && parsedData.roles.length > 0) {
      for (let i = 0; i < parsedData.roles.length; i++) {
        const role = parsedData.roles[i];
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
          order: i, // Set proper order starting from 0
        });
        logger.debug("Created slot", { slotName, validRole, order: i });
      }
    }

    // Create the raid
    const raid = await prisma.raid.create({
      data: {
        serverId: guild.id,
        title: parsedData.title,
        description: parsedData.description || `Raid created from Discord message`,
        date: parsedData.date,
        location: parsedData.location,
        status: "SCHEDULED" as RaidStatus,
        note: parsedData.notes,
        contentType: parsedData.contentType,
        type: raidType as RaidType,
        maxPlayers,
        slots: {
          create: slots,
        },
      },
      include: {
        slots: {
          orderBy: { order: "asc" },
        },
      },
    });

    logger.info("Successfully created raid from AI parsing", {
      raidId: raid.id,
      title: raid.title,
      date: raid.date,
      location: raid.location,
      guildId: guild.id,
      slotsCount: slots.length,
      contentType: raid.contentType,
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
