export interface ItemLocalizations {
  "EN-US": string;
  "DE-DE": string;
  "FR-FR": string;
  "RU-RU": string;
  "PL-PL": string;
  "ES-ES": string;
  "PT-BR": string;
  "IT-IT": string;
  "ZH-CN": string;
  "KO-KR": string;
  "JA-JP": string;
  "ZH-TW": string;
  "ID-ID": string;
  "TR-TR": string;
  "AR-SA": string;
}

export interface Item {
  item_id: string;
  localizedNames: ItemLocalizations;
}

export interface ItemsBySlot {
  [slotType: string]: Item[];
}

export interface ItemDatabase {
  metadata: {
    generatedAt: string;
    totalItems: number;
    matchedItems: number;
    slotTypes: string[];
  };
  itemsBySlot: ItemsBySlot;
}

export type ItemSlotType =
  | "mainhand"
  | "offhand"
  | "head"
  | "armor"
  | "shoes"
  | "cape"
  | "bag"
  | "food"
  | "potion"
  | "mount";

export interface ItemSearchFilters {
  slotType?: ItemSlotType;
  language?: keyof ItemLocalizations;
  limit?: number;
  offset?: number;
}

export interface ItemSearchResult {
  items: Item[];
  total: number;
  hasMore: boolean;
}
