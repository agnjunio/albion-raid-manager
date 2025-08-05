import { describe, expect, it } from "vitest";

import { processMessage } from "./index";

describe("Pipeline Integration Tests", () => {
  it("should process a complete raid message through all preprocessors", () => {
    const message = `:white_check_mark: BAU PVE/PVP :white_check_mark: 

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

    const result = processMessage(message);

    // Check basic structure
    expect(result.originalMessage).toBe(message);
    expect(result.processedMessage).toBeDefined();
    expect(result.extractedSlots).toBeDefined();
    expect(result.preAssignedRoles).toBeDefined();
    expect(result.extractedRequirements).toBeDefined();
    expect(result.extractedTime).toBeDefined();
    expect(result.preAssignedContentType).toBeDefined();
    expect(result.metadata).toBeDefined();

    // Check token optimization
    expect(result.metadata.originalLength).toBeGreaterThan(0);
    expect(result.metadata.processedLength).toBeLessThan(result.metadata.originalLength);
    expect(result.metadata.tokenReduction).toBeGreaterThan(0);

    // Check slot extraction
    expect(result.extractedSlots.length).toBeGreaterThan(0);
    expect(result.metadata.slotCount).toBeGreaterThan(0);

    // Check role preassignment
    expect(result.preAssignedRoles.length).toBeGreaterThan(0);

    // Check requirement extraction
    expect(result.extractedRequirements.length).toBeGreaterThan(0);
    expect(result.metadata.requirementCount).toBeGreaterThan(0);

    // Check time extraction
    expect(result.extractedTime).toBeDefined();
    expect(typeof result.extractedTime).toBe("string");

    // Check content type detection
    expect(result.preAssignedContentType).toBeDefined();
  });

  it("should handle multilingual content correctly", () => {
    const message = `BAU DOURADO
100% PVE
/join MDARKINGM food 8.0 SEM MOBILE 100M DE FAMA PVE NO MIN
ARMA T8 - BUILD T7
🛡️ TANK : @MDARKINGM
🌿 SAGRADO/ Raiz FERREA :
⚡ QUEBA EINOS DOBLE RESET @NYCFROSTZINN
🔥 FULGURANTE [DOBLE CANCEL] :
⚔️ FB (CAPUZ MANA;`;

    const result = processMessage(message);

    // Should extract slots with Portuguese content
    expect(result.extractedSlots.length).toBeGreaterThan(0);
    expect(result.extractedSlots.some(slot => slot.includes("TANK"))).toBe(true);

    // Should extract requirements
    expect(result.extractedRequirements.length).toBeGreaterThan(0);
    expect(result.extractedRequirements.some(req => req.includes("T8"))).toBe(true);
    expect(result.extractedRequirements.some(req => req.includes("8.0"))).toBe(true);

    // Should detect content type
    expect(result.preAssignedContentType).not.toBeNull();
  });

  it("should handle simple messages", () => {
    const message = "Solo dungeon run at 20:00";

    const result = processMessage(message);

    // Should process even simple messages
    expect(result.processedMessage).toBeDefined();
    // Note: Simple messages may still extract some slots due to pattern matching
    expect(result.preAssignedRoles).toEqual([]);
    expect(result.extractedRequirements).toEqual([]);
    expect(result.extractedTime).toBeDefined();
    expect(result.preAssignedContentType).not.toBeNull();
  });

  it("should handle empty messages", () => {
    const message = "";

    const result = processMessage(message);

    // Should handle empty messages gracefully
    expect(result.originalMessage).toBe("");
    expect(result.processedMessage).toBe("");
    expect(result.extractedSlots).toEqual([]);
    expect(result.preAssignedRoles).toEqual([]);
    expect(result.extractedRequirements).toEqual([]);
    expect(result.extractedTime).toBeNull();
    expect(result.preAssignedContentType).toBeNull();
    expect(result.metadata.originalLength).toBe(0);
    expect(result.metadata.processedLength).toBe(0);
    expect(result.metadata.tokenReduction).toBe(0);
  });

  it("should handle messages with only irrelevant content", () => {
    const message = "Hello world! This is just a regular chat message about the weather today.";

    const result = processMessage(message);

    // Should still process but may result in minimal content
    expect(result.processedMessage.length).toBeLessThanOrEqual(message.length);
    expect(result.extractedSlots).toEqual([]);
    expect(result.preAssignedRoles).toEqual([]);
    expect(result.extractedRequirements).toEqual([]);
    expect(result.extractedTime).toBeNull();
    expect(result.preAssignedContentType).toBeNull();
  });

  it("should preserve context through all preprocessors", () => {
    const message = "🛡️ TANK: @user123\n💚 HEALER: @user456\n🔥 DPS: @user789\nTime: 16:30\nRequirements: T8.1 gear";

    const result = processMessage(message);

    // Should extract all information
    expect(result.extractedSlots.length).toBe(3);
    expect(result.preAssignedRoles.length).toBeGreaterThan(0);
    expect(result.extractedTime).toBe("16:30");
    expect(result.extractedRequirements.length).toBeGreaterThan(0);
    expect(result.preAssignedContentType).not.toBeNull();

    // Should have proper metadata
    expect(result.metadata.slotCount).toBe(3);
    expect(result.metadata.requirementCount).toBeGreaterThan(0);
    expect(result.metadata.tokenReduction).toBeGreaterThan(0);
  });
}); 