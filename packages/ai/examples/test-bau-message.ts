import { AIServiceFactory, DiscordPingParser } from "../src";

async function testBauMessage() {
  const bauMessage = `✅ BAU PVE/PVP ✅ 

‼️ FULL 8.1‼️ 

‼️ FOOD .0 E .2 PARA PVP‼️ 

‼️ LEVAR 10 ENERGIAS‼️ 

‼️ TER SPEC‼️ 

‼️ SABER JOGAR PVP‼️

‼️ ESCUTAR CALL PELO AMOR DE DEUS‼️ 

‼️ LEVAR SWAP (VOU FALAR NA CALL)‼️ 

‼️ MONTARIA 120+ (QUE NÃO SEJA GARRA LIGEIRA)‼️ 

SAIDA 16:20

🛡️ TANK: @BardosaKing 
🧙‍♀️ PUTRIDO: @Dominickss 
💚 HEALER:  @Renatinha 
🧊 ARTICO: @NightHuntersx 
🔥 CANÇÃO: @Lilith 
🏹 FURA BRUMA: @Graiken 
🛑 STOPPER: @yRegulus 

@everyone`;

  console.log("🎯 Testing BAU Raid Message Parsing\n");
  console.log("📝 Original Message:");
  console.log(bauMessage);
  console.log("\n" + "=".repeat(80) + "\n");

  try {
    // Create AI service
    const aiService = AIServiceFactory.createFromEnv();
    const parser = new DiscordPingParser(aiService);

    console.log("🤖 Parsing with AI...\n");

    // Parse the message
    const result = await parser.parseMessage(bauMessage);

    console.log("✅ Parsed Results:");
    console.log(`   Title: ${result.title}`);
    console.log(`   Date: ${result.date.toLocaleDateString()}`);
    console.log(`   Time: ${result.time || "Not specified"}`);
    console.log(`   Location: ${result.location || "Not specified"}`);
    console.log(`   Confidence: ${(result.confidence * 100).toFixed(1)}%`);
    console.log(`   Max Participants: ${result.maxParticipants || "Not specified"}`);

    if (result.description) {
      console.log(`   Description: ${result.description}`);
    }

    if (result.requirements && result.requirements.length > 0) {
      console.log(`   Requirements:`);
      result.requirements.forEach((req, index) => {
        console.log(`     ${index + 1}. ${req}`);
      });
    }

    if (result.roles && result.roles.length > 0) {
      console.log(`   Roles:`);
      result.roles.forEach((role, index) => {
        const preAssigned = role.preAssignedUsers?.length ? ` (Pre-assigned: ${role.preAssignedUsers.join(", ")})` : "";
        const requirements = role.requirements?.length ? ` (Requirements: ${role.requirements.join(", ")})` : "";
        console.log(`     ${index + 1}. ${role.name} x${role.count}${preAssigned}${requirements}`);
      });
    }

    if (result.notes) {
      console.log(`   Notes: ${result.notes}`);
    }

    console.log("\n🎉 Raid would be automatically created with this data!");
  } catch (error) {
    console.error("❌ Error parsing message:", error);
  }
}

// Run the test
if (require.main === module) {
  testBauMessage().catch(console.error);
}
