import { AIServiceFactory, DiscordPingParser } from "../src";

async function main() {
  console.log("🤖 AI Service Example - Discord Ping Parser\n");

  // Example messages to test
  const testMessages = [
    "@everyone Raid tonight at 8 PM! Need 2 tanks, 3 healers, and 5 DPS for corrupted dungeon!",
    "Anyone want to do a quick dungeon run?",
    "Need 1 tank and 2 healers for roads chest run tomorrow at 7 PM",
    "Just a regular chat message about the weather",
    "Guild meeting tonight at 9 PM to discuss new strategies",
  ];

  try {
    // Create AI service from environment variables
    console.log("📡 Creating AI service...");
    const aiService = AIServiceFactory.createFromEnv();
    console.log(`✅ Using provider: ${aiService.provider}\n`);

    // Create parser
    const parser = new DiscordPingParser(aiService);

    // Test each message
    for (const [index, message] of testMessages.entries()) {
      console.log(`📝 Testing message ${index + 1}:`);
      console.log(`   "${message}"`);

      try {
        // First validate if it's raid-related
        const isValid = await parser.validateMessage(message);
        console.log(`   Validation: ${isValid ? "✅ Raid-related" : "❌ Not raid-related"}`);

        if (isValid) {
          // Parse the message
          const result = await parser.parseMessage(message);
          console.log(`   ✅ Parsed successfully:`);
          console.log(`      Title: ${result.title}`);
          console.log(`      Date: ${result.date.toLocaleDateString()}`);
          console.log(`      Confidence: ${(result.confidence * 100).toFixed(1)}%`);
          if (result.roles && result.roles.length > 0) {
            console.log(`      Roles: ${result.roles.map((r) => `${r.name} (${r.count})`).join(", ")}`);
          }
          if (result.location) {
            console.log(`      Location: ${result.location}`);
          }
        }
      } catch (error) {
        console.log(`   ❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`);
      }

      console.log(""); // Empty line for readability
    }
  } catch (error) {
    console.error("❌ Failed to initialize AI service:", error);
    console.log("\n💡 Make sure you have set the required environment variables:");
    console.log("   AI_PROVIDER=openai|anthropic");
    console.log("   AI_API_KEY=your_api_key");
    console.log("   AI_MODEL=your_model (optional)");
  }
}

// Run the example
if (require.main === module) {
  main().catch(console.error);
}
