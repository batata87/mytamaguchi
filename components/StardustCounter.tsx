"use client";

import { forwardRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { StardustGlyph } from "@/components/StardustGlyph";

type StardustCounterProps = {
  amount: number;
  /** Tap icon + count to open how-to. */
  onOpenInfo: () => void;
  pulseNonce?: number;
};

export const StardustCounter = forwardRef<HTMLDivElement, StardustCounterProps>(function StardustCounter(
  { amount, onOpenInfo, pulseNonce = 0 },
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
      className="rounded-full border border-white/50 bg-white/45 py-0.5 pl-1 pr-1.5 shadow-[0_6px_20px_rgba(139,92,246,0.18)] backdrop-blur-md"
    >
      <button
        type="button"
        onClick={onOpenInfo}
        className="app-tap-target flex min-w-0 items-center gap-1 rounded-full py-1 pl-0.5 pr-0.5 transition hover:bg-white/35 enabled:active:scale-[0.98]"
        aria-label="How to collect stardust"
      >
        <StardustGlyph size="md" animate />
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
    </div>
  );
});
