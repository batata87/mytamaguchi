"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Sparkles, TriangleAlert, HeartPulse } from "lucide-react";
import type { PetMood } from "@/lib/game";

const moodVisual: Record<
  PetMood,
  { label: string; gradient: string; ring: string; icon: ReactNode; text: string; sub: string; chip: string; detail: string }
> = {
  happy: {
    label: "Content",
    gradient: "from-sky-200/35 via-indigo-100/25 to-violet-200/35",
    ring: "ring-sky-400/35",
    icon: <Sparkles size={16} strokeWidth={2} />,
    text: "text-slate-900",
    sub: "text-slate-700",
    chip: "bg-white/55 text-slate-800",
    detail: "Stable and doing well"
  },
  blissful: {
    label: "Blissful",
    gradient: "from-amber-200/40 via-orange-100/30 to-fuchsia-200/35",
    ring: "ring-amber-400/45",
    icon: <Sparkles size={16} strokeWidth={2} />,
    text: "text-amber-950",
    sub: "text-amber-900/90",
    chip: "bg-white/60 text-amber-950",
    detail: "High bond and great stats"
  },
  distressed: {
    label: "Needs care",
    gradient: "from-slate-700/55 via-indigo-900/50 to-slate-900/55",
    ring: "ring-indigo-400/40",
    icon: <TriangleAlert size={16} strokeWidth={2} />,
    text: "text-white",
    sub: "text-indigo-100",
    chip: "bg-white/15 text-white",
    detail: "One or more core stats are low"
  },
  sick: {
    label: "Unwell",
    gradient: "from-emerald-950/60 via-slate-900/55 to-emerald-950/60",
    ring: "ring-emerald-500/35",
    icon: <HeartPulse size={16} strokeWidth={2} />,
    text: "text-emerald-50",
    sub: "text-emerald-100/90",
    chip: "bg-white/10 text-emerald-50",
    detail: "Use Star Elixir to recover"
  }
};

export function MoodAura({ mood }: { mood: PetMood }) {
  const v = moodVisual[mood];

  return (
    <motion.div
      className={`relative overflow-hidden rounded-xl bg-gradient-to-r p-[1px] ${v.ring} ring-1 shadow-sm`}
      initial={false}
      animate={{ opacity: [0.92, 1, 0.92] }}
      transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
    >
      <div
        className={`flex items-center justify-between gap-2 rounded-[11px] bg-gradient-to-r px-2.5 py-1.5 ${v.gradient}`}
      >
        <div className="flex items-center gap-2">
          <span
            className={`flex h-7 w-7 items-center justify-center rounded-full text-base shadow-inner backdrop-blur-sm ${v.chip}`}
            aria-hidden
          >
            {v.icon}
          </span>
          <div className="min-w-0">
            <p className={`text-[8px] font-semibold uppercase tracking-normal ${v.sub}`}>Mood</p>
            <p className={`truncate text-[13px] font-bold leading-tight ${v.text}`}>{v.label}</p>
            <p className={`text-[9px] leading-tight ${v.sub}`}>{v.detail}</p>
          </div>
        </div>
        <div className="pointer-events-none absolute -right-4 -top-6 h-14 w-14 rounded-full bg-white/25 blur-2xl" />
      </div>
    </motion.div>
  );
}
