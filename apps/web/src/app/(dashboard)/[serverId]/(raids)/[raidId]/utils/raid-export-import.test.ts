import type { Raid, RaidSlot } from "@albion-raid-manager/types";

import { raidConfigurationSchema } from "@albion-raid-manager/types/schemas";
import { describe, expect, it } from "vitest";

import {
  applyRaidConfiguration,
  canImportToRaid,
  exportRaidConfiguration,
  validateRaidConfiguration,
} from "./raid-export-import";

describe("Raid Export/Import", () => {
  const mockRaid: Raid = {
    id: "raid-123",
    title: "Test Raid",
    description: "A test raid for export/import",
    note: "Important notes for the raid",
    date: new Date("2024-12-31T20:00:00Z"),
    type: "FIXED",
    contentType: "GROUP_DUNGEON",
    maxPlayers: 8,
    location: "Test Location",
    serverId: "server-123",
    status: "SCHEDULED",
    createdAt: new Date(),
    updatedAt: new Date(),
    slots: [
      {
        id: "slot-1",
        name: "Tank Slot",
        role: "TANK",
        weapon: "T6_2H_HAMMER@0",
        comment: "Main tank",
        userId: null,
        raidId: "raid-123",
        createdAt: new Date(),
        joinedAt: null,
        order: 0,
      },
      {
        id: "slot-2",
        name: "Healer Slot",
        role: "HEALER",
        weapon: "T6_2H_HOLYSTAFF@0",
        comment: "Main healer",
        userId: null,
        raidId: "raid-123",
        createdAt: new Date(),
        joinedAt: null,
        order: 1,
      },
    ] as RaidSlot[],
  };

  describe("exportRaidConfiguration", () => {
    it("should export raid configuration correctly", () => {
      const config = exportRaidConfiguration(mockRaid);

      expect(config.version).toBe("1.0.0");
      expect(config.contentType).toBe("GROUP_DUNGEON");
      expect(config.raidData.description).toBe("A test raid for export/import");
      expect(config.raidData.note).toBe("Important notes for the raid");
      expect(config.raidData.location).toBe("Test Location");
      expect(config.composition.slots).toHaveLength(2);
      expect(config.composition.slots[0]).toEqual({
        name: "Tank Slot",
        role: "TANK",
        weapon: "T6_2H_HAMMER@0",
        comment: "Main tank",
        order: 0,
      });
      expect(config.composition.slots[1]).toEqual({
        name: "Healer Slot",
        role: "HEALER",
        weapon: "T6_2H_HOLYSTAFF@0",
        comment: "Main healer",
        order: 1,
      });
    });
  });

  describe("validateRaidConfiguration", () => {
    it("should validate correct configuration", () => {
      const validConfig = {
        version: "1.0.0",
        exportedAt: "2024-12-31T20:00:00Z",
        contentType: "GROUP_DUNGEON",
        raidData: {
          description: "Test",
          note: "Test note",
          location: "Test location",
        },
        composition: {
          slots: [
            {
              name: "Test Slot",
              role: "TANK",
              weapon: "T6_2H_HAMMER@0",
              comment: "Test comment",
              order: 0,
            },
          ],
        },
      };

      const result = validateRaidConfiguration(validConfig);
      expect(result.isValid).toBe(true);
      expect(result.configuration).toEqual(validConfig);
    });

    it("should reject invalid configuration", () => {
      const invalidConfig = {
        version: "1.0.0",
        // Missing contentType
        raidData: {
          description: "Test",
        },
        composition: {
          slots: [],
        },
      };

      const result = validateRaidConfiguration(invalidConfig);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("contentType: Invalid option");
    });

    it("should reject configuration with invalid slots", () => {
      const invalidConfig = {
        version: "1.0.0",
        exportedAt: "2024-12-31T20:00:00Z",
        contentType: "GROUP_DUNGEON",
        raidData: {
          description: "Test",
        },
        composition: {
          slots: [
            {
              // Missing name
              role: "TANK",
            },
          ],
        },
      };

      const result = validateRaidConfiguration(invalidConfig);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("name: Invalid input: expected string, received undefined");
    });
  });

  describe("canImportToRaid", () => {
    it("should allow import when content types match", () => {
      expect(canImportToRaid("GROUP_DUNGEON", "GROUP_DUNGEON")).toBe(true);
    });

    it("should reject import when content types don't match", () => {
      expect(canImportToRaid("GROUP_DUNGEON", "AVALONIAN_DUNGEON")).toBe(false);
    });

    it("should reject import when raid has no content type", () => {
      expect(canImportToRaid(undefined, "GROUP_DUNGEON")).toBe(false);
    });
  });

  describe("applyRaidConfiguration", () => {
    it("should apply configuration correctly", () => {
      const config = exportRaidConfiguration(mockRaid);
      const result = applyRaidConfiguration(mockRaid, config);

      expect(result.raidUpdates).toEqual({
        description: "A test raid for export/import",
        note: "Important notes for the raid",
        location: "Test Location",
      });

      expect(result.slotUpdates).toHaveLength(2);
      expect(result.slotUpdates[0]).toEqual({
        name: "Tank Slot",
        role: "TANK",
        weapon: "T6_2H_HAMMER@0",
        comment: "Main tank",
        order: 0,
      });
    });
  });

  describe("Raid Configuration Schema", () => {
    const validConfiguration = {
      version: "1.0.0",
      exportedAt: "2024-12-31T20:00:00Z",
      contentType: "GROUP_DUNGEON",
      raidData: {
        description: "Test raid description",
        note: "Test raid note",
        location: "Test location",
      },
      composition: {
        slots: [
          {
            name: "Tank Slot",
            role: "TANK",
            weapon: "T6_2H_HAMMER@0",
            comment: "Main tank",
            order: 0,
          },
          {
            name: "Healer Slot",
            role: "HEALER",
            weapon: "T6_2H_HOLYSTAFF@0",
            comment: "Main healer",
            order: 1,
          },
        ],
      },
    };

    it("should validate a valid configuration", () => {
      const result = raidConfigurationSchema.safeParse(validConfiguration);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validConfiguration);
      }
    });

    it("should reject configuration with missing required fields", () => {
      const invalidConfig = { ...validConfiguration };
      delete (invalidConfig as any).version;

      const result = raidConfigurationSchema.safeParse(invalidConfig);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((err) => err.path.includes("version"))).toBe(true);
      }
    });

    it("should reject configuration with invalid content type", () => {
      const invalidConfig = { ...validConfiguration, contentType: "INVALID_TYPE" };

      const result = raidConfigurationSchema.safeParse(invalidConfig);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((err) => err.path.includes("contentType"))).toBe(true);
      }
    });

    it("should reject configuration with invalid exportedAt format", () => {
      const invalidConfig = { ...validConfiguration, exportedAt: "invalid-date" };

      const result = raidConfigurationSchema.safeParse(invalidConfig);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((err) => err.path.includes("exportedAt"))).toBe(true);
      }
    });

    it("should reject configuration with empty slot names", () => {
      const invalidConfig = {
        ...validConfiguration,
        composition: {
          slots: [
            { name: "", role: "TANK", order: 0 },
            { name: "Valid Slot", role: "HEALER", order: 1 },
          ],
        },
      };

      const result = raidConfigurationSchema.safeParse(invalidConfig);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((err) => err.path.join(".").includes("name"))).toBe(true);
      }
    });

    it("should accept configuration with optional fields missing", () => {
      const minimalConfig = {
        version: "1.0.0",
        exportedAt: "2024-12-31T20:00:00Z",
        contentType: "GROUP_DUNGEON",
        raidData: {},
        composition: {
          slots: [{ name: "Slot 1" }, { name: "Slot 2" }],
        },
      };

      const result = raidConfigurationSchema.safeParse(minimalConfig);
      expect(result.success).toBe(true);
    });

    it("should accept configuration with empty slots array", () => {
      const emptySlotsConfig = {
        ...validConfiguration,
        composition: { slots: [] },
      };

      const result = raidConfigurationSchema.safeParse(emptySlotsConfig);
      expect(result.success).toBe(true);
    });
  });
});
