import fs from "fs";
import path from "path";

import {
  Item,
  ItemDatabase,
  ItemLocalizations,
  ItemSearchFilters,
  ItemSearchInput,
  ItemSearchResult,
  ItemSlotType,
  ServiceError,
  ServiceErrorCode,
} from "@albion-raid-manager/types/services";

import { CacheKeys, withCache } from "@albion-raid-manager/core/cache/utils";
import { logger } from "@albion-raid-manager/core/logger";
import { findPartialFuzzyMatch, fuzzyMatch, FuzzySearchOptions } from "@albion-raid-manager/core/utils";

export namespace ItemsService {
  const filePath = path.join(__dirname, "../../assets/items-by-slot.json");
  const MAX_SEARCH_RESULTS = 100;

  async function getItemDatabase(): Promise<ItemDatabase> {
    return withCache(
      async () => {
        const data = await fs.promises.readFile(filePath, "utf8");
        return JSON.parse(data) as ItemDatabase;
      },
      {
        cache: "memory",
        key: CacheKeys.itemDatabase(),
      },
    );
  }

  export async function getItemsBySlot(slotType: ItemSlotType): Promise<Item[]> {
    return withCache(
      async () => {
        const database = await getItemDatabase();
        return database.itemsBySlot[slotType] || [];
      },
      {
        cache: "memory",
        key: CacheKeys.itemsBySlot(slotType),
      },
    );
  }

  export async function findItemById(id: string): Promise<Item | null> {
    return withCache(
      async () => {
        const database = await getItemDatabase();

        // Strip enchantment part from the ID (e.g., "T8_2H_HOLYSTAFF@3" -> "T8_2H_HOLYSTAFF")
        const itemId = id.split("@")[0];

        for (const slotType of database.metadata.slotTypes) {
          const item = database.itemsBySlot[slotType].find((item) => item.item_id === itemId);
          if (item) {
            return item;
          }
        }

        return null;
      },
      {
        cache: "memory",
        key: CacheKeys.item(id),
      },
    );
  }

  export function getLocalizedName(item: Item, language: string): string {
    if (Object.keys(item.localizedNames).length === 0) {
      return item.item_id; // Fallback to unique name if no localization
    }

    const languageKey = language.toUpperCase() as keyof ItemLocalizations;
    return item.localizedNames[languageKey] || item.localizedNames["EN-US"] || item.item_id;
  }

  export async function searchItemsByName(
    searchTerm: string,
    filters: ItemSearchFilters = {},
  ): Promise<ItemSearchResult> {
    const { slotType, language = "EN-US", limit = 20, offset = 0 } = filters;

    // Validate search term
    if (!searchTerm || searchTerm.trim().length < 2) {
      throw new ServiceError(ServiceErrorCode.INVALID_STATE, "Search term must be at least 2 characters long");
    }

    // Validate limit
    if (limit > MAX_SEARCH_RESULTS) {
      throw new ServiceError(ServiceErrorCode.INVALID_STATE, `Limit cannot exceed ${MAX_SEARCH_RESULTS} items`);
    }

    return withCache(
      async () => {
        const database = await getItemDatabase();
        const results: { item: Item; score: number; matchType: string }[] = [];

        const input = getSearchInput(searchTerm);
        const slotsToSearch = slotType ? [slotType] : database.metadata.slotTypes;

        for (const slot of slotsToSearch) {
          const items = database.itemsBySlot[slot];

          for (const item of items) {
            const itemId = item.item_id;
            const itemName = getLocalizedName(item, language);
            const searchLower = input.processedTerm.toLowerCase().trim();

            // Filter out items that don't match the tier if specified
            if (input.tier && !matchesTierEnchant(itemId, input)) {
              continue;
            }

            // Exact match in item name
            if (itemName.toLowerCase() === searchLower) {
              results.push({ item, score: 1.0, matchType: "exact_name" });
              continue;
            }

            // Exact match in item ID
            if (itemId.toLowerCase() === searchLower) {
              results.push({ item, score: 0.95, matchType: "exact_id" });
              continue;
            }

            // Substring match for item name
            if (itemName.toLowerCase().includes(searchLower)) {
              results.push({ item, score: 0.8, matchType: "substring_name" });
              continue;
            }

            // Substring match for item ID
            if (itemId.toLowerCase().includes(searchLower)) {
              results.push({ item, score: 0.75, matchType: "substring_id" });
              continue;
            }

            const fuzzyMatchOptions: FuzzySearchOptions = {
              maxDistance: 2,
              minLength: 3,
              requirePrefix: false,
            };

            // Fuzzy match for item name
            const itemNameMatch = fuzzyMatch(itemName, input.processedTerm, fuzzyMatchOptions);
            if (itemNameMatch) {
              results.push({ item, score: itemNameMatch.score * 0.6, matchType: "fuzzy_name" });
              continue;
            }

            // Enhanced fuzzy match for partial matches (e.g., "artic staff" in "Elder's Arctic Staff")
            const partialMatch = findPartialFuzzyMatch(itemName, input.processedTerm);
            if (partialMatch) {
              results.push({ item, score: partialMatch.score * 0.5, matchType: "partial_fuzzy_name" });
              continue;
            }

            // Fuzzy match for item ID
            const idMatch = fuzzyMatch(itemId, input.processedTerm, fuzzyMatchOptions);
            if (idMatch) {
              results.push({ item, score: idMatch.score * 0.5, matchType: "fuzzy_id" });
              continue;
            }
          }
        }

        // Sort results by score (highest first), then by match type priority
        results.sort((a, b) => {
          if (a.score !== b.score) {
            return b.score - a.score;
          }

          // Secondary sort by match type priority
          const typePriority: Record<string, number> = {
            exact_english: 1,
            exact_id: 2,
            substring_english: 3,
            substring_id: 4,
            fuzzy_english: 5,
            fuzzy_id: 6,
          };

          return typePriority[a.matchType] - typePriority[b.matchType];
        });

        const total = results.length;
        const paginatedResults = results.slice(offset, offset + limit).map((r) => r.item);
        const hasMore = offset + limit < total;

        logger.verbose("Item search completed", {
          searchTerm,
          filters,
          total,
          returned: paginatedResults.length,
          hasMore,
        });

        return {
          items: paginatedResults,
          total,
          hasMore,
        };
      },
      {
        cache: "memory",
        key: CacheKeys.itemSearch(searchTerm, CacheKeys.hashObject({ ...filters, language })),
      },
    );
  }

  function getSearchInput(searchTerm: string): ItemSearchInput {
    const input: ItemSearchInput = {
      originalTerm: searchTerm,
      processedTerm: searchTerm,
    };

    // Check for tier/enchant patterns anywhere in the search term
    // Matches: "t8", "8", "t8.1", "8.1", "8.", ".2", "fire staff 8.", "t8 fire staff"
    const tierEnchantMatch = searchTerm.match(/T?(\d+)\.(\d+)|T?(\d+)\.|T?(\d+)|\.(\d+)/i);

    if (tierEnchantMatch) {
      const tierStr = tierEnchantMatch[1] || tierEnchantMatch[3] || tierEnchantMatch[4]; // groups 1,3,4 for tier
      const enchantStr = tierEnchantMatch[2] || tierEnchantMatch[5]; // groups 2,5 for enchant

      // Parse tier and enchant values
      const tier = tierStr ? parseInt(tierStr, 10) : undefined;
      const enchant = enchantStr ? parseInt(enchantStr, 10) : undefined;

      // Validate and set values
      if (tier && tier >= 1 && tier <= 8) {
        input.tier = tier;
      }

      if (enchant !== undefined && enchant >= 0 && enchant <= 4) {
        input.enchant = enchant;
      } else if (tier) {
        // Tier only case (e.g., "t8", "8", "8.") - set enchant to 0
        input.enchant = 0;
      }

      // Remove the tier/enchant pattern from the search term
      input.processedTerm = searchTerm.replace(/T?(\d+)\.(\d+)|T?(\d+)\.|T?(\d+)|\.(\d+)/i, "").trim();
    }

    return input;
  }

  function matchesTierEnchant(itemName: string, input: ItemSearchInput): boolean {
    const itemLower = itemName.toLowerCase();

    if (input.tier !== undefined && !itemLower.includes(`t${input.tier}`)) {
      return false;
    }

    // For now we don't care about enchant
    return true;
  }
}
