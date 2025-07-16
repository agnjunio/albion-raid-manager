import { describe, expect, it } from "vitest";

import { createCompactMessage, preprocessMessage } from "../../src/utils/message-preprocessor";

describe("Token Optimization", () => {
  const sampleMessage = `:white_check_mark: BAU PVE/PVP :white_check_mark: 

‼️ FULL 8.1‼️ 

‼️ FOOD .0 E .2 PARA PVP‼️ 

‼️ LEVAR 10 ENERGIAS‼️ 

‼️ TER SPEC‼️ 

‼️ SABER JOGAR PVP‼️

‼️ ESCUTAR CALL PELO AMOR DE DEUS‼️ 

‼️ LEVAR SWAP (VOU FALAR NA CALL)‼️ 

‼️ MONTARIA 120+ (QUE NÃO SEJA GARRA LIGEIRA)‼️ 

SAIDA 16:20

🛡️ TANK: @anjek 
🧙‍♀️ PUTRIDO: 
💚 HEALER:  
🧊 ARTICO: 
🔥 CANÇÃO: 
🏹 FURA BRUMA: 
🛑 STOPPER: 

@everyone`;

  it("should preprocess message and reduce tokens", () => {
    const result = preprocessMessage(sampleMessage);

    expect(result.originalLength).toBeGreaterThan(0);
    expect(result.processedLength).toBeLessThan(result.originalLength);
    expect(result.tokenReduction).toBeGreaterThan(0);
    expect(result.content).toContain("BAU PVE/PVP");
    expect(result.content).toContain("TANK: @anjek");
    expect(result.content).toContain("FULL 8.1");
    expect(result.content).toContain("FOOD .0 E .2 PARA PVP");
    expect(result.content).toContain("SAIDA 16:20");

    // Should remove mass mentions
    expect(result.content).not.toContain("@everyone");

    // Should preserve basic role information (AI handles detailed role mapping)
    expect(result.content).toContain("HEALER");
    expect(result.content).toContain("TANK");
  });

  it("should create compact message", () => {
    const compact = createCompactMessage(sampleMessage);

    expect(compact.length).toBeLessThan(sampleMessage.length);
    expect(compact).toContain("BAU");
    expect(compact).toContain("TANK");
    expect(compact).toContain("8.1");
  });

  it("should handle messages with no relevant content", () => {
    const irrelevantMessage = "Just a regular chat message about the weather today.";
    const result = preprocessMessage(irrelevantMessage);

    expect(result.content).toBe("");
    expect(result.tokenReduction).toBeGreaterThan(0);
  });

  it("should preserve multilingual content", () => {
    const multilingualMessage = `BAU DOURADO
100% PVE
/join MDARKINGM food 8.0 SEM MOBILE 100M DE FAMA PVE NO MIN
ARMA T8 - BUILD T7
🛡️ TANK : @MDARKINGM
🌿 SAGRADO/ Raiz FERREA :
⚡ QUEBA EINOS DOBLE RESET @NYCFROSTZINN
🔥 FULGURANTE [DOBLE CANCEL] :
⚔️ FB (CAPUZ MANA;`;

    const result = preprocessMessage(multilingualMessage);

    expect(result.content).toContain("BAU DOURADO");
    expect(result.content).toContain("TANK : @MDARKINGM");
    expect(result.content).toContain("ARMA T8");
    expect(result.content).toContain("food 8.0");
  });

  it("should show significant token reduction", () => {
    const result = preprocessMessage(sampleMessage);
    const reductionPercentage = (result.tokenReduction / result.originalLength) * 100;

    // Should reduce by at least 30%
    expect(reductionPercentage).toBeGreaterThan(30);
  });
});
