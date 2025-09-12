#!/usr/bin/env node
/* eslint-disable no-console */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Process Albion Online items.json and itemLocalization.json files
 * to create a comprehensive item database grouped by slot type
 */

// Input file paths
const ITEMS_FILE = path.join(__dirname, "./inputs/items.json");
const LOCALIZATION_FILE = path.join(__dirname, "./inputs/itemLocalization.json");

// Output file path
const OUTPUT_FILE = path.join(__dirname, "../packages/core/assets/items-by-slot.json");

/**
 * Remove enchantment suffix from unique name (e.g., "T4_ARMOR_CLOTH_SET1@1" -> "T4_ARMOR_CLOTH_SET1")
 */
function removeEnchantment(uniqueName) {
  return uniqueName.replace(/@\d+$/, "");
}

/**
 * Recursively extract items from the nested JSON structure
 */
function extractItems(obj, items = []) {
  if (Array.isArray(obj)) {
    obj.forEach((item) => extractItems(item, items));
  } else if (obj && typeof obj === "object") {
    // Check if this object has both @uniquename and @slottype (it's an item)
    if (obj["@uniquename"] && obj["@slottype"]) {
      items.push({
        uniqueName: obj["@uniquename"],
        slotType: obj["@slottype"],
      });
    }

    // Recursively process all properties
    Object.values(obj).forEach((value) => {
      if (typeof value === "object") {
        extractItems(value, items);
      }
    });
  }

  return items;
}

/**
 * Create localization lookup map
 */
function createLocalizationMap(localizationData) {
  const map = new Map();

  localizationData.forEach((item) => {
    if (item.UniqueName && item.LocalizedNames) {
      map.set(item.UniqueName, item.LocalizedNames);
    }
  });

  return map;
}

/**
 * Main processing function
 */
async function processItems() {
  try {
    console.log("Reading items.json...");
    const itemsData = JSON.parse(fs.readFileSync(ITEMS_FILE, "utf8"));

    console.log("Reading itemLocalization.json...");
    const localizationData = JSON.parse(fs.readFileSync(LOCALIZATION_FILE, "utf8"));

    console.log("Extracting items from nested structure...");
    const allItems = extractItems(itemsData);
    console.log(`Found ${allItems.length} items`);

    console.log("Creating localization lookup map...");
    const localizationMap = createLocalizationMap(localizationData);
    console.log(`Created localization map with ${localizationMap.size} entries`);

    console.log("Processing items and matching with localization...");
    const itemsBySlot = {};
    let processedCount = 0;
    let matchedCount = 0;

    allItems.forEach((item) => {
      const { uniqueName, slotType } = item;

      // Initialize slot type if not exists
      if (!itemsBySlot[slotType]) {
        itemsBySlot[slotType] = [];
      }

      // Remove enchantment to find base item
      const baseUniqueName = removeEnchantment(uniqueName);

      // Find localization data
      let localizedNames = null;

      // Try exact match first
      if (localizationMap.has(baseUniqueName)) {
        localizedNames = localizationMap.get(baseUniqueName);
      } else {
        // Try to find a match by removing enchantment from localization keys
        for (const [localizationKey, names] of localizationMap.entries()) {
          const baseLocalizationKey = removeEnchantment(localizationKey);
          if (baseLocalizationKey === baseUniqueName) {
            localizedNames = names;
            break;
          }
        }
      }

      const itemData = {
        item_id: uniqueName,
        localizedNames: localizedNames || {},
      };

      itemsBySlot[slotType].push(itemData);
      processedCount++;

      if (localizedNames) {
        matchedCount++;
      }
    });

    console.log(`Processed ${processedCount} items`);
    console.log(`Matched ${matchedCount} items with localization data`);

    // Sort items within each slot type by item_id
    Object.keys(itemsBySlot).forEach((slotType) => {
      itemsBySlot[slotType].sort((a, b) => a.item_id.localeCompare(b.item_id));
    });

    // Create final output structure
    const output = {
      metadata: {
        generatedAt: new Date().toISOString(),
        totalItems: processedCount,
        matchedItems: matchedCount,
        slotTypes: Object.keys(itemsBySlot).sort(),
      },
      itemsBySlot: itemsBySlot,
    };

    console.log("Writing output file...");
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));

    console.log(`\n✅ Successfully processed items!`);
    console.log(`📁 Output written to: ${OUTPUT_FILE}`);
    console.log(`\n📊 Summary:`);
    console.log(`   Total items: ${processedCount}`);
    console.log(`   Matched with localization: ${matchedCount}`);
    console.log(`   Slot types: ${Object.keys(itemsBySlot).join(", ")}`);

    // Show item counts per slot type
    console.log(`\n📋 Items per slot type:`);
    Object.keys(itemsBySlot)
      .sort()
      .forEach((slotType) => {
        console.log(`   ${slotType}: ${itemsBySlot[slotType].length} items`);
      });
  } catch (error) {
    console.error("❌ Error processing items:", error);
    process.exit(1);
  }
}

// Run the processing
if (import.meta.url === `file://${process.argv[1]}`) {
  processItems();
}

export { createLocalizationMap, extractItems, processItems, removeEnchantment };
