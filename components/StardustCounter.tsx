"use client";

import { forwardRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";

function FourPointStar({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id="stardustStarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef3c7" />
          <stop offset="45%" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#c4b5fd" />
        </linearGradient>
      </defs>
      <motion.path
        fill="url(#stardustStarGrad)"
        d="M12 2l1.8 5.5h5.8l-4.7 3.4 1.8 5.5L12 14.6 6.3 16.4l1.8-5.5L3.4 7.5h5.8L12 2z"
        animate={{ scale: [1, 1.12, 1], opacity: [0.88, 1, 0.88] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      />
    </svg>
  );
}

type StardustCounterProps = {
  amount: number;
  onOpenShop: () => void;
  pulseNonce?: number;
  /** Long-press / hover hint (native title) for how stardust is earned */
  collectionHint?: string;
};

export const StardustCounter = forwardRef<HTMLDivElement, StardustCounterProps>(function StardustCounter(
  { amount, onOpenShop, pulseNonce = 0, collectionHint },
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
      title={collectionHint}
      className="flex items-center gap-1 rounded-full border border-white/50 bg-white/45 px-2 py-1 shadow-[0_6px_20px_rgba(139,92,246,0.18)] backdrop-blur-md"
    >
      <FourPointStar className="h-5 w-5 shrink-0 drop-shadow-[0_0_6px_rgba(251,191,36,0.7)]" />
      <motion.span
        key={bump}
        className="min-w-[1.5rem] text-center text-xs font-bold tabular-nums text-amber-950/95"
        initial={{ scale: 1.2 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 420, damping: 18 }}
      >
        {amount}
      </motion.span>
      <button
        type="button"
        onClick={onOpenShop}
        className="app-tap-target flex h-7 w-7 items-center justify-center rounded-full bg-violet-500/25 text-violet-900 transition hover:bg-violet-500/35 enabled:active:scale-95"
        aria-label="Open Star-Merchant boutique"
        title="Open boutique"
      >
        <Plus className="h-4 w-4" strokeWidth={2.5} />
      </button>
    </div>
  );
});
