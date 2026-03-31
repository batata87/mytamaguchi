"use client";

import { motion } from "framer-motion";
import type { PetMood } from "@/lib/game";

const moodVisual: Record<
  PetMood,
  { label: string; gradient: string; ring: string; emoji: string; text: string; sub: string; chip: string }
> = {
  happy: {
    label: "Content",
    gradient: "from-sky-200/35 via-indigo-100/25 to-violet-200/35",
    ring: "ring-sky-400/35",
    emoji: "✧",
    text: "text-slate-900",
    sub: "text-slate-700",
    chip: "bg-white/55 text-slate-800"
  },
  blissful: {
    label: "Blissful",
    gradient: "from-amber-200/40 via-orange-100/30 to-fuchsia-200/35",
    ring: "ring-amber-400/45",
    emoji: "✦",
    text: "text-amber-950",
    sub: "text-amber-900/90",
    chip: "bg-white/60 text-amber-950"
  },
  distressed: {
    label: "Needs care",
    gradient: "from-slate-700/55 via-indigo-900/50 to-slate-900/55",
    ring: "ring-indigo-400/40",
    emoji: "⋯",
    text: "text-white",
    sub: "text-indigo-100",
    chip: "bg-white/15 text-white"
  },
  sick: {
    label: "Unwell",
    gradient: "from-emerald-950/60 via-slate-900/55 to-emerald-950/60",
    ring: "ring-emerald-500/35",
    emoji: "♥",
    text: "text-emerald-50",
    sub: "text-emerald-100/90",
    chip: "bg-white/10 text-emerald-50"
  }
};

export function MoodAura({ mood }: { mood: PetMood }) {
  const v = moodVisual[mood];

  return (
    <motion.div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-r p-[1px] ${v.ring} ring-1 shadow-sm`}
      initial={false}
      animate={{ opacity: [0.92, 1, 0.92] }}
      transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
    >
      <div
        className={`flex items-center justify-between gap-2 rounded-[15px] bg-gradient-to-r px-3 py-2 ${v.gradient}`}
      >
        <div className="flex items-center gap-2">
          <span
            className={`flex h-9 w-9 items-center justify-center rounded-full text-lg shadow-inner backdrop-blur-sm ${v.chip}`}
            aria-hidden
          >
            {v.emoji}
          </span>
          <div className="min-w-0">
            <p className={`text-[9px] font-semibold uppercase tracking-normal ${v.sub}`}>Mood</p>
            <p className={`truncate text-sm font-bold leading-tight ${v.text}`}>{v.label}</p>
            <p className={`text-[10px] capitalize leading-tight ${v.sub}`}>{mood}</p>
          </div>
        </div>
        <div className="pointer-events-none absolute -right-4 -top-6 h-16 w-16 rounded-full bg-white/25 blur-2xl" />
      </div>
    </motion.div>
  );
}
