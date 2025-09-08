import { type ContentType } from "@albion-raid-manager/types";

// Banner configuration for raid announcements
export const RAID_BANNERS = {
  // Generic banner for all content types
  // TODO: Replace with actual banner URL
  GENERIC: "https://placehold.co/600x200/2C2F33/FFFFFF?text=Albion+Raid+Manager&font=roboto",

  // Content type specific banners (for future implementation)
  // TODO: Replace with actual banner URLs for each content type
  CONTENT_TYPE_BANNERS: {
    SOLO_DUNGEON: "https://placehold.co/600x200/2C2F33/FFFFFF?text=Solo+Dungeon&font=roboto",
    OPEN_WORLD_FARMING: "https://placehold.co/600x200/2C2F33/FFFFFF?text=Open+World+Farming&font=roboto",
    GROUP_DUNGEON: "https://placehold.co/600x200/2C2F33/FFFFFF?text=Group+Dungeon&font=roboto",
    AVALONIAN_DUNGEON: "https://placehold.co/600x200/2C2F33/FFFFFF?text=Avalonian+Dungeon&font=roboto",
    ROADS_OF_AVALON: "https://placehold.co/600x200/2C2F33/FFFFFF?text=Roads+of+Avalon&font=roboto",
    DEPTHS_DUO: "https://placehold.co/600x200/2C2F33/FFFFFF?text=Depths+Duo&font=roboto",
    DEPTHS_TRIO: "https://placehold.co/600x200/2C2F33/FFFFFF?text=Depths+Trio&font=roboto",
    OPEN_WORLD_GANKING: "https://placehold.co/600x200/2C2F33/FFFFFF?text=Open+World+Ganking&font=roboto",
    OPEN_WORLD_SMALL_SCALE: "https://placehold.co/600x200/2C2F33/FFFFFF?text=Small+Scale&font=roboto",
    OPEN_WORLD_ZVZ: "https://placehold.co/600x200/2C2F33/FFFFFF?text=ZvZ&font=roboto",
    HELLGATE_2V2: "https://placehold.co/600x200/2C2F33/FFFFFF?text=Hellgate+2v2&font=roboto",
    HELLGATE_5V5: "https://placehold.co/600x200/2C2F33/FFFFFF?text=Hellgate+5v5&font=roboto",
    MISTS_SOLO: "https://placehold.co/600x200/2C2F33/FFFFFF?text=Mists+Solo&font=roboto",
    MISTS_DUO: "https://placehold.co/600x200/2C2F33/FFFFFF?text=Mists+Duo&font=roboto",
    OTHER: "https://placehold.co/600x200/2C2F33/FFFFFF?text=Albion+Raid+Manager&font=roboto",
  } as Record<ContentType, string>,
} as const;

/**
 * Get the appropriate banner URL for a raid based on its content type
 * @param contentType The content type of the raid
 * @returns The banner URL to use
 */
export function getRaidBanner(contentType?: ContentType): string {
  if (!contentType || contentType === "OTHER") {
    return RAID_BANNERS.GENERIC;
  }

  return RAID_BANNERS.CONTENT_TYPE_BANNERS[contentType] || RAID_BANNERS.GENERIC;
}
