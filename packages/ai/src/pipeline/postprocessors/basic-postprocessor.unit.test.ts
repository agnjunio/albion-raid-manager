import { ContentType } from "@albion-raid-manager/types";
import { beforeEach, describe, expect, it } from "vitest";

import { basicPostprocessor } from "./basic-postprocessor";
import { type PostprocessorContext } from "./types";

describe("Basic Postprocessor", () => {
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

  it("should use AI-provided title", () => {
    initialContext.aiData.title = "Test Raid";

    const result = basicPostprocessor(initialContext);

    expect(result).not.toBeNull();
    expect(result!.parsedData.title).toBe("Test Raid");
  });

  it("should use default title when not provided", () => {
    initialContext.aiData.title = "";

    const result = basicPostprocessor(initialContext);

    expect(result).not.toBeNull();
    expect(result!.parsedData.title).toBe("Raid");
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
