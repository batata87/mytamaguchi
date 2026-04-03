import storeItemsJson from "./storeItems.json";
import type { StoreItem } from "./storeTypes";

export const STORE_CATALOG: StoreItem[] = storeItemsJson as StoreItem[];

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Local calendar date YYYY-MM-DD (store resets at local midnight). */
export function localCalendarYmd(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function getDailyOfferings(ymd: string): StoreItem[] {
  const pool = STORE_CATALOG.filter((i) => !i.mysteryOnly);
  const rand = mulberry32(hashString(`bia-boutique-${ymd}`));
  const copy = [...pool];
  const picks: StoreItem[] = [];
  for (let k = 0; k < 3 && copy.length; k++) {
    const idx = Math.floor(rand() * copy.length);
    picks.push(copy.splice(idx, 1)[0]!);
  }
  return picks;
}

export function getCosmicEgg(): StoreItem | undefined {
  return STORE_CATALOG.find((i) => i.id === "cosmic-egg");
}

/** Extra CSS filter applied on top of mood/egg tint for equipped skin variants. */
export const HUE_PRESET_CSS: Record<string, string> = {
  ruby: "hue-rotate(-12deg) saturate(1.35) brightness(1.03)",
  emerald: "hue-rotate(72deg) saturate(1.22) brightness(1.02)",
  sapphire: "hue-rotate(168deg) saturate(1.28) brightness(1.04)"
};

export function findStoreItem(id: string): StoreItem | undefined {
  return STORE_CATALOG.find((i) => i.id === id);
}

/** Pool for Cosmic Egg — rare and legendary cosmetics only. */
export function rollMysteryCosmeticPool(): StoreItem[] {
  return STORE_CATALOG.filter((i) => !i.mysteryOnly && i.rarity !== "common" && i.rarity !== "uncommon");
}
