import { createRaid, findRaidById, findRaids } from "@albion-raid-manager/core/services";
import { getErrorMessage } from "@albion-raid-manager/core/utils";
import { ContentType, prisma, RaidRole, RaidStatus, RaidType } from "@albion-raid-manager/database";
import { logger } from "@albion-raid-manager/logger";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  EmbedBuilder,
  Interaction,
  PermissionFlagsBits,
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
} from "discord.js";

import { Command } from "@/commands";

import { buildRaidAnnouncementMessage } from "../messages";

const data = new SlashCommandBuilder()
  .setName("raid")
  .setDescription("Manage raids and events")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents)
  .addSubcommand(
    new SlashCommandSubcommandBuilder()
      .setName("create")
      .setDescription("Create a new raid")
      .addStringOption((option) => option.setName("title").setDescription("Raid title").setRequired(true))
      .addStringOption((option) => option.setName("description").setDescription("Raid description").setRequired(false))
      .addStringOption((option) =>
        option.setName("date").setDescription("Raid date and time (e.g., '2024-01-15 20:00')").setRequired(true),
      )
      .addStringOption((option) =>
        option
          .setName("type")
          .setDescription("Raid type")
          .setRequired(false)
          .addChoices({ name: "Fixed", value: "FIXED" }, { name: "Flexible", value: "FLEX" }),
      )
      .addStringOption((option) =>
        option
          .setName("content")
          .setDescription("Content type")
          .setRequired(false)
          .addChoices(
            { name: "Group Dungeon", value: "GROUP_DUNGEON" },
            { name: "Avalonian Dungeon (Full Clear)", value: "AVALONIAN_DUNGEON_FULL_CLEAR" },
            { name: "Avalonian Dungeon (Buff Only)", value: "AVALONIAN_DUNGEON_BUFF_ONLY" },
            { name: "Roads of Avalon (PvE)", value: "ROADS_OF_AVALON_PVE" },
            { name: "Roads of Avalon (PvP)", value: "ROADS_OF_AVALON_PVP" },
            { name: "Hellgate (2v2)", value: "HELLGATE_2V2" },
            { name: "Hellgate (5v5)", value: "HELLGATE_5V5" },
            { name: "Hellgate (10v10)", value: "HELLGATE_10V10" },
            { name: "ZvZ/Call to Arms", value: "ZVZ_CALL_TO_ARMS" },
            { name: "Ganking Squad", value: "GANKING_SQUAD" },
            { name: "Fighting Squad", value: "FIGHTING_SQUAD" },
            { name: "Open World Farming", value: "OPEN_WORLD_FARMING" },
            { name: "Other", value: "OTHER" },
          ),
      )
      .addStringOption((option) => option.setName("location").setDescription("Raid location").setRequired(false))
      .addIntegerOption((option) =>
        option
          .setName("slots")
          .setDescription("Number of slots (default: 8)")
          .setRequired(false)
          .setMinValue(1)
          .setMaxValue(20),
      ),
  )
  .addSubcommand(
    new SlashCommandSubcommandBuilder()
      .setName("list")
      .setDescription("List active raids")
      .addStringOption((option) =>
        option
          .setName("status")
          .setDescription("Filter by status")
          .setRequired(false)
          .addChoices(
            { name: "Scheduled", value: "SCHEDULED" },
            { name: "Open", value: "OPEN" },
            { name: "Closed", value: "CLOSED" },
            { name: "Ongoing", value: "ONGOING" },
            { name: "Finished", value: "FINISHED" },
          ),
      ),
  )
  .addSubcommand(
    new SlashCommandSubcommandBuilder()
      .setName("announce")
      .setDescription("Announce a raid in the configured channel")
      .addStringOption((option) => option.setName("raid_id").setDescription("Raid ID to announce").setRequired(true)),
  )
  .addSubcommand(
    new SlashCommandSubcommandBuilder()
      .setName("close")
      .setDescription("Close a raid for signups")
      .addStringOption((option) => option.setName("raid_id").setDescription("Raid ID to close").setRequired(true)),
  )
  .addSubcommand(
    new SlashCommandSubcommandBuilder()
      .setName("open")
      .setDescription("Open a raid for signups")
      .addStringOption((option) => option.setName("raid_id").setDescription("Raid ID to open").setRequired(true)),
  ) as SlashCommandBuilder;

async function execute(interaction: Interaction) {
  if (!interaction.isChatInputCommand()) return;

  if (!interaction.guild) {
    await interaction.reply({ content: "This command can only be used in a server.", ephemeral: true });
    return;
  }

  const subcommand = interaction.options.getSubcommand();

  try {
    switch (subcommand) {
      case "create":
        await handleCreateRaid(interaction);
        break;
      case "list":
        await handleListRaids(interaction);
        break;
      case "announce":
        await handleAnnounceRaid(interaction);
        break;
      case "close":
        await handleCloseRaid(interaction);
        break;
      case "open":
        await handleOpenRaid(interaction);
        break;
      default:
        await interaction.reply({ content: "Unknown subcommand.", ephemeral: true });
    }
  } catch (error) {
    logger.error(`Raid command error: ${getErrorMessage(error)}`, { error, interaction: interaction.toJSON() });
    await interaction.reply({
      content: "An error occurred while processing the command. Please try again later.",
      ephemeral: true,
    });
  }
}

async function handleCreateRaid(interaction: Interaction) {
  const chatInteraction = interaction as ChatInputCommandInteraction;

  if (!chatInteraction.guild) {
    await chatInteraction.reply({ content: "This command can only be used in a server.", ephemeral: true });
    return;
  }

  const title = chatInteraction.options.getString("title", true);
  const description = chatInteraction.options.getString("description") || title;
  const dateString = chatInteraction.options.getString("date", true);
  const type = (chatInteraction.options.getString("type") as RaidType) || RaidType.FIXED;
  const contentType = (chatInteraction.options.getString("content") as ContentType) || ContentType.OTHER;
  const location = chatInteraction.options.getString("location");
  const slotCount = chatInteraction.options.getInteger("slots") || 8;

  // Parse date
  const raidDate = new Date(dateString);
  if (isNaN(raidDate.getTime())) {
    await chatInteraction.reply({
      content: "Invalid date format. Please use format: YYYY-MM-DD HH:MM",
      ephemeral: true,
    });
    return;
  }

  if (raidDate < new Date()) {
    await chatInteraction.reply({
      content: "Raid date cannot be in the past.",
      ephemeral: true,
    });
    return;
  }

  // Ensure server exists in database
  await prisma.server.upsert({
    where: { id: chatInteraction.guild.id },
    update: { name: chatInteraction.guild.name },
    create: {
      id: chatInteraction.guild.id,
      name: chatInteraction.guild.name,
      icon: chatInteraction.guild.iconURL(),
    },
  });

  // Create raid with default slots using the service
  const raid = await createRaid({
    title,
    description,
    date: raidDate,
    type,
    contentType,
    location,
    serverId: chatInteraction.guild.id,
    slotCount,
  });

  const embed = new EmbedBuilder()
    .setColor(0x57f287)
    .setTitle("✅ Raid Created Successfully")
    .setDescription(`**${raid.title}**`)
    .addFields(
      { name: "ID", value: raid.id, inline: true },
      { name: "Date", value: `<t:${Math.floor(raidDate.getTime() / 1000)}:F>`, inline: true },
      { name: "Status", value: raid.status, inline: true },
      { name: "Slots", value: `${raid.slots.length}`, inline: true },
      { name: "Type", value: type, inline: true },
      { name: "Content", value: contentType.replace(/_/g, " "), inline: true },
    )
    .setTimestamp();

  if (location) {
    embed.addFields({ name: "Location", value: location, inline: true });
  }

  const announceButton = new ButtonBuilder()
    .setCustomId(`raid:announce:${raid.id}`)
    .setLabel("Announce Raid")
    .setStyle(ButtonStyle.Primary);

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(announceButton);

  await chatInteraction.reply({
    embeds: [embed],
    components: [row],
    ephemeral: true,
  });
}

async function handleListRaids(interaction: Interaction) {
  const chatInteraction = interaction as ChatInputCommandInteraction;
  const statusFilter = chatInteraction.options.getString("status") as RaidStatus;

  if (!chatInteraction.guild) {
    await chatInteraction.reply({ content: "This command can only be used in a server.", ephemeral: true });
    return;
  }

  const raids = await findRaids(
    {
      serverId: chatInteraction.guild.id,
      ...(statusFilter && { status: statusFilter }),
    },
    true, // include slots
  );

  if (raids.length === 0) {
    await chatInteraction.reply({
      content: "No raids found." + (statusFilter ? ` (Filtered by: ${statusFilter})` : ""),
      ephemeral: true,
    });
    return;
  }

  const embed = new EmbedBuilder().setColor(0x5865f2).setTitle("📋 Active Raids").setTimestamp();

  for (const raid of raids) {
    const signupCount = raid.slots.filter((slot) => slot.userId).length;
    const totalSlots = raid.slots.length;

    embed.addFields({
      name: `${raid.title} (${raid.id.slice(0, 8)})`,
      value: [
        `**Date:** <t:${Math.floor(raid.date.getTime() / 1000)}:F>`,
        `**Status:** ${raid.status}`,
        `**Signups:** ${signupCount}/${totalSlots}`,
        `**Type:** ${raid.type}`,
      ].join("\n"),
      inline: true,
    });
  }

  await chatInteraction.reply({ embeds: [embed], ephemeral: true });
}

async function handleAnnounceRaid(interaction: Interaction) {
  const chatInteraction = interaction as ChatInputCommandInteraction;
  const raidId = chatInteraction.options.getString("raid_id", true);

  const raid = await findRaidById(raidId, true);

  if (!raid) {
    await chatInteraction.reply({ content: "Raid not found.", ephemeral: true });
    return;
  }

  if (!chatInteraction.guild) {
    await chatInteraction.reply({ content: "This command can only be used in a server.", ephemeral: true });
    return;
  }

  if (raid.serverId !== chatInteraction.guild.id) {
    await chatInteraction.reply({ content: "This raid belongs to a different server.", ephemeral: true });
    return;
  }

  // Get server configuration
  const server = await prisma.server.findUnique({
    where: { id: chatInteraction.guild.id },
  });

  const announcementChannelId = server?.raidAnnouncementChannelId;
  if (!announcementChannelId) {
    await chatInteraction.reply({
      content: "No raid announcement channel configured. Use `/config` to set one up.",
      ephemeral: true,
    });
    return;
  }

  const channel = chatInteraction.guild.channels.cache.get(announcementChannelId);
  if (!channel || !channel.isTextBased()) {
    await chatInteraction.reply({
      content: "Announcement channel not found or is not a text channel.",
      ephemeral: true,
    });
    return;
  }

  const messageOptions = buildRaidAnnouncementMessage(raid, raid.slots);
  const message = await channel.send(messageOptions as any);

  // Update raid with announcement message ID and open for signups
  await announceRaid(raidId, message.id);

  await chatInteraction.reply({
    content: `✅ Raid announced in ${channel}!`,
    ephemeral: true,
  });
}

async function handleCloseRaid(interaction: Interaction) {
  const chatInteraction = interaction as ChatInputCommandInteraction;
  const raidId = chatInteraction.options.getString("raid_id", true);

  const raid = await findRaidById(raidId);

  if (!raid) {
    await chatInteraction.reply({ content: "Raid not found.", ephemeral: true });
    return;
  }

  if (!chatInteraction.guild) {
    await chatInteraction.reply({ content: "This command can only be used in a server.", ephemeral: true });
    return;
  }

  if (raid.serverId !== chatInteraction.guild.id) {
    await chatInteraction.reply({ content: "This raid belongs to a different server.", ephemeral: true });
    return;
  }

  await closeRaidForSignups(raidId);

  await chatInteraction.reply({
    content: `✅ Raid ${raidId.slice(0, 8)} closed for signups.`,
    ephemeral: true,
  });
}

async function handleOpenRaid(interaction: Interaction) {
  const chatInteraction = interaction as ChatInputCommandInteraction;
  const raidId = chatInteraction.options.getString("raid_id", true);

  const raid = await findRaidById(raidId);

  if (!raid) {
    await chatInteraction.reply({ content: "Raid not found.", ephemeral: true });
    return;
  }

  if (!chatInteraction.guild) {
    await chatInteraction.reply({ content: "This command can only be used in a server.", ephemeral: true });
    return;
  }

  if (raid.serverId !== chatInteraction.guild.id) {
    await chatInteraction.reply({ content: "This raid belongs to a different server.", ephemeral: true });
    return;
  }

  await openRaidForSignups(raidId);

  await chatInteraction.reply({
    content: `✅ Raid ${raidId.slice(0, 8)} opened for signups.`,
    ephemeral: true,
  });
}

export function generateDefaultSlots(count: number) {
  const defaultRoles = [
    RaidRole.CALLER,
    RaidRole.TANK,
    RaidRole.HEALER,
    RaidRole.SUPPORT,
    RaidRole.MELEE_DPS,
    RaidRole.RANGED_DPS,
    RaidRole.RANGED_DPS,
    RaidRole.MELEE_DPS,
  ];

  const slots = [];
  for (let i = 0; i < count; i++) {
    const role = defaultRoles[i] || RaidRole.MELEE_DPS;
    slots.push({
      name: `${role.replace(/_/g, " ")} ${Math.floor(i / 8) + 1}`,
      role: role,
    });
  }
  return slots;
}

export const raidCommand: Command = {
  data,
  execute,
};
