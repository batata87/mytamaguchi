"use client";

import { motion } from "framer-motion";
import type { EggType } from "@/lib/game";

type ChooseEggScreenProps = {
  onChoose: (eggType: EggType) => void;
};

const eggOptions: Array<{
  id: EggType;
  label: string;
  shellClass: string;
  glowClass: string;
}> = [
  {
    id: "pink",
    label: "Pink Egg",
    shellClass: "from-rose-300 via-pink-200 to-fuchsia-300",
    glowClass: "shadow-[0_0_28px_rgba(244,114,182,0.35)]"
  },
  {
    id: "blue",
    label: "Blue Egg",
    shellClass: "from-sky-300 via-cyan-200 to-indigo-300",
    glowClass: "shadow-[0_0_28px_rgba(56,189,248,0.35)]"
  },
  {
    id: "gold",
    label: "Gold Egg",
    shellClass: "from-amber-300 via-yellow-200 to-orange-300",
    glowClass: "shadow-[0_0_28px_rgba(251,191,36,0.4)]"
  }
];

export function ChooseEggScreen({ onChoose }: ChooseEggScreenProps) {
  return (
    <div className="fixed inset-0 z-[65] flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-md">
      <div className="w-full max-w-lg rounded-[2rem] border border-white/20 bg-[linear-gradient(180deg,rgba(16,24,52,0.94),rgba(41,20,79,0.94))] p-6 text-white shadow-[0_20px_60px_rgba(10,10,30,0.45)]">
        <h2 className="text-center text-2xl font-bold tracking-tight">Choose your Egg</h2>
        <p className="mt-2 text-center text-sm text-white/75">Your first bond begins with a shell color. Pick the one you want to raise.</p>
        <div className="mt-6 grid grid-cols-3 gap-3">
          {eggOptions.map((option) => (
            <motion.button
              key={option.id}
              onClick={() => onChoose(option.id)}
              className="flex h-[156px] flex-col items-center justify-between rounded-3xl border border-white/15 bg-white/5 px-3 py-4 text-center"
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex h-24 w-full items-end justify-center">
                <motion.div
                  className={`h-24 w-16 rounded-[48%_48%_42%_42%/58%_58%_42%_42%] bg-gradient-to-b ${option.shellClass} ${option.glowClass}`}
                  animate={{ y: [0, -4, 0], rotate: [0, -1.25, 1.25, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>
              <div className="mt-3 text-xs font-semibold text-white/90">{option.label}</div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
