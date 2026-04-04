"use client";

import { useCallback, useMemo, type Dispatch, type SetStateAction } from "react";
import type { PlayerMeta } from "@/lib/playerMeta";
import { savePlayerMeta } from "@/lib/playerMeta";
import { getDailyOfferings, getCosmicEgg, rollMysteryCosmeticPool } from "@/lib/storeCatalog";
import type { StoreItem } from "@/lib/storeTypes";

export type BuyStardustResult = { ok: true } | { ok: false; reason: "funds" | "owned" | "invalid" };

export function useStore(
  meta: PlayerMeta,
  setMeta: Dispatch<SetStateAction<PlayerMeta>>,
  /** Local YYYY-MM-DD; pass a value that updates across midnight (e.g. derived from a ticking clock). */
  calendarYmd: string
) {
  const dailyItems = useMemo(() => getDailyOfferings(calendarYmd), [calendarYmd]);
  const cosmicEgg = useMemo(() => getCosmicEgg(), []);

  const persist = useCallback((next: PlayerMeta) => {
    savePlayerMeta(next);
    setMeta(next);
  }, [setMeta]);

  const buyWithStardust = useCallback(
    (item: StoreItem): BuyStardustResult => {
      if (item.priceType !== "stardust" || item.priceStardust == null) {
        return { ok: false, reason: "invalid" };
      }
      if (meta.ownedItemIds.includes(item.id)) {
        return { ok: false, reason: "owned" };
      }
      if (meta.stardust < item.priceStardust) {
        return { ok: false, reason: "funds" };
      }
      const next: PlayerMeta = {
        ...meta,
        stardust: meta.stardust - item.priceStardust,
        ownedItemIds: [...meta.ownedItemIds, item.id]
      };
      if (item.category === "hat") {
        next.equippedHatId = item.id;
      } else if (item.category === "skin") {
        next.equippedSkinId = item.id;
      } else if (item.category === "room") {
        next.equippedRoomId = item.id;
      }
      persist(next);
      return { ok: true };
    },
    [meta, persist]
  );

  const equipItem = useCallback(
    (item: StoreItem) => {
      if (!meta.ownedItemIds.includes(item.id)) {
        return;
      }
      const next: PlayerMeta = { ...meta };
      if (item.category === "hat") {
        next.equippedHatId = item.id;
      } else if (item.category === "skin") {
        next.equippedSkinId = item.id;
      } else if (item.category === "room") {
        next.equippedRoomId = item.id;
      }
      persist(next);
    },
    [meta, persist]
  );

  const unequipCategory = useCallback(
    (category: StoreItem["category"]) => {
      const next: PlayerMeta = { ...meta };
      if (category === "hat") {
        next.equippedHatId = null;
      } else if (category === "skin") {
        next.equippedSkinId = null;
      } else if (category === "room") {
        next.equippedRoomId = null;
      }
      persist(next);
    },
    [meta, persist]
  );

  /** Placeholder IAP: grants one random rare+ item (no real payment). */
  const openCosmicEgg = useCallback((): StoreItem | null => {
    const egg = getCosmicEgg();
    if (!egg) {
      return null;
    }
    const pool = rollMysteryCosmeticPool();
    if (pool.length === 0) {
      return null;
    }
    const unowned = pool.filter((i) => !meta.ownedItemIds.includes(i.id));
    const pickFrom = unowned.length > 0 ? unowned : pool;
    const rolled = pickFrom[Math.floor(Math.random() * pickFrom.length)]!;
    const already = meta.ownedItemIds.includes(rolled.id);
    const next: PlayerMeta = {
      ...meta,
      ownedItemIds: already ? meta.ownedItemIds : [...meta.ownedItemIds, rolled.id]
    };
    persist(next);
    return rolled;
  }, [meta, persist]);

  return {
    dailyItems,
    cosmicEgg,
    buyWithStardust,
    equipItem,
    unequipCategory,
    openCosmicEgg
  };
}
