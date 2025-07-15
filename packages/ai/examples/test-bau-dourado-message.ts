import { logger } from "@albion-raid-manager/logger";

import { parseDiscordMessage } from "../src";

async function testBauDouradoMessage() {
  const bauDouradoMessage = `:b1: Baú Dourado – Saída de Brecilien :b2:
🔹 Conteúdo: PvE / PvP
:gun: Arma: T8.1
👕 Roupas: T8.1
🍖 Food: .0/.2+
🕛 Saída: Quando fechar
✦ Composição ✦
:g_bonk: Tank: @hana 
:acs: Sagrado: @Metagrosszzen 
:skll1: Pútrido: Batman
:lace: Para-Tempo: @SiriiusBeck 
:bun2: FB: @LeGuiH 
:angelbun: FB (mana): @NatusVincere10 
:mlky: Canção:  @Renatinha 
✧ Observações ✧
:n1: Energia obrigatório.
:n2: Builds no tópico.
:n3: Montaria 125+.
:n4: Respeito acima de tudo.
:n5: 📵  NO MOBILETES!

@everyone - /join YameteYoY`;

  logger.info("🎯 Testing Baú Dourado Message Parsing");
  logger.info("📝 Original Message:");
  logger.info(bauDouradoMessage);
  logger.info("=".repeat(80));

  try {
    logger.info("🤖 Parsing with AI...");

    // Parse the message
    const result = await parseDiscordMessage(bauDouradoMessage);

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
  testBauDouradoMessage().catch(console.error);
}
