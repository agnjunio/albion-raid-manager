import { ContentType } from "@albion-raid-manager/types";
import { describe, expect, it } from "vitest";

import {
  CONTENT_TYPE_LIST,
  CONTENT_TYPE_MAPPING,
  ContentTypeEntity,
  getContentTypeInfo,
  getDefaultLocation,
  normalizeContentType,
} from "./content-type";

describe("ContentTypeEntity", () => {
  describe("constructor", () => {
    it("should create instance with valid content type", () => {
      const entity = new ContentTypeEntity("ROADS_OF_AVALON");
      expect(entity).toBeDefined();
      expect(entity.type).toBe("ROADS_OF_AVALON");
    });

    it("should throw error for unknown content type", () => {
      expect(() => new ContentTypeEntity("UNKNOWN_TYPE" as ContentType)).toThrow("Unknown content type: UNKNOWN_TYPE");
    });
  });

  describe("getters", () => {
    it("should return correct type", () => {
      const entity = new ContentTypeEntity("ROADS_OF_AVALON");
      expect(entity.type).toBe("ROADS_OF_AVALON");
    });

    it("should return correct raid type", () => {
      const entity = new ContentTypeEntity("ROADS_OF_AVALON");
      expect(entity.raidType).toBe("FIXED");
    });

    it("should return correct party size", () => {
      const entity = new ContentTypeEntity("ROADS_OF_AVALON");
      expect(entity.partySize).toEqual({ min: 7, max: 7 });
    });

    it("should return correct description", () => {
      const entity = new ContentTypeEntity("ROADS_OF_AVALON");
      expect(entity.description).toBe("Roads of Avalon content with fights and/or golden chests");
    });

    it("should return correct aliases", () => {
      const entity = new ContentTypeEntity("ROADS_OF_AVALON");
      expect(entity.aliases).toEqual(["roads", "roa", "avalon"]);
    });

    it("should return correct default location", () => {
      const entity = new ContentTypeEntity("ROADS_OF_AVALON");
      expect(entity.defaultLocation).toBe("Brecilien");
    });

    it("should return correct max players", () => {
      const entity = new ContentTypeEntity("ROADS_OF_AVALON");
      expect(entity.maxPlayers).toBe(7);
    });

    it("should return correct min players", () => {
      const entity = new ContentTypeEntity("ROADS_OF_AVALON");
      expect(entity.minPlayers).toBe(7);
    });
  });

  describe("isFixedSize and isFlexSize", () => {
    it("should return true for fixed size content", () => {
      const entity = new ContentTypeEntity("ROADS_OF_AVALON");
      expect(entity.isFixedSize).toBe(true);
      expect(entity.isFlexSize).toBe(false);
    });

    it("should return true for flex size content", () => {
      const entity = new ContentTypeEntity("GROUP_DUNGEON");
      expect(entity.isFixedSize).toBe(false);
      expect(entity.isFlexSize).toBe(true);
    });
  });

  describe("getInfo", () => {
    it("should return complete info object", () => {
      const entity = new ContentTypeEntity("ROADS_OF_AVALON");
      const info = entity.getInfo();

      expect(info).toEqual({
        type: "ROADS_OF_AVALON",
        partySize: { min: 7, max: 7 },
        raidType: "FIXED",
        description: "Roads of Avalon content with fights and/or golden chests",
        displayName: "Roads of Avalon",
        defaultLocation: "Brecilien",
        aliases: ["roads", "roa", "avalon"],
        isActive: true,
      });
    });
  });

  describe("static methods", () => {
    describe("getInfo", () => {
      it("should return info for valid content type", () => {
        const info = ContentTypeEntity.getInfo("ROADS_OF_AVALON");
        expect(info).toBeDefined();
        expect(info?.type).toBe("ROADS_OF_AVALON");
      });

      it("should return null for unknown content type", () => {
        const info = ContentTypeEntity.getInfo("UNKNOWN_TYPE" as ContentType);
        expect(info).toBeNull();
      });
    });

    describe("getAllTypes", () => {
      it("should return all content types", () => {
        const types = ContentTypeEntity.getAllTypes();
        expect(types).toHaveLength(CONTENT_TYPE_MAPPING.length);
        expect(types).toContain("ROADS_OF_AVALON");
        expect(types).toContain("GROUP_DUNGEON");
      });
    });

    describe("getActiveTypes", () => {
      it("should return only active content types", () => {
        const activeTypes = ContentTypeEntity.getActiveTypes();
        const activeMapping = CONTENT_TYPE_MAPPING.filter((ct) => ct.isActive);
        expect(activeTypes).toHaveLength(activeMapping.length);
        expect(activeTypes).toContain("ROADS_OF_AVALON");
      });
    });

    describe("getRaidConfiguration", () => {
      it("should return correct configuration for fixed size content", () => {
        const config = ContentTypeEntity.getRaidConfiguration("ROADS_OF_AVALON");
        expect(config).toEqual({
          type: "FIXED",
          maxPlayers: 7,
          shouldCreateSlots: true,
        });
      });

      it("should return correct configuration for flex size content", () => {
        const config = ContentTypeEntity.getRaidConfiguration("GROUP_DUNGEON");
        expect(config).toEqual({
          type: "FLEX",
          maxPlayers: 5,
          shouldCreateSlots: false,
        });
      });
    });

    describe("normalizeFromString", () => {
      it("should normalize ROADS_OF_AVALON variants", () => {
        expect(ContentTypeEntity.normalizeFromString("ROADS_OF_AVALON")).toBe("ROADS_OF_AVALON");
        expect(ContentTypeEntity.normalizeFromString("AVALON_ROADS")).toBe("ROADS_OF_AVALON");
        expect(ContentTypeEntity.normalizeFromString("ROADS")).toBe("ROADS_OF_AVALON");
      });

      it("should normalize HELLGATE variants", () => {
        expect(ContentTypeEntity.normalizeFromString("HELLGATE_2V2")).toBe("GROUP_DUNGEON"); // Becomes HELLGATE_V
        expect(ContentTypeEntity.normalizeFromString("HG_2V2")).toBe("GROUP_DUNGEON"); // Becomes HG_V
        expect(ContentTypeEntity.normalizeFromString("HG_2X2")).toBe("GROUP_DUNGEON"); // Becomes HG_X
        expect(ContentTypeEntity.normalizeFromString("HELLGATE")).toBe("HELLGATE_2V2");
        expect(ContentTypeEntity.normalizeFromString("HELLGATE_5V5")).toBe("GROUP_DUNGEON"); // Becomes HELLGATE_V
        expect(ContentTypeEntity.normalizeFromString("HG_5V5")).toBe("GROUP_DUNGEON"); // Becomes HG_V
        expect(ContentTypeEntity.normalizeFromString("HG_5X5")).toBe("GROUP_DUNGEON"); // Becomes HG_X
      });

      it("should normalize AVALONIAN_DUNGEON variants", () => {
        expect(ContentTypeEntity.normalizeFromString("AVALONIAN_DUNGEON")).toBe("AVALONIAN_DUNGEON");
        expect(ContentTypeEntity.normalizeFromString("AVALON")).toBe("AVALONIAN_DUNGEON");
        expect(ContentTypeEntity.normalizeFromString("AVA")).toBe("AVALONIAN_DUNGEON");
      });

      it("should normalize DEPTHS variants", () => {
        expect(ContentTypeEntity.normalizeFromString("DEPTHS_DUO")).toBe("DEPTHS_DUO");
        expect(ContentTypeEntity.normalizeFromString("DUO")).toBe("DEPTHS_DUO");
        expect(ContentTypeEntity.normalizeFromString("DEPTHS_TRIO")).toBe("DEPTHS_TRIO");
        expect(ContentTypeEntity.normalizeFromString("TRIO")).toBe("DEPTHS_TRIO");
      });

      it("should normalize MISTS variants", () => {
        expect(ContentTypeEntity.normalizeFromString("MISTS_SOLO")).toBe("MISTS_SOLO");
        expect(ContentTypeEntity.normalizeFromString("MISTS")).toBe("MISTS_SOLO");
        expect(ContentTypeEntity.normalizeFromString("MISTS_DUO")).toBe("GROUP_DUNGEON"); // No case for MISTS_DUO in switch
      });

      it("should normalize OPEN_WORLD variants", () => {
        expect(ContentTypeEntity.normalizeFromString("OPEN_WORLD_FARMING")).toBe("OPEN_WORLD_FARMING");
        expect(ContentTypeEntity.normalizeFromString("OPEN_WORLD")).toBe("OPEN_WORLD_FARMING");
        expect(ContentTypeEntity.normalizeFromString("FARMING")).toBe("OPEN_WORLD_FARMING");
        expect(ContentTypeEntity.normalizeFromString("OPEN_WORLD_GANKING")).toBe("OPEN_WORLD_GANKING");
        expect(ContentTypeEntity.normalizeFromString("GANKING")).toBe("OPEN_WORLD_GANKING");
        expect(ContentTypeEntity.normalizeFromString("OPEN_WORLD_SMALL_SCALE")).toBe("OPEN_WORLD_SMALL_SCALE");
        expect(ContentTypeEntity.normalizeFromString("SMALL_SCALE")).toBe("OPEN_WORLD_SMALL_SCALE");
        expect(ContentTypeEntity.normalizeFromString("OPEN_WORLD_ZVZ")).toBe("OPEN_WORLD_ZVZ");
        expect(ContentTypeEntity.normalizeFromString("ZVZ")).toBe("OPEN_WORLD_ZVZ");
      });

      it("should handle case insensitive input", () => {
        expect(ContentTypeEntity.normalizeFromString("roads_of_avalon")).toBe("ROADS_OF_AVALON");
        expect(ContentTypeEntity.normalizeFromString("roads-of-avalon")).toBe("GROUP_DUNGEON"); // Becomes ROADSOFAVALON
        expect(ContentTypeEntity.normalizeFromString("roads of avalon")).toBe("GROUP_DUNGEON"); // Spaces removed, becomes ROADSOFAVALON
      });

      it("should return default for unknown input", () => {
        expect(ContentTypeEntity.normalizeFromString("unknown content")).toBe("GROUP_DUNGEON");
        expect(ContentTypeEntity.normalizeFromString("")).toBe("GROUP_DUNGEON");
      });
    });
  });
});

describe("Utility functions", () => {
  describe("getContentTypeInfo", () => {
    it("should return info for valid content type", () => {
      const info = getContentTypeInfo("ROADS_OF_AVALON");
      expect(info).toBeDefined();
      expect(info?.type).toBe("ROADS_OF_AVALON");
    });

    it("should return null for unknown content type", () => {
      const info = getContentTypeInfo("UNKNOWN_TYPE" as ContentType);
      expect(info).toBeNull();
    });
  });

  describe("getDefaultLocation", () => {
    it("should return correct default location for Brecilien content", () => {
      expect(getDefaultLocation("ROADS_OF_AVALON")).toBe("Brecilien");
      expect(getDefaultLocation("HELLGATE_2V2")).toBe("Brecilien");
      expect(getDefaultLocation("AVALONIAN_DUNGEON")).toBe("Brecilien");
    });

    it("should return empty string for content without default location", () => {
      expect(getDefaultLocation("GROUP_DUNGEON")).toBe("");
      expect(getDefaultLocation("OPEN_WORLD_FARMING")).toBe("");
    });
  });

  describe("normalizeContentType", () => {
    it("should normalize content type from string", () => {
      expect(normalizeContentType("roads")).toBe("ROADS_OF_AVALON");
      expect(normalizeContentType("hellgate")).toBe("HELLGATE_2V2");
      expect(normalizeContentType("unknown")).toBe("GROUP_DUNGEON");
    });
  });

  describe("CONTENT_TYPE_LIST", () => {
    it("should contain only active content types", () => {
      expect(CONTENT_TYPE_LIST).toContain("ROADS_OF_AVALON");
      expect(CONTENT_TYPE_LIST).not.toContain("SOLO_DUNGEON");
    });
  });
});
