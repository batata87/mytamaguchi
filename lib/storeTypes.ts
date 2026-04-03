export type StoreCategory = "skin" | "hat" | "room";
export type StoreRarity = "common" | "uncommon" | "rare" | "legendary";
export type StorePriceType = "stardust" | "usd";
export type HuePreset = "ruby" | "emerald" | "sapphire";

export type StoreItem = {
  id: string;
  name: string;
  category: StoreCategory;
  rarity: StoreRarity;
  displayEmoji: string;
  priceType: StorePriceType;
  /** Stardust cost when priceType is stardust */
  priceStardust?: number;
  /** Display string when priceType is usd, e.g. "$0.99" */
  priceUsd?: string;
  /** Optional CSS filter stack for skin tint variants (on top of base creature) */
  huePreset?: HuePreset;
  description?: string;
  /** When true, excluded from daily rotation (handled in catalog) */
  mysteryOnly?: boolean;
};
