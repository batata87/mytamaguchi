"use client";

import { forwardRef, useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";

type StardustCounterProps = {
  amount: number;
  /** Opens the boutique (only the + control). */
  onOpenShop: () => void;
  /** Opens the stardust guide (icon + count tap). */
  onOpenInfo: () => void;
  pulseNonce?: number;
};

export const StardustCounter = forwardRef<HTMLDivElement, StardustCounterProps>(function StardustCounter(
  { amount, onOpenShop, onOpenInfo, pulseNonce = 0 },
  ref
) {
  const [bump, setBump] = useState(0);
  useEffect(() => {
    if (pulseNonce > 0) {
      setBump((n) => n + 1);
    }
  }, [pulseNonce]);

  return (
    <div
      ref={ref}
      className="flex items-center gap-0.5 rounded-full border border-white/50 bg-white/45 py-0.5 pl-1 pr-0.5 shadow-[0_6px_20px_rgba(139,92,246,0.18)] backdrop-blur-md"
    >
      <button
        type="button"
        onClick={onOpenInfo}
        className="app-tap-target flex min-w-0 items-center gap-1 rounded-l-full py-1 pl-0.5 pr-1 transition hover:bg-white/35 enabled:active:scale-[0.98]"
        aria-label="How to collect stardust"
      >
        <motion.span
          className="relative flex h-[22px] w-[22px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-indigo-100/50 to-cyan-100/40 ring-1 ring-white/50"
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
        >
          <Image
            src="/assets/stardust-icon.png"
            alt=""
            width={128}
            height={128}
            className="h-[26px] w-[26px] object-cover object-center"
            unoptimized
          />
        </motion.span>
        <motion.span
          key={bump}
          className="min-w-[1.25rem] text-center text-xs font-bold tabular-nums text-amber-950/95"
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 420, damping: 18 }}
        >
          {amount}
        </motion.span>
      </button>
      <button
        type="button"
        onClick={onOpenShop}
        className="app-tap-target flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-500/25 text-violet-900 transition hover:bg-violet-500/35 enabled:active:scale-95"
        aria-label="Open Star-Merchant boutique"
        title="Open boutique"
      >
        <Plus className="h-4 w-4" strokeWidth={2.5} />
      </button>
    </div>
  );
});
