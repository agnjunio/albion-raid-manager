import { ContentType } from "@albion-raid-manager/core/types";
import { beforeEach, describe, expect, it } from "vitest";

import { RaidRole } from "../../types";
import { PreprocessorContext } from "../preprocessors";

import { finalizePostprocessor, type PostprocessorContext } from "./index";

describe("Finalize Postprocessor", () => {
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

  it("should create a complete ParsedRaidData object", () => {
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

    const date = new Date("2023-06-15T14:30:00Z");

    const initialContext: PostprocessorContext = {
      originalMessage: "Test message",
      preprocessedContext,
      aiResponse: {},
      aiData: {
        title: "Avalonian Dungeon Run",
        description: "T8 Avalonian Dungeon",
        date,
        location: "Martlock",
        requirements: ["T7 Gear", "1000 IP minimum"],
        roles,
        maxParticipants: 7,
        notes: "Bring food and potions",
        confidence: 0.85,
        contentType: "ROADS_OF_AVALON_PVE" as ContentType,
        contentTypeConfidence: 0.9,
      },
      data: null,
      metadata: {
        processingTime: 0,
        validationErrors: [],
        confidence: 0,
      },
    };

    const result = finalizePostprocessor(initialContext);

    expect(result.data).toEqual({
      title: "Avalonian Dungeon Run",
      description: "T8 Avalonian Dungeon",
      date,
      location: "Martlock",
      requirements: ["T7 Gear", "1000 IP minimum"],
      roles,
      maxParticipants: 7,
      notes: "Bring food and potions",
      confidence: 0.85,
      contentType: "ROADS_OF_AVALON_PVE",
      contentTypeConfidence: 0.9,
    });
  });

  it("should use default title when not provided", () => {
    const initialContext: PostprocessorContext = {
      originalMessage: "Test message",
      preprocessedContext,
      aiResponse: {},
      aiData: {
        date: new Date(),
        requirements: [],
        roles: [],
        confidence: 0.5,
        contentType: "GROUP_DUNGEON" as ContentType,
        contentTypeConfidence: 0.7,
      },
      data: null,
      metadata: {
        processingTime: 0,
        validationErrors: [],
        confidence: 0,
      },
    };

    const result = finalizePostprocessor(initialContext);

    expect(result.data?.title).toBe("Raid");
  });

  it("should handle missing optional fields", () => {
    const initialContext: PostprocessorContext = {
      originalMessage: "Test message",
      preprocessedContext,
      aiResponse: {},
      aiData: {
        title: "Simple Raid",
        date: new Date(),
        requirements: [],
        roles: [],
        confidence: 0.5,
        contentType: "GROUP_DUNGEON" as ContentType,
        contentTypeConfidence: 0.7,
      },
      data: null,
      metadata: {
        processingTime: 0,
        validationErrors: [],
        confidence: 0,
      },
    };

    const result = finalizePostprocessor(initialContext);

    expect(result.data).toEqual({
      title: "Simple Raid",
      description: undefined,
      date: expect.any(Date),
      location: undefined,
      requirements: [],
      roles: [],
      maxParticipants: undefined,
      notes: undefined,
      confidence: 0.5,
      contentType: "GROUP_DUNGEON",
      contentTypeConfidence: 0.7,
    });
  });
});
