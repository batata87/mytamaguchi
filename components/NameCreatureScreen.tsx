"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const MAX_NAME = 24;

type NameCreatureScreenProps = {
  onConfirm: (name: string) => void;
};

export function NameCreatureScreen({ onConfirm }: NameCreatureScreenProps) {
  const [value, setValue] = useState("");

  const trimmed = value.trim();
  const canSubmit = trimmed.length > 0;

  return (
    <motion.div
      className="fixed inset-0 z-[66] flex items-center justify-center bg-slate-950/55 px-4 pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)] backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      <motion.div
        className="w-full max-w-lg rounded-[2rem] border border-white/20 bg-[linear-gradient(180deg,rgba(16,24,52,0.94),rgba(41,20,79,0.94))] p-6 text-white shadow-[0_20px_60px_rgba(10,10,30,0.45)]"
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.98, opacity: 0 }}
        transition={{ type: "spring", damping: 26, stiffness: 320 }}
      >
        <p className="text-center text-[10px] font-bold uppercase tracking-[0.2em] text-violet-200/90">Bia</p>
        <h2 className="mt-1 text-center text-2xl font-bold tracking-tight">Name your companion</h2>
        <p className="mt-3 text-center text-sm leading-relaxed text-white/78">
          <span className="font-semibold text-white/95">Bia</span> is this game — your creature is{" "}
          <span className="font-semibold text-white/95">yours</span>. Pick any name you like; you can change it
          later by tapping the name at the top of the screen.
        </p>

        <label className="mt-6 block">
          <span className="sr-only">Creature name</span>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value.slice(0, MAX_NAME))}
            placeholder="e.g. Luna, Comet, Bia…"
            maxLength={MAX_NAME}
            autoComplete="off"
            autoCapitalize="words"
            enterKeyHint="done"
            className="app-tap-target w-full rounded-2xl border border-white/25 bg-white/10 px-4 py-3.5 text-base font-semibold text-white outline-none ring-0 placeholder:text-white/40 focus:border-violet-300/60 focus:bg-white/14"
          />
        </label>
        <p className="mt-2 text-center text-[11px] text-white/50">
          {trimmed.length}/{MAX_NAME} characters
        </p>

        <motion.button
          type="button"
          disabled={!canSubmit}
          onClick={() => {
            if (canSubmit) {
              onConfirm(trimmed);
            }
          }}
          className="app-tap-target mt-6 w-full rounded-2xl border border-violet-300/50 bg-gradient-to-b from-violet-400/90 to-indigo-500/90 py-3.5 text-sm font-bold text-white shadow-[0_8px_28px_rgba(99,102,241,0.35)] transition enabled:active:scale-[0.99] disabled:cursor-not-allowed disabled:border-white/15 disabled:bg-white/10 disabled:text-white/40 disabled:shadow-none"
          whileTap={canSubmit ? { scale: 0.99 } : undefined}
        >
          Continue
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
