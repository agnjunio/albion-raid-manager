import { describe, expect, it } from "vitest";

import { requirementPreprocessor, slotPreprocessor } from "./slot-preprocessor";

import { type PreprocessorContext } from "./index";

describe("Slot Preprocessor Pipeline", () => {
  it("should extract slots and update context correctly", () => {
    const initialContext: PreprocessorContext = {
      originalMessage: "🛡️ TANK: @user123\n💚 HEALER: @user456\n🔥 DPS: @user789",
      processedMessage: "processed",
      extractedSlots: [],
      preAssignedRoles: [],
      extractedRequirements: [],
      extractedTime: null,
      preAssignedContentType: null,
      metadata: {
        originalLength: 50,
        processedLength: 30,
        tokenReduction: 20,
        slotCount: 0,
        requirementCount: 0,
      },
    };

    const result = slotPreprocessor(initialContext);

    // Should extract slots
    expect(result.extractedSlots.length).toBeGreaterThan(0);
    expect(result.metadata.slotCount).toBeGreaterThan(0);
    expect(result.metadata.slotCount).toBe(result.extractedSlots.length);

    // Should preserve other fields
    expect(result.processedMessage).toBe("processed");
    expect(result.preAssignedRoles).toEqual([]);
    expect(result.extractedRequirements).toEqual([]);
  });

  it("should handle slots with user mentions", () => {
    const initialContext: PreprocessorContext = {
      originalMessage: "🛡️ TANK: @user123\n💚 HEALER: @user456",
      processedMessage: "processed",
      extractedSlots: [],
      preAssignedRoles: [],
      extractedRequirements: [],
      extractedTime: null,
      preAssignedContentType: null,
      metadata: {
        originalLength: 40,
        processedLength: 30,
        tokenReduction: 10,
        slotCount: 0,
        requirementCount: 0,
      },
    };

    const result = slotPreprocessor(initialContext);

    // Should extract slots with user mentions
    expect(result.extractedSlots.length).toBe(2);
    expect(result.extractedSlots.some((slot) => slot.includes("@user123"))).toBe(true);
    expect(result.extractedSlots.some((slot) => slot.includes("@user456"))).toBe(true);
  });

  it("should handle slots without user mentions", () => {
    const initialContext: PreprocessorContext = {
      originalMessage: "🛡️ TANK: -\n💚 HEALER: -",
      processedMessage: "processed",
      extractedSlots: [],
      preAssignedRoles: [],
      extractedRequirements: [],
      extractedTime: null,
      preAssignedContentType: null,
      metadata: {
        originalLength: 30,
        processedLength: 20,
        tokenReduction: 10,
        slotCount: 0,
        requirementCount: 0,
      },
    };

    const result = slotPreprocessor(initialContext);

    // Should extract slots without user mentions
    expect(result.extractedSlots.length).toBe(2);
    expect(result.extractedSlots.every((slot) => !slot.includes("@"))).toBe(true);
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

    const result = slotPreprocessor(initialContext);

    expect(result.extractedSlots).toEqual([]);
    expect(result.metadata.slotCount).toBe(0);
  });
});

describe("Requirement Preprocessor Pipeline", () => {
  it("should extract requirements and update context correctly", () => {
    const initialContext: PreprocessorContext = {
      originalMessage: "Requirements: T8.1 gear, 8.0 food, 120+ mount",
      processedMessage: "processed",
      extractedSlots: [],
      preAssignedRoles: [],
      extractedRequirements: [],
      extractedTime: null,
      preAssignedContentType: null,
      metadata: {
        originalLength: 50,
        processedLength: 30,
        tokenReduction: 20,
        slotCount: 0,
        requirementCount: 0,
      },
    };

    const result = requirementPreprocessor(initialContext);

    // Should extract requirements
    expect(result.extractedRequirements.length).toBeGreaterThan(0);
    expect(result.metadata.requirementCount).toBeGreaterThan(0);
    expect(result.metadata.requirementCount).toBe(result.extractedRequirements.length);

    // Should preserve other fields
    expect(result.processedMessage).toBe("processed");
    expect(result.extractedSlots).toEqual([]);
    expect(result.preAssignedRoles).toEqual([]);
  });

  it("should handle gear tier requirements", () => {
    const initialContext: PreprocessorContext = {
      originalMessage: "T8.1 gear required",
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

    const result = requirementPreprocessor(initialContext);

    expect(result.extractedRequirements.length).toBeGreaterThan(0);
    expect(result.extractedRequirements.some((req) => req.includes("T8.1"))).toBe(true);
  });

  it("should handle food requirements", () => {
    const initialContext: PreprocessorContext = {
      originalMessage: "8.0 food required",
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

    const result = requirementPreprocessor(initialContext);

    expect(result.extractedRequirements.length).toBeGreaterThan(0);
    expect(result.extractedRequirements.some((req) => req.includes("8.0"))).toBe(true);
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

    const result = requirementPreprocessor(initialContext);

    expect(result.extractedRequirements).toEqual([]);
    expect(result.metadata.requirementCount).toBe(0);
  });
});
