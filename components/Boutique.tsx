"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, X } from "lucide-react";
import { StardustBalancePill, StardustGlyph } from "@/components/StardustGlyph";
import type { StoreItem } from "@/lib/storeTypes";
import type { BuyStardustResult } from "@/hooks/useStore";
import { HUE_PRESET_CSS } from "@/lib/storeCatalog";

type BoutiqueProps = {
  open: boolean;
  onClose: () => void;
  merchantFontClass: string;
  dailyItems: StoreItem[];
  cosmicEgg: StoreItem | undefined;
  ownedIds: string[];
  stardust: number;
  previewItemId: string | null;
  onPreview: (item: StoreItem | null) => void;
  onBuyStardust: (item: StoreItem) => BuyStardustResult;
  onEquip: (item: StoreItem) => void;
  onOpenCosmicEgg: () => StoreItem | null;
};

function rarityStyles(r: StoreItem["rarity"]): string {
  switch (r) {
    case "legendary":
      return "from-amber-200/35 to-fuchsia-300/30 ring-amber-300/40";
    case "rare":
      return "from-sky-200/35 to-violet-300/28 ring-sky-400/35";
    case "uncommon":
      return "from-emerald-200/30 to-teal-200/25 ring-emerald-300/30";
    default:
      return "from-white/25 to-violet-100/20 ring-white/25";
  }
}

function PriceRow({ item }: { item: StoreItem }) {
  if (item.priceType === "usd") {
    return (
      <span className="flex items-center gap-1 text-xs font-bold text-emerald-900/90">
        <span className="text-[10px] font-extrabold uppercase tracking-wide text-emerald-800/80">USD</span>
        {item.priceUsd ?? "—"}
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1.5 text-xs font-bold text-amber-900/90">
      <StardustGlyph size="sm" />
      <span className="tabular-nums">{item.priceStardust}</span>
    </span>
  );
}

export function Boutique({
  open,
  onClose,
  merchantFontClass,
  dailyItems,
  cosmicEgg,
  ownedIds,
  stardust,
  previewItemId,
  onPreview,
  onBuyStardust,
  onEquip,
  onOpenCosmicEgg
}: BoutiqueProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[85] flex items-end justify-center bg-slate-950/40 px-3 pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)] backdrop-blur-sm sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-labelledby="boutique-title"
            className="mb-2 flex max-h-[min(88vh,640px)] w-full max-w-md flex-col overflow-hidden rounded-[1.75rem] border border-white/35 bg-gradient-to-b from-white/55 via-violet-50/50 to-indigo-100/45 shadow-[0_24px_60px_rgba(76,29,149,0.22)] backdrop-blur-xl sm:mb-0"
            initial={{ y: 28, opacity: 0.94 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 16, opacity: 0 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-2 border-b border-white/40 px-4 py-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-600/85">Wandering merchant</p>
                <h2 id="boutique-title" className={`${merchantFontClass} text-2xl font-semibold tracking-tight text-indigo-950`}>
                  The Star-Merchant&apos;s Wares
                </h2>
                <p className="mt-1 text-[11px] font-medium text-slate-600/95">
                  New picks each day at midnight (your time). Tap an item to preview on your companion. Earn stardust
                  from daily visits, holding your pet after hatch, and tapping ✦ sparkles.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="app-tap-target shrink-0 rounded-full p-2 text-slate-600 transition hover:bg-white/50"
                aria-label="Close boutique"
              >
                <X className="h-5 w-5" strokeWidth={2} />
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 text-[11px] text-slate-600">
              <span className="flex items-center gap-2">
                <span className="font-semibold text-slate-700">Your stardust</span>
                <StardustBalancePill amount={stardust} />
              </span>
              {previewItemId ? (
                <button
                  type="button"
                  className="font-semibold text-violet-700 underline decoration-violet-300/80"
                  onClick={() => onPreview(null)}
                >
                  Clear preview
                </button>
              ) : null}
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto px-4 pb-4">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Today&apos;s rotation</p>
              <div className="grid gap-3">
                {dailyItems.map((item) => {
                  const owned = ownedIds.includes(item.id);
                  const isPreview = previewItemId === item.id;
                  return (
                    <motion.div
                      key={item.id}
                      layout
                      role="button"
                      tabIndex={0}
                      onClick={() => onPreview(isPreview ? null : item)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          onPreview(isPreview ? null : item);
                        }
                      }}
                      className={`app-tap-target flex w-full cursor-pointer gap-3 rounded-2xl border border-white/45 bg-gradient-to-br p-3 text-left shadow-sm ring-1 ring-inset ${rarityStyles(item.rarity)} ${
                        isPreview ? "ring-2 ring-violet-500/60" : ""
                      }`}
                      whileTap={{ scale: 0.99 }}
                    >
                      <div
                        className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/50 bg-white/55 text-4xl shadow-inner backdrop-blur-sm"
                        style={
                          item.category === "skin" && item.huePreset
                            ? { filter: HUE_PRESET_CSS[item.huePreset] }
                            : undefined
                        }
                      >
                        {item.displayEmoji}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-slate-900">{item.name}</p>
                        <p className="line-clamp-2 text-[10px] font-medium text-slate-600">{item.description}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <PriceRow item={item} />
                          {owned ? (
                            <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[9px] font-bold uppercase text-emerald-900">
                              Owned
                            </span>
                          ) : null}
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {!owned && item.priceType === "stardust" ? (
                            <button
                              type="button"
                              className="rounded-full bg-violet-600/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm disabled:cursor-not-allowed disabled:bg-slate-300/80"
                              disabled={stardust < (item.priceStardust ?? 0)}
                              onClick={(e) => {
                                e.stopPropagation();
                                onBuyStardust(item);
                              }}
                            >
                              Buy
                            </button>
                          ) : null}
                          {owned ? (
                            <button
                              type="button"
                              className="rounded-full border border-violet-400/50 bg-white/50 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-violet-900"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEquip(item);
                              }}
                            >
                              Equip
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {cosmicEgg ? (
                <div className="rounded-2xl border border-dashed border-amber-400/50 bg-amber-50/40 p-3 backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-amber-600" strokeWidth={2} />
                    <p className={`${merchantFontClass} text-lg font-semibold text-amber-950`}>Cosmic Egg</p>
                  </div>
                  <p className="mt-1 text-[11px] text-amber-950/80">{cosmicEgg.description}</p>
                  <p className="mt-2 text-xs font-bold text-emerald-800">{cosmicEgg.priceUsd} — demo unlock (no real charge)</p>
                  <button
                    type="button"
                    className="app-tap-target mt-2 w-full rounded-xl bg-gradient-to-r from-amber-400/90 to-orange-400/90 py-2.5 text-sm font-bold text-amber-950 shadow-md"
                    onClick={() => {
                      const got = onOpenCosmicEgg();
                      if (got) {
                        window.alert(`Your Cosmic Egg hatched into: ${got.displayEmoji} ${got.name} (${got.rarity})!`);
                      }
                    }}
                  >
                    Crack the Cosmic Egg
                  </button>
                </div>
              ) : null}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
