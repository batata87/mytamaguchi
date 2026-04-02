"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { BrushCleaning, Cherry, CloudMoon, Sparkles } from "lucide-react";
import type { EggType, PetMood, PetStage } from "@/lib/game";

type ActivityReaction = "feed" | "sleep" | "play" | "clean" | null;

export type ActiveCraving = {
  label: string;
  emoji: string;
  expiresAt: number;
} | null;

type CreatureStageProps = {
  stage: PetStage;
  hatchPhase: "idle" | "shake" | "flash";
  mood: PetMood;
  eggType: EggType;
  hunger: number;
  /** Hunger low: lean toward feed / "puppy eyes" plea */
  pleadForFood: boolean;
  craving: ActiveCraving;
  /** Average of hunger/energy/joy/hygiene (0–100) — drives outer aura color and brightness. */
  avgVitality: number;
  /** Pet tool menu open: subtle “ready for pets” look before touch. */
  petToolPrimed: boolean;
  /** Increment to replay a one-shot happy dance (e.g. craving fulfilled). */
  happyDanceNonce: number;
  /** Increment on successful feed — soft marshmallow squash-and-stretch. */
  feedSquashNonce: number;
  /** When > 0, one-shot “reunion” rush toward the player after a long absence. */
  reunionPlayKey: number;
  onPet: () => void;
  petJumpKey: number;
  isExcited: boolean;
  isNearDrop: boolean;
  eggAsset: string;
  eggShouldWobble: boolean;
  useDefaultBabyAsset: boolean;
  isSick: boolean;
  healPulseKey: number;
  activityReaction: ActivityReaction;
};

function eggTypeToTintFilter(eggType: EggType): string {
  // We recolor the existing purple art via hue rotation.
  // These values are tuned for the current asset set; if you provide specific egg reference renders,
  // we can fine-tune for each egg.
  switch (eggType) {
    case "pink":
      return "hue-rotate(46deg) saturate(1.12) contrast(1.02)";
    case "blue":
      return "hue-rotate(-58deg) saturate(1.2) contrast(1.03)";
    case "gold":
      return "hue-rotate(142deg) saturate(1.28) contrast(1.06)";
    default:
      return "";
  }
}

function breatheVariantsForMood(mood: PetMood): Variants {
  const fast = mood === "blissful";
  return {
    idle: {
      scale: [1, fast ? 1.06 : 1.05, 1],
      y: [0, fast ? -14 : -10, 0]
    }
  };
}

const wobbleVariants: Variants = {
  idle: { rotate: 0, scale: 1 },
  wobble: {
    rotate: [-2, 2, -1, 2, 0],
    y: [0, -2, 0]
  },
  shake: {
    rotate: [-10, 10, -12, 12, -8, 8, 0],
    x: [-8, 8, -10, 10, -6, 6, 0],
    scale: [1, 1.02, 0.98, 1.03, 1]
  }
};

function EggStateArt({ src }: { src: string }) {
  return (
    <Image
      src={src}
      alt="Egg stage"
      width={260}
      height={260}
      className="h-44 w-44 object-contain sm:h-60 sm:w-60"
      unoptimized
      priority
    />
  );
}

function DefaultBabyArt() {
  return (
    <Image
      src="/assets/stage3_baby.png"
      alt="Default baby pet"
      width={260}
      height={260}
      className="h-52 w-52 object-contain"
      unoptimized
      priority
    />
  );
}

function CreatureSprite({ stage }: { stage: Exclude<PetStage, "egg"> }) {
  const src =
    stage === "baby" ? "/assets/stage3_baby.png" : stage === "teen" ? "/assets/stage4_medium.png" : "/assets/stage5_adult.png";
  const sizeClass = stage === "adult" ? "h-56 w-72" : "h-52 w-52";

  return <Image src={src} alt={`${stage} creature`} width={320} height={320} className={`${sizeClass} object-contain`} unoptimized priority />;
}

function SickCreatureArt() {
  return (
    <Image
      src="/assets/sick.png"
      alt="Sick creature"
      width={320}
      height={320}
      className="h-56 w-56 object-contain"
      unoptimized
      priority
    />
  );
}

function ReactionOverlay({ activityReaction }: { activityReaction: ActivityReaction }) {
  if (!activityReaction) {
    return null;
  }

  if (activityReaction === "feed") {
    return (
      <motion.div
        className="pointer-events-none absolute left-1/2 top-[34%] z-20 ml-6"
        initial={{ opacity: 0, scale: 0.7, x: 10, y: 8 }}
        animate={{ opacity: [0, 1, 1, 0], scale: [0.7, 1.05, 1, 0.92], x: [10, 0, -6, -10], y: [8, 0, 2, 4] }}
        transition={{ duration: 0.85, ease: "easeOut" }}
      >
        <div className="rounded-full border border-white/40 bg-white/28 p-2 text-rose-50 shadow-[0_0_18px_rgba(255,255,255,0.25)] backdrop-blur-sm">
          <Cherry size={18} strokeWidth={2} />
        </div>
      </motion.div>
    );
  }

  if (activityReaction === "sleep") {
    return (
      <motion.div
        className="pointer-events-none absolute left-1/2 top-[18%] z-20 ml-8 text-indigo-50"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: [0, 1, 1, 0], y: [10, -6, -18, -30] }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      >
        <div className="mb-1 flex justify-center">
          <CloudMoon size={18} strokeWidth={2} />
        </div>
        <div className="text-xs font-bold tracking-[0.18em]">Zz</div>
      </motion.div>
    );
  }

  if (activityReaction === "play") {
    return (
      <motion.div
        className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center text-amber-50"
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: [0, 1, 1, 0], scale: [0.85, 1.1, 1] }}
        transition={{ duration: 0.9, ease: "easeOut" }}
      >
        <motion.div
          className="absolute -left-2 top-10"
          animate={{ x: [0, 12, 0], y: [0, -12, 0], rotate: [0, 20, 0] }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          <Sparkles size={18} strokeWidth={2} />
        </motion.div>
        <motion.div
          className="absolute -right-1 top-14"
          animate={{ x: [0, -10, 0], y: [0, 8, 0], rotate: [0, -18, 0] }}
          transition={{ duration: 0.75, ease: "easeInOut" }}
        >
          <Sparkles size={20} strokeWidth={2} />
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center text-cyan-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 1, 0] }}
      transition={{ duration: 0.95, ease: "easeOut" }}
    >
      {Array.from({ length: 4 }).map((_, idx) => (
        <motion.div
          key={idx}
          className="absolute"
          style={{
            left: `${28 + idx * 14}%`,
            top: `${24 + (idx % 2) * 18}%`
          }}
          animate={{ y: [8, -8, -18], opacity: [0, 1, 0], scale: [0.7, 1, 0.85] }}
          transition={{ duration: 0.9, ease: "easeOut", delay: idx * 0.08 }}
        >
          <BrushCleaning size={16} strokeWidth={2} />
        </motion.div>
      ))}
    </motion.div>
  );
}

function PleadingOverlay({ active, hunger }: { active: boolean; hunger: number }) {
  if (!active) {
    return null;
  }
  const urgency = Math.max(0, Math.min(1, (20 - hunger) / 20));
  return (
    <>
      <motion.div
        className="pointer-events-none absolute -right-2 top-[8%] z-30 flex flex-col items-end gap-0.5 sm:right-0 sm:top-[10%]"
        initial={{ opacity: 0, x: 8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.35 }}
      >
        <span className="text-[10px] font-bold uppercase tracking-wide text-rose-100/90 drop-shadow">Feed</span>
        <motion.span
          className="text-lg"
          animate={{ x: [0, 4 + urgency * 2, 0], y: [0, 2, 0] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
          aria-hidden
        >
          🍒
        </motion.span>
      </motion.div>
      <div
        className="pointer-events-none absolute left-1/2 top-[12%] z-30 flex items-center gap-1 rounded-full border border-white/35 bg-white/20 px-2 py-0.5 text-lg shadow-lg backdrop-blur-sm"
        aria-hidden
        style={{ transform: `translateX(-50%) scale(${1 + urgency * 0.08})` }}
      >
        <span>🥺</span>
      </div>
    </>
  );
}

/** Softer, warmer aura when thriving; cooler / dimmer when stats are low. */
function vitalityAuraStyle(avg: number): { background: string; boxShadow: string; opacity: number } {
  const t = Math.max(0, Math.min(1, avg / 100));
  const pulse = 0.42 + t * 0.38;
  if (t < 0.38) {
    return {
      background: `radial-gradient(circle, rgba(251,113,133,${0.28 + t * 0.15}) 0%, rgba(168,85,247,0.12) 55%, transparent 72%)`,
      boxShadow: `0 0 70px rgba(251,113,133,${0.25 + t * 0.25}), 0 0 120px rgba(244,63,94,${0.12 + t * 0.1})`,
      opacity: 0.38 + t * 0.25
    };
  }
  if (t < 0.72) {
    return {
      background: `radial-gradient(circle, rgba(251,191,36,${0.22 + (t - 0.38) * 0.2}) 0%, rgba(253,186,116,0.14) 50%, transparent 70%)`,
      boxShadow: `0 0 64px rgba(245,158,11,${0.22 + (t - 0.38) * 0.3})`,
      opacity: 0.48 + (t - 0.38) * 0.35
    };
  }
  return {
    background: `radial-gradient(circle, rgba(52,211,153,${0.28 + (t - 0.72) * 0.25}) 0%, rgba(34,211,238,0.12) 55%, transparent 72%)`,
    boxShadow: `0 0 72px rgba(16,185,129,${0.35 + (t - 0.72) * 0.25}), 0 0 100px rgba(45,212,191,${0.15 + (t - 0.72) * 0.2})`,
    opacity: pulse
  };
}

function CravingBubble({ craving, now }: { craving: NonNullable<ActiveCraving>; now: number }) {
  const leftMs = Math.max(0, craving.expiresAt - now);
  const secs = Math.ceil(leftMs / 1000);
  return (
    <motion.div
      className="pointer-events-none absolute left-1/2 top-0 z-40 -translate-x-1/2 -translate-y-full px-2"
      initial={{ opacity: 0, y: 6, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -4 }}
    >
      <div className="relative rounded-2xl border border-amber-200/50 bg-amber-50/95 px-3 py-2 text-center shadow-lg">
        <p className="text-[9px] font-bold uppercase tracking-wide text-amber-900/80">Craving</p>
        <p className="text-sm font-semibold text-amber-950">
          {craving.emoji} {craving.label}
        </p>
        <p className="text-[10px] text-amber-900/70">{secs}s</p>
        <div className="absolute -bottom-1.5 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-b border-r border-amber-200/50 bg-amber-50/95" />
      </div>
    </motion.div>
  );
}

export function CreatureStage({
  stage,
  hatchPhase,
  mood,
  eggType,
  hunger,
  pleadForFood,
  craving,
  avgVitality,
  petToolPrimed,
  happyDanceNonce,
  feedSquashNonce,
  reunionPlayKey,
  onPet,
  petJumpKey,
  isExcited,
  isNearDrop,
  eggAsset,
  eggShouldWobble,
  useDefaultBabyAsset,
  isSick,
  healPulseKey,
  activityReaction
}: CreatureStageProps) {
  const breatheVariants = breatheVariantsForMood(mood);
  const breatheDuration = isSick ? 4.8 : mood === "blissful" ? 1.4 : 2.4;
  const creatureFilterParts: string[] = [];

  if (isSick) {
    // Sick art swaps out, but we keep this for safety if any layer still uses the base sprite.
    creatureFilterParts.push("grayscale(0.8) contrast(1.2)");
  } else {
    const moodFilter = mood === "distressed" ? "saturate(0.75) brightness(0.96)" : "";
    const tintFilter = eggTypeToTintFilter(eggType);
    if (moodFilter) creatureFilterParts.push(moodFilter);
    if (tintFilter) creatureFilterParts.push(tintFilter);
  }

  const creatureFilter = creatureFilterParts.length ? creatureFilterParts.join(" ") : undefined;
  const [nowTick, setNowTick] = useState(() => Date.now());
  useEffect(() => {
    if (!craving) {
      return;
    }
    const id = window.setInterval(() => setNowTick(Date.now()), 500);
    return () => window.clearInterval(id);
  }, [craving]);

  const aura = vitalityAuraStyle(avgVitality);
  const auraBreath = Math.max(0.35, Math.min(0.95, aura.opacity));

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-visible px-2 sm:px-4">
      <motion.div
        className="absolute top-[58%] h-48 w-60 -translate-y-1/2 rounded-full blur-3xl"
        style={{ background: aura.background, boxShadow: aura.boxShadow }}
        animate={{
          scale: [1, 1.08, 1],
          opacity: [auraBreath * 0.85, auraBreath, auraBreath * 0.88]
        }}
        transition={{ duration: 4.2 + (100 - avgVitality) * 0.02, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-[58%] h-36 w-44 -translate-y-1/2 rounded-full bg-white/10 blur-2xl"
        animate={{ scale: [1, 1.06, 1], opacity: [0.25, 0.42, 0.28] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
      />
      {stage !== "egg" && !isSick && (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-40 flex justify-center">
          <AnimatePresence>
            {craving && <CravingBubble craving={craving} now={nowTick} key="craving" />}
          </AnimatePresence>
        </div>
      )}
      <motion.button
        onClick={onPet}
        className="relative -mt-2 flex items-center justify-center"
        style={{
          filter: creatureFilter
        }}
        animate={pleadForFood ? { rotate: -5 } : { rotate: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <motion.div
          key={reunionPlayKey > 0 ? `reunion-${reunionPlayKey}` : "idle"}
          initial={reunionPlayKey > 0 ? { scale: 0.68, y: 100, opacity: 0.72 } : false}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 340, damping: 19, mass: 0.62 }}
          className="flex items-center justify-center"
          style={{ transformOrigin: "50% 60%" }}
        >
        <motion.div
          initial={false}
          animate={healPulseKey ? { scale: [1, 1.12, 0.98, 1], y: [0, -4, 0] } : petJumpKey ? { y: [0, -20, 0] } : { y: 0 }}
          transition={{ duration: healPulseKey ? 0.9 : 0.35, ease: "easeOut" }}
          className="flex items-center justify-center"
        >
          {stage === "egg" ? (
            <motion.div
              variants={wobbleVariants}
              animate={hatchPhase === "shake" ? "shake" : eggShouldWobble ? "wobble" : "idle"}
              transition={
                hatchPhase === "shake"
                  ? { duration: 0.55, ease: "easeInOut" }
                  : { duration: 2.2, repeat: Infinity, ease: "easeInOut" }
              }
            >
              <EggStateArt src={eggAsset} />
            </motion.div>
          ) : (
            <motion.div
              variants={breatheVariants}
              initial={false}
              className={`relative ${mood === "blissful" ? "drop-shadow-[0_0_22px_rgba(251,191,36,0.75)]" : ""}`}
              animate={
                isExcited
                  ? { scale: [1, 1.1, 1.05], y: [0, -10, 0] }
                  : petToolPrimed && !isSick
                    ? { scaleY: [1, 0.94, 1], scaleX: [1, 1.03, 1], y: [0, -1, 0] }
                    : "idle"
              }
              style={petToolPrimed && !isExcited ? { transformOrigin: "center 60%" } : undefined}
              transition={
                isExcited
                  ? { duration: 0.55, ease: "easeOut" }
                  : petToolPrimed && !isSick
                    ? { duration: 2.2, repeat: Infinity, ease: "easeInOut" }
                    : { duration: breatheDuration, ease: "easeInOut", repeat: Infinity }
              }
            >
              {petToolPrimed && !isSick && (
                <div
                  className="pointer-events-none absolute left-1/2 top-[10%] z-20 -translate-x-1/2 text-2xl opacity-95 drop-shadow-md"
                  aria-hidden
                >
                  😌
                </div>
              )}
              <PleadingOverlay active={pleadForFood && !isSick} hunger={hunger} />
              <ReactionOverlay activityReaction={activityReaction} />
              <motion.div
                key={feedSquashNonce}
                className="relative inline-block"
                style={{ transformOrigin: "center 62%" }}
                initial={false}
                animate={
                  feedSquashNonce > 0
                    ? { scaleX: [1, 1.14, 0.86, 1.06, 1], scaleY: [1, 0.82, 1.12, 0.95, 1] }
                    : { scaleX: 1, scaleY: 1 }
                }
                transition={{ duration: 0.55, ease: [0.34, 1.5, 0.64, 1] }}
              >
              <motion.div
                key={happyDanceNonce}
                className="relative"
                initial={happyDanceNonce === 0 ? false : { rotate: 0, scale: 1 }}
                animate={
                  happyDanceNonce > 0
                    ? { rotate: [0, -14, 14, -10, 10, 0], scale: [1, 1.12, 1.06, 1.1, 1] }
                    : { rotate: 0, scale: 1 }
                }
                transition={{ duration: 0.85, ease: "easeInOut" }}
              >
                <AnimatePresence mode="sync" initial={false}>
                  <motion.div
                    key={`${stage}-${isSick ? "sick" : "well"}-${useDefaultBabyAsset ? "default" : "evo"}`}
                    initial={{ opacity: 0, scale: 0.94, y: 8 }}
                    animate={isNearDrop ? { opacity: 1, scale: [1, 1.08, 1.02], y: [0, -4, 0] } : { opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 1.04, y: -6 }}
                    transition={{ duration: 0.65, ease: [0.4, 0, 0.2, 1] }}
                  >
                    {isSick ? (
                      <SickCreatureArt />
                    ) : stage === "baby" && useDefaultBabyAsset ? (
                      <DefaultBabyArt />
                    ) : (
                      <CreatureSprite stage={stage} />
                    )}
                  </motion.div>
                </AnimatePresence>
              </motion.div>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
        </motion.div>
      </motion.button>
    </div>
  );
}
