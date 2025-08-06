import { beforeEach, describe, expect, it } from "vitest";

import { type RaidRole } from "../../types";
import { PreprocessorContext } from "../preprocessors";

import { rolesPostprocessor, type PostprocessorContext } from "./index";

describe("Roles Postprocessor", () => {
  let preprocessedContext: PreprocessorContext;

  beforeEach(() => {
    preprocessedContext = {
      originalMessage: "Test message",
      processedMessage: "Test message",
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
  });

  it("should normalize roles with string preAssignedUser", () => {
    const roles: RaidRole[] = [
      {
        name: "Tank",
        role: "TANK",
        count: 1,
        preAssignedUser: "user123",
      },
      {
        name: "Healer",
        role: "HEALER",
        count: 1,
        preAssignedUser: "user456",
      },
    ];

    const initialContext: PostprocessorContext = {
      originalMessage: "Test message",
      preprocessedContext,
      aiResponse: {},
      aiData: { roles },
      data: null,
      metadata: {
        processingTime: 0,
        validationErrors: [],
        confidence: 0,
      },
    };

    const result = rolesPostprocessor(initialContext);

    expect(result.aiData.roles).toEqual([
      {
        name: "Tank",
        role: "TANK",
        count: 1,
        preAssignedUser: "user123",
      },
      {
        name: "Healer",
        role: "HEALER",
        count: 1,
        preAssignedUser: "user456",
      },
    ]);
  });

  it("should handle non-string preAssignedUser", () => {
    const roles: RaidRole[] = [
      {
        name: "Tank",
        role: "TANK",
        count: 1,
        preAssignedUser: 123 as unknown as string, // Simulating incorrect type
      },
    ];

    const initialContext: PostprocessorContext = {
      originalMessage: "Test message",
      preprocessedContext,
      aiResponse: {},
      aiData: { roles },
      data: null,
      metadata: {
        processingTime: 0,
        validationErrors: [],
        confidence: 0,
      },
    };

    const result = rolesPostprocessor(initialContext);

    expect(result.aiData.roles).toEqual([
      {
        name: "Tank",
        role: "TANK",
        count: 1,
        preAssignedUser: undefined,
      },
    ]);
  });

  it("should handle undefined roles", () => {
    const initialContext: PostprocessorContext = {
      originalMessage: "Test message",
      preprocessedContext,
      aiResponse: {},
      aiData: {},
      data: null,
      metadata: {
        processingTime: 0,
        validationErrors: [],
        confidence: 0,
      },
    };

    const result = rolesPostprocessor(initialContext);

    expect(result.aiData.roles).toEqual([]);
  });

  it("should preserve other role properties", () => {
    const roles: RaidRole[] = [
      {
        name: "Tank",
        role: "TANK",
        count: 1,
        preAssignedUser: "user123",
        requirements: ["Heavy Armor", "Shield"],
      },
    ];

    const initialContext: PostprocessorContext = {
      originalMessage: "Test message",
      preprocessedContext,
      aiResponse: {},
      aiData: { roles },
      data: null,
      metadata: {
        processingTime: 0,
        validationErrors: [],
        confidence: 0,
      },
    };

    const result = rolesPostprocessor(initialContext);

    expect(result.aiData.roles).toEqual([
      {
        name: "Tank",
        role: "TANK",
        count: 1,
        preAssignedUser: "user123",
        requirements: ["Heavy Armor", "Shield"],
      },
    ]);
  });
});
