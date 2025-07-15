import { logger } from "@albion-raid-manager/logger";

import { parseDiscordMessage } from "../src";

async function testRoadsMessage() {
  const roadsMessage = `🚦ROADS AVALON PVP/PVE 🚦

   💯@everyone💯

💥💥- SAIDÁ ASSIM QUE FECHAR A PT -💥💥

 🚉 t8! 🚉

👑(MARTELO) @Phantonvick 
ESTRONDOSO -ELMO GUARDIAO - ARMADURA JUDICANTE - SAPATOS CAVALEIROS - NEWCAP!

😎(MONARCA) @GhostAloneVII 
BRUMARIO - ARMADURA REAL - ELMO BRAVURA - BOTAS TECELÃO - NEWCAP!

😇(REDENÇÃO/QUEDA) @Dominickss 
CLERIGO - CAPOTE REAL - SAPATOS MERCENARIO - CAPA LYM!

😎(PATAS DE URSO) @D4V3OBRABO 
CASACO INFERIAL - CAPUZ ESPREITADOR - SAPATOS ESREITADOR - NEWCAP!

😎(ASTRAL) @jokerwel 
ARMADURA SOLDADO - CAPUZ ASSASSINO - BOTAS BRAVURAS - NEWCAP!

😎(AGUIA) @NightHuntersx 
ARMADURA SOLDADO - CAPUZ ASSASSINO - SAPATOS - NEWCAP!

😎(PUTRIDO) @BIgodaoPutasso 
CASACO REAL - BRUMARIO - CAPUZ ASSASSINO - SAPATOS REAIS - NEWCAPP!`;

  logger.info("🎯 Testing Roads Avalon Message Parsing");
  logger.info("📝 Original Message:");
  logger.info(roadsMessage);
  logger.info("=".repeat(80));

  try {
    logger.info("🤖 Parsing with AI...");

    // Parse the message
    const result = await parseDiscordMessage(roadsMessage);

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
  testRoadsMessage().catch(console.error);
}
