import { AIServiceFactory, DiscordPingParser } from "../src";

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

  console.log("🎯 Testing Roads Avalon Message Parsing\n");
  console.log("📝 Original Message:");
  console.log(roadsMessage);
  console.log("\n" + "=".repeat(80) + "\n");

  try {
    // Create AI service
    const aiService = AIServiceFactory.createFromEnv();
    const parser = new DiscordPingParser(aiService);

    console.log("🤖 Parsing with AI...\n");

    // Parse the message
    const result = await parser.parseMessage(roadsMessage);

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
      console.log(`   General Requirements:`);
      result.requirements.forEach((req, index) => {
        console.log(`     ${index + 1}. ${req}`);
      });
    }

    if (result.roles && result.roles.length > 0) {
      console.log(`   Roles:`);
      result.roles.forEach((role, index) => {
        const preAssigned = role.preAssignedUsers?.length ? ` (Pre-assigned: ${role.preAssignedUsers.join(", ")})` : "";
        const requirements = role.requirements?.length ? ` (Gear: ${role.requirements.join(", ")})` : "";
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
  testRoadsMessage().catch(console.error);
}
