import { describe, expect, it } from "vitest";

import { contentTypePreprocessor } from "./content-type-preprocessor";

import { type PreprocessorContext } from "./index";

describe("Content Type Preprocessor Pipeline", () => {
  it("should detect content type and update context correctly", () => {
    const initialContext: PreprocessorContext = {
      originalMessage: "Solo dungeon run",
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

    const result = contentTypePreprocessor(initialContext);

    // Should detect content type
    expect(result.preAssignedContentType).not.toBeNull();
    expect(result.preAssignedContentType?.type).toBe("SOLO_DUNGEON");
    expect(result.preAssignedContentType?.confidence).toBeGreaterThan(0);
    expect(result.preAssignedContentType?.confidence).toBeLessThanOrEqual(1);

    // Should preserve other fields
    expect(result.processedMessage).toBe("processed");
    expect(result.extractedSlots).toEqual([]);
    expect(result.preAssignedRoles).toEqual([]);
  });

  it("should handle group dungeon content", () => {
    const initialContext: PreprocessorContext = {
      originalMessage: "Group dungeon with 5 people",
      processedMessage: "processed",
      extractedSlots: [],
      preAssignedRoles: [],
      extractedRequirements: [],
      extractedTime: null,
      preAssignedContentType: null,
      metadata: {
        originalLength: 30,
        processedLength: 25,
        tokenReduction: 5,
        slotCount: 0,
        requirementCount: 0,
      },
    };

    const result = contentTypePreprocessor(initialContext);

    expect(result.preAssignedContentType).not.toBeNull();
    expect(result.preAssignedContentType?.type).toBe("GROUP_DUNGEON");
    expect(result.preAssignedContentType?.partySize.min).toBe(2);
    expect(result.preAssignedContentType?.partySize.max).toBe(5);
    expect(result.preAssignedContentType?.raidType).toBe("FLEX");
  });

  it("should handle open world farming content", () => {
    const initialContext: PreprocessorContext = {
      originalMessage: "Open world farming and gathering",
      processedMessage: "processed",
      extractedSlots: [],
      preAssignedRoles: [],
      extractedRequirements: [],
      extractedTime: null,
      preAssignedContentType: null,
      metadata: {
        originalLength: 35,
        processedLength: 30,
        tokenReduction: 5,
        slotCount: 0,
        requirementCount: 0,
      },
    };

    const result = contentTypePreprocessor(initialContext);

    expect(result.preAssignedContentType).not.toBeNull();
    expect(result.preAssignedContentType?.type).toBe("OPEN_WORLD_FARMING");
    expect(result.preAssignedContentType?.partySize.min).toBe(1);
    expect(result.preAssignedContentType?.partySize.max).toBe(20);
    expect(result.preAssignedContentType?.raidType).toBe("FLEX");
  });

  it("should handle avalonian dungeon content", () => {
    const initialContext: PreprocessorContext = {
      originalMessage: "Avalonian Roads PvE, need 7 people",
      processedMessage: "processed",
      extractedSlots: ["Tank", "Healer", "DPS 1", "DPS 2", "DPS 3", "DPS 4", "DPS 5"],
      preAssignedRoles: [],
      extractedRequirements: [],
      extractedTime: null,
      preAssignedContentType: null,
      metadata: {
        originalLength: 20,
        processedLength: 15,
        tokenReduction: 5,
        slotCount: 7,
        requirementCount: 0,
      },
    };

    const result = contentTypePreprocessor(initialContext);

    expect(result.preAssignedContentType).not.toBeNull();
    expect(result.preAssignedContentType?.type).toBe("ROADS_OF_AVALON_PVE");
    expect(result.preAssignedContentType?.partySize.min).toBe(7);
    expect(result.preAssignedContentType?.partySize.max).toBe(7);
    expect(result.preAssignedContentType?.raidType).toBe("FIXED");
  });

  it("should handle roads of avalon content", () => {
    const initialContext: PreprocessorContext = {
      originalMessage: "Roads of Avalon PvE with golden chest - 7 people needed",
      processedMessage: "processed",
      extractedSlots: ["Tank", "Healer", "DPS 1", "DPS 2", "DPS 3", "DPS 4", "DPS 5"],
      preAssignedRoles: [],
      extractedRequirements: [],
      extractedTime: null,
      preAssignedContentType: null,
      metadata: {
        originalLength: 40,
        processedLength: 35,
        tokenReduction: 5,
        slotCount: 7,
        requirementCount: 0,
      },
    };

    const result = contentTypePreprocessor(initialContext);

    expect(result.preAssignedContentType).not.toBeNull();
    expect(result.preAssignedContentType?.type).toBe("ROADS_OF_AVALON_PVE");
    expect(result.preAssignedContentType?.partySize.min).toBe(7);
    expect(result.preAssignedContentType?.partySize.max).toBe(7);
    expect(result.preAssignedContentType?.raidType).toBe("FIXED");
  });

  it("should handle unknown content type", () => {
    const initialContext: PreprocessorContext = {
      originalMessage: "Random activity with some specific roles",
      processedMessage: "processed",
      extractedSlots: ["Role 1", "Role 2"],
      preAssignedRoles: [],
      extractedRequirements: [],
      extractedTime: null,
      preAssignedContentType: null,
      metadata: {
        originalLength: 50,
        processedLength: 45,
        tokenReduction: 5,
        slotCount: 2,
        requirementCount: 0,
      },
    };

    const result = contentTypePreprocessor(initialContext);

    // Should return GROUP_DUNGEON as fallback for messages with 2-5 roles
    expect(result.preAssignedContentType).not.toBeNull();
    expect(result.preAssignedContentType?.type).toBe("GROUP_DUNGEON");
    expect(result.preAssignedContentType?.partySize.min).toBe(2);
    expect(result.preAssignedContentType?.partySize.max).toBe(5);
  });

  it("should handle empty message", () => {
    const initialContext: PreprocessorContext = {
      originalMessage: "",
      processedMessage: "processed",
      extractedSlots: [],
      preAssignedRoles: [],
      extractedRequirements: [],
      extractedTime: null,
      preAssignedContentType: null,
      metadata: {
        originalLength: 0,
        processedLength: 0,
        tokenReduction: 0,
        slotCount: 0,
        requirementCount: 0,
      },
    };

    const result = contentTypePreprocessor(initialContext);

    expect(result.preAssignedContentType).toBeNull();
  });

  it("should preserve existing content type", () => {
    const existingContentType = {
      type: "GROUP_DUNGEON" as const,
      confidence: 0.8,
      partySize: { min: 2, max: 5 },
      raidType: "FLEX" as const,
    };

    const initialContext: PreprocessorContext = {
      originalMessage: "Solo dungeon run",
      processedMessage: "processed",
      extractedSlots: [],
      preAssignedRoles: [],
      extractedRequirements: [],
      extractedTime: null,
      preAssignedContentType: existingContentType,
      metadata: {
        originalLength: 20,
        processedLength: 15,
        tokenReduction: 5,
        slotCount: 0,
        requirementCount: 0,
      },
    };

    const result = contentTypePreprocessor(initialContext);

    // Should detect new content type from message
    expect(result.preAssignedContentType).not.toBeNull();
    expect(result.preAssignedContentType?.type).toBe("SOLO_DUNGEON");
  });
});
