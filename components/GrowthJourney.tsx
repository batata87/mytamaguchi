"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import type { PetStage } from "@/lib/game";
import { JOURNEY_STAGES, journeyStepIndex } from "@/lib/stageProgress";

type GrowthJourneyProps = {
  stage: PetStage;
  bond: number;
};

function stepState(stepIdx: number, currentIdx: number): "done" | "current" | "upcoming" {
  if (stepIdx < currentIdx) {
    return "done";
  }
  if (stepIdx === currentIdx) {
    return "current";
  }
  return "upcoming";
}

export function GrowthJourney({ stage, bond }: GrowthJourneyProps) {
  const currentIdx = journeyStepIndex(stage);
  const previousBond = useRef(bond);
  const [twinkleKey, setTwinkleKey] = useState(0);
  const [linePulseKey, setLinePulseKey] = useState(0);

  useEffect(() => {
    if (bond > previousBond.current) {
      setTwinkleKey((value) => value + 1);
      setLinePulseKey((value) => value + 1);
    }
    previousBond.current = bond;
  }, [bond]);

  return (
    <div className="flex w-full items-center justify-center gap-3 px-1 py-2">
      <div className="flex min-w-0 flex-1 items-center justify-center">
        {JOURNEY_STAGES.map((step, i) => {
          const state = stepState(i, currentIdx);
          const isLast = i === JOURNEY_STAGES.length - 1;
          const isCurrent = state === "current";
          const isDone = state === "done";
          const isNextAfterCurrent = i === currentIdx;

          return (
            <Fragment key={step.id}>
              <div className="flex shrink-0 items-center justify-center">
                <motion.div
                  key={isCurrent ? `${step.id}-${twinkleKey}` : step.id}
                  className={`flex items-center justify-center ${
                    isCurrent ? "h-9 w-9" : "h-7 w-7"
                  } ${isDone ? "drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" : ""}`}
                  animate={
                    isCurrent
                      ? {
                          opacity: [0.5, 1, 0.5],
                          scale: [1.2, 1.28, 1.2, 1.34, 1.2]
                        }
                      : {}
                  }
                  transition={{
                    duration: 2.6,
                    repeat: isCurrent ? Infinity : 0,
                    ease: "easeInOut"
                  }}
                >
                  <Star
                    className={`${
                      isDone
                        ? "fill-white text-white"
                        : isCurrent
                          ? "fill-white/90 text-white"
                          : "fill-white/30 text-white/30"
                    }`}
                    size={isCurrent ? 24 : 18}
                    strokeWidth={1.8}
                  />
                </motion.div>
              </div>
              {!isLast && (
                <div className="relative mx-1 h-0 w-full flex-1 overflow-hidden" style={{ minWidth: 10 }}>
                  <div className="border-t border-dotted border-white/30" />
                  {isNextAfterCurrent && (
                    <motion.div
                      key={linePulseKey}
                      className="pointer-events-none absolute inset-x-0 top-[-1px] border-t border-dotted border-white/75"
                      initial={{ opacity: 0, x: "-30%" }}
                      animate={{ opacity: [0, 0.95, 0], x: ["-30%", "30%", "95%"] }}
                      transition={{ duration: 0.9, ease: "easeInOut" }}
                    />
                  )}
                </div>
              )}
            </Fragment>
          );
        })}
      </div>
      <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-white/16 px-2 py-1 backdrop-blur-sm">
        <Star className="fill-white/90 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.7)]" size={14} strokeWidth={1.8} />
        <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-white/76">Bia Sync</span>
        <motion.span
          key={bond}
          initial={{ opacity: 0.7, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          className="text-sm font-bold leading-none tabular-nums text-white"
        >
          {bond}
        </motion.span>
      </div>
    </div>
  );
}
