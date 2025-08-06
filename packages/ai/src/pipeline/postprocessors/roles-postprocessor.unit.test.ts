import { beforeEach, describe, expect, it } from "vitest";

import { type AiRaidRole } from "../../types";

import { rolesPostprocessor } from "./roles-postprocessor";
import { type PostprocessorContext } from "./types";

describe("Roles Postprocessor", () => {
  let initialContext: PostprocessorContext;

  beforeEach(() => {
    initialContext = {
      originalMessage: "Test message",
      preprocessedContext: {
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
      },
      aiData: {
        title: "Test Raid",
        contentType: "GROUP_DUNGEON",
        timestamp: "2023-06-15",
        location: "Fort Sterling",
        requirements: ["T6 Gear"],
        roles: [],
      },
      parsedData: {
        title: "",
        date: new Date(),
        confidence: 0,
        notes: "",
      },
      metadata: {
        processingTime: 0,
        validationErrors: [],
        confidence: 0,
      },
    };
  });

  it("should normalize roles with string preAssignedUser", () => {
    const roles: AiRaidRole[] = [
      {
        name: "Tank",
        role: "TANK",
        preAssignedUser: "user123",
      },
      {
        name: "Healer",
        role: "HEALER",
        preAssignedUser: "user456",
      },
    ];

    initialContext.aiData.roles = roles;

    const result = rolesPostprocessor(initialContext);

    expect(result).not.toBeNull();
    expect(result!.parsedData.roles).toEqual([
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
    const roles: AiRaidRole[] = [
      {
        name: "Tank",
        role: "TANK",
        preAssignedUser: 123 as unknown as string, // Simulating incorrect type
      },
    ];

    initialContext.aiData.roles = roles;

    const result = rolesPostprocessor(initialContext);

    expect(result).not.toBeNull();
    expect(result!.parsedData.roles).toEqual([
      {
        name: "Tank",
        role: "TANK",
        count: 1,
        preAssignedUser: undefined,
      },
    ]);
  });

  it("should handle undefined roles", () => {
    delete initialContext.aiData.roles;

    const result = rolesPostprocessor(initialContext);

    expect(result).not.toBeNull();
    expect(result!.parsedData.roles).toEqual([]);
  });

  it("should preserve other role properties", () => {
    const roles: AiRaidRole[] = [
      {
        name: "Tank",
        role: "TANK",
        preAssignedUser: "user123",
      },
    ];

    initialContext.aiData.roles = roles;

    const result = rolesPostprocessor(initialContext);

    expect(result).not.toBeNull();
    expect(result!.parsedData.roles).toEqual([
      {
        name: "Tank",
        role: "TANK",
        count: 1,
        preAssignedUser: "user123",
      },
    ]);
  });
});
