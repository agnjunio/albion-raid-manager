import fs from "fs";
import path from "path";

import {
  Item,
  ItemDatabase,
  ItemLocalizations,
  ItemSearchFilters,
  ItemSearchResult,
  ItemSlotType,
  ServiceError,
  ServiceErrorCode,
} from "@albion-raid-manager/types/services";

import { CacheKeys, withCache } from "@albion-raid-manager/core/cache/utils";
import { logger } from "@albion-raid-manager/core/logger";

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

  export async function findItemByUniqueName(uniqueName: string): Promise<Item | null> {
    return withCache(
      async () => {
        const database = await getItemDatabase();

        for (const slotType of database.metadata.slotTypes) {
          const item = database.itemsBySlot[slotType].find((item) => item.item_id === uniqueName);
          if (item) {
            return item;
          }
        }

        return null;
      },
      {
        cache: "memory",
        key: CacheKeys.itemByUniqueName(uniqueName),
      },
    );
  }

  export async function getLocalizedName(item: Item, language: keyof ItemLocalizations = "EN-US"): Promise<string> {
    if (Object.keys(item.localizedNames).length === 0) {
      return item.item_id; // Fallback to unique name if no localization
    }

    return item.localizedNames[language] || item.localizedNames["EN-US"] || item.item_id;
  }

  export async function searchItemsByName(
    searchTerm: string,
    filters: ItemSearchFilters = {},
  ): Promise<ItemSearchResult> {
    const { slotType, limit = 20, offset = 0 } = filters;

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
        const results: Item[] = [];
        const searchLower = searchTerm.toLowerCase().trim();

        const slotsToSearch = slotType ? [slotType] : database.metadata.slotTypes;

        for (const slot of slotsToSearch) {
          const items = database.itemsBySlot[slot];

          for (const item of items) {
            // Search in English name
            const englishName = await getLocalizedName(item, "EN-US");
            if (englishName.toLowerCase().includes(searchLower)) {
              results.push(item);
              continue;
            }

            // Search in unique name
            if (item.item_id.toLowerCase().includes(searchLower)) {
              results.push(item);
            }
          }
        }

        // Sort results by relevance (exact matches first, then partial matches)
        results.sort((a, b) => {
          const aName = a.item_id.toLowerCase();
          const bName = b.item_id.toLowerCase();

          // Exact matches first
          if (aName === searchLower && bName !== searchLower) return -1;
          if (bName === searchLower && aName !== searchLower) return 1;

          // Then by length (shorter names first)
          return aName.length - bName.length;
        });

        const total = results.length;
        const paginatedResults = results.slice(offset, offset + limit);
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
        key: CacheKeys.itemSearch(searchTerm, CacheKeys.hashObject(filters)),
      },
    );
  }
}
