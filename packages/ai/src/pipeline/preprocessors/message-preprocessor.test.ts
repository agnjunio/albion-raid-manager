import { describe, expect, it } from "vitest";

import { messagePreprocessor } from "./message-preprocessor";

import { type PreprocessorContext } from "./index";

describe("Message Preprocessor Pipeline", () => {
  it("should process message and update context correctly", () => {
    const initialContext: PreprocessorContext = {
      originalMessage: "🛡️ TANK: @user123\n💚 HEALER: @user456\n🔥 DPS: @user789",
      processedMessage: "original",
      extractedSlots: [],
      preAssignedRoles: [],
      extractedRequirements: [],
      extractedTime: null,
      preAssignedContentType: null,
      metadata: {
        originalLength: 50,
        processedLength: 8,
        tokenReduction: 42,
        slotCount: 0,
        requirementCount: 0,
      },
    };

    const result = messagePreprocessor(initialContext);

    // Should process the message and extract relevant content
    expect(result.processedMessage).not.toBe("original");
    expect(result.processedMessage.length).toBeLessThan(initialContext.originalMessage.length);
    expect(result.metadata.originalLength).toBe(55); // Actual length of the test message
    expect(result.metadata.processedLength).toBeLessThan(55);
    expect(result.metadata.tokenReduction).toBeGreaterThan(0);
  });

  it("should preserve other context fields", () => {
    const initialContext: PreprocessorContext = {
      originalMessage: "🛡️ TANK: @user123",
      processedMessage: "original",
      extractedSlots: ["existing slot"],
      preAssignedRoles: [{ name: "existing", role: "TANK", confidence: 0.8 }],
      extractedRequirements: ["existing requirement"],
      extractedTime: "16:30",
      preAssignedContentType: {
        type: "GROUP_DUNGEON",
        confidence: 0.7,
        partySize: { min: 2, max: 5 },
        raidType: "FLEX",
      },
      metadata: {
        originalLength: 20,
        processedLength: 8,
        tokenReduction: 12,
        slotCount: 1,
        requirementCount: 1,
      },
    };

    const result = messagePreprocessor(initialContext);

    // Should preserve all other fields
    expect(result.extractedSlots).toEqual(["existing slot"]);
    expect(result.preAssignedRoles).toEqual([{ name: "existing", role: "TANK", confidence: 0.8 }]);
    expect(result.extractedRequirements).toEqual(["existing requirement"]);
    expect(result.extractedTime).toBe("16:30");
    expect(result.preAssignedContentType).toEqual({
      type: "GROUP_DUNGEON",
      confidence: 0.7,
      partySize: { min: 2, max: 5 },
      raidType: "FLEX",
    });
  });

  it("should handle empty message", () => {
    const initialContext: PreprocessorContext = {
      originalMessage: "",
      processedMessage: "original",
      extractedSlots: [],
      preAssignedRoles: [],
      extractedRequirements: [],
      extractedTime: null,
      preAssignedContentType: null,
      metadata: {
        originalLength: 0,
        processedLength: 8,
        tokenReduction: -8,
        slotCount: 0,
        requirementCount: 0,
      },
    };

    const result = messagePreprocessor(initialContext);

    expect(result.processedMessage).toBe("");
    expect(result.metadata.originalLength).toBe(0);
    expect(result.metadata.processedLength).toBe(0);
    expect(result.metadata.tokenReduction).toBe(0);
  });

  it("should handle message with only irrelevant content", () => {
    const initialContext: PreprocessorContext = {
      originalMessage: "Hello world! This is just a regular message with no raid information.",
      processedMessage: "original",
      extractedSlots: [],
      preAssignedRoles: [],
      extractedRequirements: [],
      extractedTime: null,
      preAssignedContentType: null,
      metadata: {
        originalLength: 70,
        processedLength: 8,
        tokenReduction: 62,
        slotCount: 0,
        requirementCount: 0,
      },
    };

    const result = messagePreprocessor(initialContext);

    // Should still process the message but may result in empty content
    expect(result.processedMessage.length).toBeLessThanOrEqual(initialContext.originalMessage.length);
    expect(result.metadata.originalLength).toBe(69); // Actual length of the test message
    expect(result.metadata.processedLength).toBeLessThanOrEqual(69);
  });
});
