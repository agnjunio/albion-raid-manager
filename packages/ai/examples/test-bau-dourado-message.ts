import { AIServiceFactory, DiscordPingParser } from "../src";

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

  console.log("🎯 Testing Baú Dourado Message Parsing\n");
  console.log("📝 Original Message:");
  console.log(bauDouradoMessage);
  console.log("\n" + "=".repeat(80) + "\n");

  try {
    // Create AI service
    const aiService = AIServiceFactory.createFromEnv();
    const parser = new DiscordPingParser(aiService);

    console.log("🤖 Parsing with AI...\n");

    // Parse the message
    const result = await parser.parseMessage(bauDouradoMessage);

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
  testBauDouradoMessage().catch(console.error);
}
