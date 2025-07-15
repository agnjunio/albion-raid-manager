import { type DiscordMessageContext, type ParsedRaidData, validateDiscordMessage } from "@albion-raid-manager/ai";
import { RaidRole, RaidStatus } from "@albion-raid-manager/core/types";
import { getErrorMessage } from "@albion-raid-manager/core/utils";
import { prisma } from "@albion-raid-manager/database";
import { logger } from "@albion-raid-manager/logger";

// Helper function to map role names to RaidRole enum values
function mapRoleNameToEnum(roleName: string): RaidRole {
  const roleMap: Record<string, RaidRole> = {
    TANK: "TANK",
    HEALER: "HEALER",
    SUPPORT: "SUPPORT",
    DPS: "RANGED_DPS", // Default DPS to ranged
    RANGED_DPS: "RANGED_DPS",
    MELEE_DPS: "MELEE_DPS",
    CALLER: "CALLER",
    BATTLEMOUNT: "BATTLEMOUNT",
    // Map common variations
    HEAL: "HEALER",
    HEALING: "HEALER",
    RANGED: "RANGED_DPS",
    MELEE: "MELEE_DPS",
  };

  const upperRoleName = roleName.toUpperCase();
  return roleMap[upperRoleName] || "RANGED_DPS"; // Default to ranged DPS if unknown
}

// Function to create raid from parsed data
export async function createRaidFromParsedData(
  parsedData: ParsedRaidData,
  context: DiscordMessageContext,
): Promise<void> {
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

// Function to validate if a message is raid-related
export async function validateRaidMessage(message: string): Promise<boolean> {
  try {
    return await validateDiscordMessage(message);
  } catch (error) {
    logger.error("Failed to validate message", {
      message: message.substring(0, 100) + "...",
      error: getErrorMessage(error),
    });
    return false;
  }
}
