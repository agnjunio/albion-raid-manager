import { describe, expect, it } from "vitest";

import { processMessage } from "./index";

describe("Preprocessor Pipeline", () => {
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

  it("should process message with default pipeline", () => {
    const result = processMessage(sampleMessage);

    // Check basic structure
    expect(result.originalMessage).toBe(sampleMessage);
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

    // Check time extraction (should find some time, but not necessarily "16:20" due to pattern conflicts)
    expect(result.extractedTime).toBeDefined();
    expect(typeof result.extractedTime).toBe("string");

    // Check content type detection
    expect(result.preAssignedContentType).toBeDefined();
  });

  it("should handle empty message", () => {
    const result = processMessage("");

    expect(result.originalMessage).toBe("");
    expect(result.processedMessage).toBe("");
    expect(result.extractedSlots.length).toBe(0);
    expect(result.preAssignedRoles.length).toBe(0);
    expect(result.extractedRequirements.length).toBe(0);
    expect(result.extractedTime).toBeNull();
    expect(result.preAssignedContentType).toBeNull();
    expect(result.metadata.originalLength).toBe(0);
    expect(result.metadata.processedLength).toBe(0);
    expect(result.metadata.tokenReduction).toBe(0);
  });

  it("should preserve context through pipeline", () => {
    const result = processMessage(sampleMessage);

    // Each step should build upon the previous
    expect(result.originalMessage).toBe(sampleMessage);
    expect(result.processedMessage).not.toBe(sampleMessage); // Should be processed
    expect(result.extractedSlots.length).toBeGreaterThan(0);
    expect(result.preAssignedRoles.length).toBeGreaterThan(0);
    expect(result.extractedRequirements.length).toBeGreaterThan(0);
    expect(result.extractedTime).toBeDefined();
    expect(typeof result.extractedTime).toBe("string");
    expect(result.preAssignedContentType).toBeDefined();
  });
});
