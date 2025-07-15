import { logger } from "@albion-raid-manager/logger";

import { parseDiscordMessage, validateDiscordMessage } from "../src";

async function main() {
  logger.info("🤖 AI Service Example - Discord Ping Parser");

  // Example messages to test
  const testMessages = [
    "@everyone Raid tonight at 8 PM! Need 2 tanks, 3 healers, and 5 DPS for corrupted dungeon!",
    "Anyone want to do a quick dungeon run?",
    "Need 1 tank and 2 healers for roads chest run tomorrow at 7 PM",
    "Just a regular chat message about the weather",
    "Guild meeting tonight at 9 PM to discuss new strategies",
  ];

  try {
    logger.info("📡 Parser ready to use");

    // Test each message
    for (const [index, message] of testMessages.entries()) {
      logger.info(`📝 Testing message ${index + 1}: "${message}"`);

      try {
        // First validate if it's raid-related
        const isValid = await validateDiscordMessage(message);
        logger.info(`   Validation: ${isValid ? "✅ Raid-related" : "❌ Not raid-related"}`);

        if (isValid) {
          // Parse the message
          const result = await parseDiscordMessage(message);
          logger.info("   ✅ Parsed successfully:", {
            title: result.title,
            date: result.date.toLocaleDateString(),
            confidence: `${(result.confidence * 100).toFixed(1)}%`,
            roles: result.roles?.map((r) => `${r.name} (${r.count})`).join(", "),
            location: result.location,
          });
        }
      } catch (error) {
        logger.error(`   ❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`);
      }

      logger.info(""); // Empty line for readability
    }
  } catch (error) {
    logger.error("❌ Failed to use parser:", error);
    logger.info("💡 Make sure you have set the required environment variables:");
    logger.info("   AI_PROVIDER=openai|anthropic");
    logger.info("   AI_API_KEY=your_api_key");
    logger.info("   AI_MODEL=your_model (optional)");
  }
}

// Run the example
if (require.main === module) {
  main().catch(console.error);
}
