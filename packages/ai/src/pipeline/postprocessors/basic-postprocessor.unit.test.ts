import { ContentType } from "@albion-raid-manager/core/types";
import { beforeEach, describe, expect, it } from "vitest";

import { basicPostprocessor } from "./basic-postprocessor";
import { type PostprocessorContext } from "./types";

describe("Location Requirements Postprocessor", () => {
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
        contentType: "GROUP_DUNGEON" as ContentType,
        timestamp: "2023-06-15",
        location: "Fort Sterling",
        requirements: ["T6 Gear", "800 IP minimum"],
        roles: [],
        confidence: 0.85,
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

  it("should use AI-provided location", () => {
    initialContext.aiData.location = "Fort Sterling";

    const result = basicPostprocessor(initialContext);

    expect(result).not.toBeNull();
    expect(result!.parsedData.location).toBe("Fort Sterling");
  });

  it("should use default location when not provided", () => {
    initialContext.aiData.location = "";

    const result = basicPostprocessor(initialContext);

    expect(result).not.toBeNull();
    expect(result!.parsedData.location).toBeDefined();
  });

  it("should use AI-provided requirements", () => {
    initialContext.aiData.requirements = ["T6 Gear", "800 IP minimum"];

    const result = basicPostprocessor(initialContext);

    expect(result).not.toBeNull();
    expect(result!.parsedData.requirements).toEqual(["T6 Gear", "800 IP minimum"]);
  });

  it("should use extracted requirements when AI requirements not provided", () => {
    initialContext.aiData.requirements = [];
    initialContext.preprocessedContext.extractedRequirements = ["T7 Gear", "1000 IP minimum"];

    const result = basicPostprocessor(initialContext);

    expect(result).not.toBeNull();
    expect(result!.parsedData.requirements).toEqual(["T7 Gear", "1000 IP minimum"]);
  });

  it("should default to empty requirements when none are available", () => {
    initialContext.aiData.requirements = [];
    initialContext.preprocessedContext.extractedRequirements = []; // Empty array

    const result = basicPostprocessor(initialContext);

    expect(result).not.toBeNull();
    expect(result!.parsedData.requirements).toEqual([]);
  });
});
