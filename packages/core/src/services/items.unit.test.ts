import { ItemSearchFilters } from "@albion-raid-manager/types/services";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ItemsService } from "./items";

describe("ItemsService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("searchItemsByName", () => {
    describe("Basic Search Functionality", () => {
      it("should return exact matches in English names", async () => {
        const result = await ItemsService.searchItemsByName("Beginner's Axe");

        expect(result.items.length).toBeGreaterThan(0);
        expect(result.items[0].localizedNames["EN-US"]).toBe("Beginner's Axe");
        expect(result.total).toBeGreaterThan(0);
      });

      it("should return exact matches in item IDs", async () => {
        const result = await ItemsService.searchItemsByName("T1_2H_TOOL_AXE");

        expect(result.items.length).toBeGreaterThan(0);
        expect(result.items[0].item_id).toBe("T1_2H_TOOL_AXE");
        expect(result.total).toBeGreaterThan(0);
      });

      it("should return substring matches", async () => {
        const result = await ItemsService.searchItemsByName("T1");

        expect(result.items.length).toBeGreaterThan(0);
        expect(result.total).toBeGreaterThan(0);
        // All results should contain T1
        result.items.forEach((item) => {
          expect(item.item_id).toContain("T1");
        });
      });

      it("should be case insensitive", async () => {
        const result = await ItemsService.searchItemsByName("beginner's axe");

        expect(result.items.length).toBeGreaterThan(0);
        expect(result.items[0].localizedNames["EN-US"]).toBe("Beginner's Axe");
      });

      it("should handle empty search results", async () => {
        const result = await ItemsService.searchItemsByName("nonexistentitem12345");

        expect(result.items).toHaveLength(0);
        expect(result.total).toBe(0);
        expect(result.hasMore).toBe(false);
      });
    });

    describe("Comprehensive Search Tests", () => {
      it.each([
        // Exact English name matches
        {
          query: "Beginner's Axe",
          expectedMinResults: 1,
          expectedFirstItemName: "Beginner's Axe",
          description: "exact English name match",
        },
        {
          query: "Beginner's Stone Hammer",
          expectedMinResults: 1,
          expectedFirstItemName: "Beginner's Stone Hammer",
          description: "exact English name match with spaces",
        },
        {
          query: "Beginner's Pickaxe",
          expectedMinResults: 1,
          expectedFirstItemName: "Beginner's Pickaxe",
          description: "exact English name match for pickaxe",
        },
        // Item ID matches
        {
          query: "T1_2H_TOOL_AXE",
          expectedMinResults: 1,
          expectedFirstItemId: "T1_2H_TOOL_AXE",
          description: "exact item ID match",
        },
        {
          query: "T1_2H_TOOL_HAMMER",
          expectedMinResults: 1,
          expectedFirstItemId: "T1_2H_TOOL_HAMMER",
          description: "exact item ID match for hammer",
        },
        {
          query: "T1_2H_TOOL_PICK",
          expectedMinResults: 1,
          expectedFirstItemId: "T1_2H_TOOL_PICK",
          description: "exact item ID match for pickaxe",
        },
        // Substring matches
        {
          query: "T1",
          expectedMinResults: 10,
          expectedIdAllContain: "T1",
          description: "substring match for tier 1 items",
        },
        {
          query: "Beginner",
          expectedMinResults: 5,
          expectedNameAllContain: "Beginner",
          description: "substring match for beginner items",
        },
        {
          query: "TOOL",
          expectedMinResults: 5,
          expectedIdAllContain: "TOOL",
          description: "substring match for tool items",
        },
        {
          query: "Hammer",
          expectedMinResults: 3,
          expectedIdAllContain: "HAMMER",
          description: "substring match for hammer items",
        },
        // Case insensitive
        {
          query: "beginner's axe",
          expectedMinResults: 1,
          expectedFirstItemName: "Beginner's Axe",
          description: "case insensitive search",
        },
        {
          query: "t1_2h_tool_axe",
          expectedMinResults: 1,
          expectedFirstItemId: "T1_2H_TOOL_AXE",
          description: "case insensitive item ID search",
        },
        {
          query: "HAMMER",
          expectedMinResults: 3,
          expectedIdAllContain: "HAMMER",
          description: "case insensitive uppercase search",
        },
        // Empty results
        {
          query: "nonexistentitem12345",
          expectedMinResults: 0,
          expectedTotal: 0,
          expectedHasMore: false,
          description: "non-existent item search",
        },
        {
          query: "zzzzzzzzzz",
          expectedMinResults: 0,
          expectedTotal: 0,
          expectedHasMore: false,
          description: "random string search",
        },
        {
          query: "T999_NONEXISTENT",
          expectedMinResults: 0,
          expectedTotal: 0,
          expectedHasMore: false,
          description: "non-existent tier search",
        },
        // Custom cases
        {
          query: "T8 Fire Staff",
          expectedMinResults: 1,
          expectedFirstItemName: "Elder's Fire Staff",
          description: "T8 fire staff search",
        },
        {
          query: "Fire Staff",
          expectedMinResults: 3,
          expectedFirstItemName: "Novice's Fire Staff",
          description: "fire staff search across all tiers",
        },
        {
          query: "Elder's Fire Staff",
          expectedMinResults: 1,
          expectedFirstItemName: "Elder's Fire Staff",
          description: "exact elder's fire staff search",
        },
        {
          query: "T8_MAIN_FIRESTAFF",
          expectedMinResults: 1,
          expectedFirstItemId: "T8_MAIN_FIRESTAFF",
          description: "T8 fire staff item ID search",
        },
      ])(
        "should handle $description: '$query'",
        async ({
          query,
          expectedMinResults,
          expectedFirstItemName,
          expectedFirstItemId,
          expectedNameAllContain,
          expectedIdAllContain,
          expectedTotal,
          expectedHasMore,
        }) => {
          const result = await ItemsService.searchItemsByName(query);

          expect(result.items.length).toBeGreaterThanOrEqual(expectedMinResults);

          if (expectedFirstItemName) {
            expect(result.items[0].localizedNames["EN-US"]).toBe(expectedFirstItemName);
          }

          if (expectedFirstItemId) {
            expect(result.items[0].item_id).toBe(expectedFirstItemId);
          }

          if (expectedNameAllContain) {
            result.items.forEach((item) => {
              expect(item.localizedNames["EN-US"]).toContain(expectedNameAllContain);
            });
          }

          if (expectedIdAllContain) {
            result.items.forEach((item) => {
              expect(item.item_id).toContain(expectedIdAllContain);
            });
          }

          if (expectedTotal !== undefined) {
            expect(result.total).toBe(expectedTotal);
          }

          if (expectedHasMore !== undefined) {
            expect(result.hasMore).toBe(expectedHasMore);
          }
        },
      );
    });

    describe("Error Handling", () => {
      it("should throw error for short search terms", async () => {
        await expect(ItemsService.searchItemsByName("a")).rejects.toThrow(
          "Search term must be at least 2 characters long",
        );
      });

      it("should throw error for empty search terms", async () => {
        await expect(ItemsService.searchItemsByName("")).rejects.toThrow(
          "Search term must be at least 2 characters long",
        );
      });

      it("should throw error for excessive limit", async () => {
        const filters: ItemSearchFilters = { limit: 200 };
        await expect(ItemsService.searchItemsByName("test", filters)).rejects.toThrow("Limit cannot exceed 100 items");
      });
    });
  });
});
