import { logger } from "@albion-raid-manager/logger";

import { parseDiscordMessage } from "../src";

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

  logger.info("🎯 Testing BAU Raid Message Parsing");
  logger.info("📝 Original Message:");
  logger.info(bauMessage);
  logger.info("=".repeat(80));

  try {
    logger.info("🤖 Parsing with AI...");

    // Parse the message
    const result = await parseDiscordMessage(bauMessage);

    logger.info("✅ Parsed Results:", {
      title: result.title,
      date: result.date.toLocaleDateString(),
      time: result.time || "Not specified",
      location: result.location || "Not specified",
      confidence: `${(result.confidence * 100).toFixed(1)}%`,
      maxParticipants: result.maxParticipants || "Not specified",
      description: result.description,
      requirements: result.requirements,
      roles: result.roles,
      notes: result.notes,
    });

    logger.info("🎉 Raid would be automatically created with this data!");
  } catch (error) {
    logger.error("❌ Error parsing message:", error);
  }
}

// Run the test
if (require.main === module) {
  testBauMessage().catch(console.error);
}
