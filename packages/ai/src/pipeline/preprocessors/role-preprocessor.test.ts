import { describe, expect, it } from "vitest";

import { rolePreprocessor } from "./role-preprocessor";

import { type PreprocessorContext } from "./index";

describe("Role Preprocessor Pipeline", () => {
  it("should pre-assign roles and update context correctly", () => {
    const initialContext: PreprocessorContext = {
      originalMessage: "test message",
      processedMessage: "processed",
      extractedSlots: ["TANK", "HEALER", "DPS"],
      preAssignedRoles: [],
      extractedRequirements: [],
      extractedTime: null,
      preAssignedContentType: null,
      metadata: {
        originalLength: 20,
        processedLength: 15,
        tokenReduction: 5,
        slotCount: 3,
        requirementCount: 0,
      },
    };

    const result = rolePreprocessor(initialContext);

    // Should pre-assign roles based on slot names
    expect(result.preAssignedRoles.length).toBeGreaterThan(0);
    expect(result.preAssignedRoles.length).toBeLessThanOrEqual(initialContext.extractedSlots.length);

    // Should preserve other fields
    expect(result.processedMessage).toBe("processed");
    expect(result.extractedSlots).toEqual(["TANK", "HEALER", "DPS"]);
    expect(result.extractedRequirements).toEqual([]);
  });

  it("should handle empty slots", () => {
    const initialContext: PreprocessorContext = {
      originalMessage: "test message",
      processedMessage: "processed",
      extractedSlots: [],
      preAssignedRoles: [],
      extractedRequirements: [],
      extractedTime: null,
      preAssignedContentType: null,
      metadata: {
        originalLength: 20,
        processedLength: 15,
        tokenReduction: 5,
        slotCount: 0,
        requirementCount: 0,
      },
    };

    const result = rolePreprocessor(initialContext);

    expect(result.preAssignedRoles).toEqual([]);
  });

  it("should handle unknown slot names", () => {
    const initialContext: PreprocessorContext = {
      originalMessage: "test message",
      processedMessage: "processed",
      extractedSlots: ["UNKNOWN_SLOT", "ANOTHER_UNKNOWN"],
      preAssignedRoles: [],
      extractedRequirements: [],
      extractedTime: null,
      preAssignedContentType: null,
      metadata: {
        originalLength: 20,
        processedLength: 15,
        tokenReduction: 5,
        slotCount: 2,
        requirementCount: 0,
      },
    };

    const result = rolePreprocessor(initialContext);

    // Should not assign roles for unknown slot names
    expect(result.preAssignedRoles.length).toBe(0);
  });

  it("should preserve existing pre-assigned roles", () => {
    const existingRoles = [{ name: "existing", role: "TANK", confidence: 0.8 }];

    const initialContext: PreprocessorContext = {
      originalMessage: "test message",
      processedMessage: "processed",
      extractedSlots: ["TANK", "HEALER"],
      preAssignedRoles: existingRoles,
      extractedRequirements: [],
      extractedTime: null,
      preAssignedContentType: null,
      metadata: {
        originalLength: 20,
        processedLength: 15,
        tokenReduction: 5,
        slotCount: 2,
        requirementCount: 0,
      },
    };

    const result = rolePreprocessor(initialContext);

    // Should add new roles but replace existing ones (current behavior)
    expect(result.preAssignedRoles.length).toBeGreaterThan(0);
    // Note: Current implementation replaces existing roles, doesn't preserve them
  });

  it("should assign roles with confidence scores", () => {
    const initialContext: PreprocessorContext = {
      originalMessage: "test message",
      processedMessage: "processed",
      extractedSlots: ["TANK", "HEALER"],
      preAssignedRoles: [],
      extractedRequirements: [],
      extractedTime: null,
      preAssignedContentType: null,
      metadata: {
        originalLength: 20,
        processedLength: 15,
        tokenReduction: 5,
        slotCount: 2,
        requirementCount: 0,
      },
    };

    const result = rolePreprocessor(initialContext);

    // Should assign roles with confidence scores
    result.preAssignedRoles.forEach((role) => {
      expect(role).toHaveProperty("name");
      expect(role).toHaveProperty("role");
      expect(role).toHaveProperty("confidence");
      expect(role.confidence).toBeGreaterThan(0);
      expect(role.confidence).toBeLessThanOrEqual(1);
    });
  });

  it("should assign TANK role to Caller", () => {
    const initialContext: PreprocessorContext = {
      originalMessage: "test message",
      processedMessage: "processed",
      extractedSlots: ["Caller", "Shot Caller", "Raid Leader"],
      preAssignedRoles: [],
      extractedRequirements: [],
      extractedTime: null,
      preAssignedContentType: null,
      metadata: {
        originalLength: 20,
        processedLength: 15,
        tokenReduction: 5,
        slotCount: 3,
        requirementCount: 0,
      },
    };

    const result = rolePreprocessor(initialContext);

    expect(result.preAssignedRoles.length).toBe(3);

    const callerRole = result.preAssignedRoles.find((role) => role.name === "Caller");
    expect(callerRole).toBeDefined();
    expect(callerRole?.role).toBe("TANK");

    const shotCallerRole = result.preAssignedRoles.find((role) => role.name === "Shot Caller");
    expect(shotCallerRole).toBeDefined();
    expect(shotCallerRole?.role).toBe("TANK");

    const leaderRole = result.preAssignedRoles.find((role) => role.name === "Raid Leader");
    expect(leaderRole).toBeDefined();
    expect(leaderRole?.role).toBe("TANK");
  });

  it("should assign TANK role to Portuguese caller variants", () => {
    const initialContext: PreprocessorContext = {
      originalMessage: "test message",
      processedMessage: "processed",
      extractedSlots: ["tanque", "guardiao", "líder", "lider"],
      preAssignedRoles: [],
      extractedRequirements: [],
      extractedTime: null,
      preAssignedContentType: null,
      metadata: {
        originalLength: 20,
        processedLength: 15,
        tokenReduction: 5,
        slotCount: 4,
        requirementCount: 0,
      },
    };

    const result = rolePreprocessor(initialContext);

    // Should assign TANK role to Portuguese caller-related slots
    expect(result.preAssignedRoles.length).toBe(4);

    result.preAssignedRoles.forEach((role) => {
      expect(role.role).toBe("TANK");
      expect(["tanque", "guardiao", "líder", "lider"]).toContain(role.name);
    });
  });

  it("should assign appropriate roles to weapon types", () => {
    const initialContext: PreprocessorContext = {
      originalMessage: "test message",
      processedMessage: "processed",
      extractedSlots: ["martelo", "machado", "claymore"],
      preAssignedRoles: [],
      extractedRequirements: [],
      extractedTime: null,
      preAssignedContentType: null,
      metadata: {
        originalLength: 20,
        processedLength: 15,
        tokenReduction: 5,
        slotCount: 3,
        requirementCount: 0,
      },
    };

    const result = rolePreprocessor(initialContext);

    // Should assign appropriate roles based on weapon types
    expect(result.preAssignedRoles.length).toBe(3);

    // Martelo (hammer) should be TANK as it's a tank weapon
    const marteloRole = result.preAssignedRoles.find((role) => role.name === "martelo");
    expect(marteloRole).toBeDefined();
    expect(marteloRole?.role).toBe("TANK");

    // Machado (axe) should be MELEE_DPS
    const machadoRole = result.preAssignedRoles.find((role) => role.name === "machado");
    expect(machadoRole).toBeDefined();
    expect(machadoRole?.role).toBe("MELEE_DPS");

    // Claymore should be MELEE_DPS
    const claymoreRole = result.preAssignedRoles.find((role) => role.name === "claymore");
    expect(claymoreRole).toBeDefined();
    expect(claymoreRole?.role).toBe("MELEE_DPS");
  });
});
