import { existsSync, readFileSync } from "fs";

import { logger } from "@albion-raid-manager/core/logger";

import { parseDiscordMessage } from "../src";

async function testMessage(message: string, name: string) {
  logger.info(`🎯 Testing ${name.toUpperCase()} Message Parsing`);
  logger.info("📝 Original Message:");
  logger.info(message);
  logger.info("=".repeat(80));

  try {
    logger.info("🤖 Parsing with AI...");

    // Parse the message
    const result = await parseDiscordMessage(message, {
      guildId: "1234567890",
      channelId: "1234567890",
      authorId: "1234567890",
      messageId: "1234567890",
      timestamp: new Date(),
      mentions: [],
      attachments: [],
    });

    logger.info(
      `✅ Parsed Results for ${name}:\n` +
        JSON.stringify(
          {
            title: result.title,
            date: result.date.toLocaleDateString(),
            time: result.date.toLocaleTimeString(),
            location: result.location || "Not specified",
            confidence: `${(result.confidence * 100).toFixed(1)}%`,
            contentType: result.contentType || "Not detected",
            contentTypeConfidence: result.contentTypeConfidence
              ? `${(result.contentTypeConfidence * 100).toFixed(1)}%`
              : "Not detected",
            maxParticipants: result.maxParticipants || "Not specified",
            description: result.description,
            requirements: result.requirements,
            roles: result.roles,
            notes: result.notes,
          },
          null,
          2,
        ),
    );

    logger.info(`🎉 ${name} raid would be automatically created with this data!`);
    logger.info(""); // Empty line for readability
  } catch (error) {
    logger.error(
      `❌ Error parsing ${name} message:\n` + (error instanceof Error ? error.stack || error.message : String(error)),
    );
    logger.info(""); // Empty line for readability
  }
}

function readMessageFromFile(filePath: string): string {
  try {
    return readFileSync(filePath, "utf-8").trim();
  } catch (error) {
    logger.error(`❌ Error reading file ${filePath}: ${error}`);
    return "";
  }
}

function readMessagesFromFile(filePath: string): Record<string, string> {
  try {
    const content = readFileSync(filePath, "utf-8");
    const messages: Record<string, string> = {};

    // Split by message separators (you can customize this format)
    const messageBlocks = content.split(/\n\s*---\s*\n/);

    messageBlocks.forEach((block, index) => {
      const lines = block.trim().split("\n");
      if (lines.length > 0) {
        // Use first line as name, rest as message
        const name = lines[0].replace(/^#\s*/, "").trim() || `message_${index + 1}`;
        const message = lines.slice(1).join("\n").trim();

        if (message) {
          messages[name] = message;
        }
      }
    });

    return messages;
  } catch (error) {
    logger.error(`❌ Error reading file ${filePath}: ${error}`);
    return {};
  }
}

async function main() {
  const args = process.argv.slice(2);
  const filePath = args[0];

  if (!filePath) {
    // Show usage
    logger.info("🤖 AI Message Parser - Test Script");
    logger.info("");
    logger.info("Usage:");
    logger.info("  pnpm test:file messages.txt                          # Test messages from file");
    logger.info("  pnpm test:single message.txt                         # Test single message file");
    logger.info("");
    logger.info("File format example (messages.txt):");
    logger.info("# My Custom Message");
    logger.info("🛡️ TANK: @Player1");
    logger.info("💚 HEALER: @Player2");
    logger.info("---");
    logger.info("# Another Message");
    logger.info("Different message content...");
    logger.info("");
    logger.info("Single message file format (message.txt):");
    logger.info("🛡️ TANK: @Player1");
    logger.info("💚 HEALER: @Player2");
    logger.info("⚔️ DPS: @Player3");
    return;
  }

  if (!existsSync(filePath)) {
    logger.error(`❌ File not found: ${filePath}`);
    logger.info("💡 Create a .txt file with messages separated by '---'");
    logger.info("Example format:");
    logger.info("# Message Name 1");
    logger.info("Message content here...");
    logger.info("---");
    logger.info("# Message Name 2");
    logger.info("Another message content...");
    return;
  }

  // Check if it's a single message file or multiple messages file
  const content = readFileSync(filePath, "utf-8");
  const hasSeparators = content.includes("---");

  if (hasSeparators) {
    // Multiple messages file
    logger.info(`📁 Reading multiple messages from: ${filePath}`);
    const fileMessages = readMessagesFromFile(filePath);

    if (Object.keys(fileMessages).length === 0) {
      logger.error("❌ No valid messages found in file");
      return;
    }

    for (const [name, message] of Object.entries(fileMessages)) {
      await testMessage(message, name);
    }
  } else {
    // Single message file
    logger.info(`📁 Reading single message from: ${filePath}`);
    const message = readMessageFromFile(filePath);
    if (message) {
      const name = filePath.split("/").pop()?.replace(".txt", "") || "message";
      await testMessage(message, name);
    } else {
      logger.error("❌ No valid message found in file");
    }
  }
}

// Run the test
if (require.main === module) {
  main().catch(console.error);
}
