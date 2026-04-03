"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { InfoButton } from "@/components/InfoButton";

type WelcomeScreenProps = {
  onStart: () => void;
  isLeaving: boolean;
  isReady?: boolean;
};

export function WelcomeScreen({ onStart, isLeaving, isReady = true }: WelcomeScreenProps) {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <motion.div
      className="fixed inset-0 z-[70] flex items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.28),_transparent_32%),linear-gradient(180deg,_#050510_0%,_#0d0b23_58%,_#151133_100%)] px-6 pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]"
      initial={{ opacity: 1, scale: 1 }}
      animate={isLeaving ? { opacity: 0, scale: 1.15 } : { opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(255,255,255,0.12)_1px,_transparent_1px)] [background-size:34px_34px] opacity-20" />
      <div className="absolute right-[max(1.25rem,env(safe-area-inset-right))] top-[max(1.25rem,env(safe-area-inset-top))] z-20">
        <InfoButton open={showInfo} onOpen={() => setShowInfo(true)} onClose={() => setShowInfo(false)} />
      </div>
      <div className="relative z-10 mx-auto flex w-full max-w-md flex-col items-center text-center">
        <motion.h1
          className="text-6xl font-bold tracking-[0.24em] text-white drop-shadow-[0_0_22px_rgba(129,140,248,1)]"
          animate={{
            textShadow: [
              "0 0 22px rgba(129,140,248,1), 0 0 48px rgba(56,189,248,0.35)",
              "0 0 34px rgba(244,114,182,0.95), 0 0 62px rgba(129,140,248,0.45)",
              "0 0 22px rgba(129,140,248,1), 0 0 48px rgba(56,189,248,0.35)"
            ]
          }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
        >
          BIA
        </motion.h1>
        <p className="mt-5 max-w-xs text-sm font-medium leading-relaxed tracking-[0.06em] text-white/72">
          Enter the core, raise your companion, and stay in sync with its pulse.
        </p>
        <motion.button
          onClick={onStart}
          disabled={!isReady}
          className="mt-10 rounded-full border border-white/20 bg-white px-8 py-4 text-base font-bold tracking-[0.08em] text-slate-950 shadow-[0_0_30px_rgba(255,255,255,0.22)]"
          animate={{ scale: [1, 1.05, 1], boxShadow: ["0 0 20px rgba(255,255,255,0.22)", "0 0 34px rgba(255,255,255,0.5)", "0 0 20px rgba(255,255,255,0.22)"] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          whileTap={{ scale: 0.97 }}
        >
          {isReady ? "BEGIN" : "LOADING"}
        </motion.button>
      </div>
    </motion.div>
  );
}
