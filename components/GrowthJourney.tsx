"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import type { PetStage } from "@/lib/game";
import {
  JOURNEY_STAGES,
  XP_HATCH_TARGET,
  XP_BABY_TO_MID,
  XP_MASTERY_CAP,
  XP_MID_TO_GROWN,
  journeyStepIndex
} from "@/lib/stageProgress";

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

  const nextGoal =
    stage === "egg"
      ? { label: "Hatch", target: XP_HATCH_TARGET }
      : stage === "baby"
        ? { label: "Mid", target: XP_BABY_TO_MID }
        : stage === "teen"
          ? { label: "Grown", target: XP_MID_TO_GROWN }
          : { label: "Peak", target: XP_MASTERY_CAP };
  const remaining = Math.max(0, nextGoal.target - bond);
  const progressText =
    remaining > 0
      ? `${bond} / ${nextGoal.target} to ${nextGoal.label}`
      : stage === "adult"
        ? `Peak bond reached`
        : `${nextGoal.label} ready`;

  useEffect(() => {
    if (bond > previousBond.current) {
      setTwinkleKey((value) => value + 1);
      setLinePulseKey((value) => value + 1);
    }
    previousBond.current = bond;
  }, [bond]);

  return (
    <div className="flex w-full flex-col items-center gap-1.5 px-1 py-2">
      <div className="flex w-full items-center justify-center gap-3">
        <div className="flex min-w-0 flex-1 items-center justify-center">
        {JOURNEY_STAGES.map((step, i) => {
          const state = stepState(i, currentIdx);
          const isLast = i === JOURNEY_STAGES.length - 1;
          const isCurrent = state === "current";
          const isDone = state === "done";
          const isNextAfterCurrent = i === currentIdx;

          return (
            <Fragment key={step.id}>
              <div className="flex shrink-0 flex-col items-center justify-center gap-1">
                <motion.div
                  key={isCurrent ? `${step.id}-${twinkleKey}` : step.id}
                  className={`relative flex items-center justify-center overflow-hidden rounded-full border ${
                    isCurrent
                      ? "h-10 w-10 border-violet-400/80 bg-violet-50 shadow-[0_2px_12px_rgba(124,58,237,0.18)]"
                      : isDone
                        ? "h-8 w-8 border-emerald-300/90 bg-emerald-50"
                        : "h-8 w-8 border-slate-200 bg-slate-50"
                  }`}
                  animate={
                    isCurrent
                      ? {
                          opacity: [0.72, 1, 0.72],
                          scale: [1, 1.07, 1, 1.1, 1]
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
                    className={`relative z-[1] ${
                      isDone
                        ? "fill-emerald-500 text-emerald-600"
                        : isCurrent
                          ? "fill-violet-400 text-violet-600"
                          : "fill-transparent text-slate-500"
                    }`}
                    size={isCurrent ? 22 : 16}
                    strokeWidth={1.8}
                  />
                </motion.div>
                <span
                  className={`text-[8px] font-semibold uppercase tracking-[0.12em] ${
                    isCurrent ? "text-slate-950" : isDone ? "text-slate-800" : "text-slate-600"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {!isLast && (
                <div className="relative mx-1 mb-4 h-0 w-full flex-1 overflow-hidden" style={{ minWidth: 10 }}>
                  <div className="border-t border-dotted border-slate-300" />
                  {isNextAfterCurrent && (
                    <motion.div
                      key={linePulseKey}
                      className="pointer-events-none absolute inset-x-0 top-[-1px] border-t border-dotted border-violet-400/90"
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
        <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200/90 bg-slate-100/95 px-2.5 py-1 shadow-sm">
          <Star className="fill-amber-400 text-amber-600" size={14} strokeWidth={1.8} />
          <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-800">Bia XP</span>
          <motion.span
            key={bond}
            initial={{ opacity: 0.7, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="text-sm font-bold leading-none tabular-nums text-slate-900"
          >
            {bond}
          </motion.span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-500">Growth</p>
        <p className="text-[11px] font-semibold leading-tight text-slate-800">{progressText}</p>
      </div>
    </div>
  );
}
