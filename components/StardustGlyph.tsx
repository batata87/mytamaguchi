"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const GLYPH_SIZES = {
  /** Meteor taps, flight particles */
  xs: { box: "h-[18px] w-[18px]", img: "h-5 w-5" },
  /** Inline prices in lists */
  sm: { box: "h-5 w-5", img: "h-6 w-6" },
  /** Header counter (matches legacy StardustCounter) */
  md: { box: "h-[22px] w-[22px]", img: "h-[26px] w-[26px]" },
  /** Modal headers */
  lg: { box: "h-12 w-12", img: "h-14 w-14" }
} as const;

export type StardustGlyphSize = keyof typeof GLYPH_SIZES;

type StardustGlyphProps = {
  size?: StardustGlyphSize;
  /** Gentle pulse (header counter) */
  animate?: boolean;
  /** `light` = visible on dark modal backgrounds */
  variant?: "default" | "light";
  className?: string;
};

export function StardustGlyph({ size = "md", animate = false, variant = "default", className = "" }: StardustGlyphProps) {
  const s = GLYPH_SIZES[size];
  const shell =
    variant === "light"
      ? "bg-gradient-to-br from-white/25 to-indigo-200/20 ring-1 ring-white/40"
      : "bg-gradient-to-br from-indigo-100/50 to-cyan-100/40 ring-1 ring-white/50";
  const inner = (
    <Image
      src="/assets/stardust-icon.png"
      alt=""
      width={128}
      height={128}
      className={`${s.img} object-cover object-center`}
      unoptimized
    />
  );
  const wrap = `relative flex shrink-0 items-center justify-center overflow-hidden rounded-full ${shell} ${s.box} ${className}`.trim();
  if (animate) {
    return (
      <motion.span
        className={wrap}
        animate={{ scale: [1, 1.06, 1] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
      >
        {inner}
      </motion.span>
    );
  }
  return <span className={wrap}>{inner}</span>;
}

type StardustBalancePillProps = {
  amount: number;
  /** Pulse the icon (main HUD counter) */
  animateIcon?: boolean;
  className?: string;
};

/** Same chrome as the top-bar stardust counter (icon + number). */
export function StardustBalancePill({ amount, animateIcon = false, className = "" }: StardustBalancePillProps) {
  return (
    <div
      className={`flex min-w-0 items-center gap-1 rounded-full border border-white/50 bg-white/45 py-0.5 pl-1 pr-1.5 shadow-[0_6px_20px_rgba(139,92,246,0.18)] backdrop-blur-md ${className}`.trim()}
    >
      <StardustGlyph size="md" animate={animateIcon} />
      <span className="min-w-[1.25rem] text-center text-xs font-bold tabular-nums text-amber-950/95">{amount}</span>
    </div>
  );
}
