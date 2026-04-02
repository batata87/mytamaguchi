"use client";

import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import { BrushCleaning, Cherry, CloudMoon, Sparkles } from "lucide-react";
import type { EggType, PetMood, PetStage } from "@/lib/game";

type ActivityReaction = "feed" | "sleep" | "play" | "clean" | null;

type CreatureStageProps = {
  stage: PetStage;
  hatchPhase: "idle" | "shake" | "flash";
  mood: PetMood;
  eggType: EggType;
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
      className="h-60 w-60 object-contain"
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

export function CreatureStage({
  stage,
  hatchPhase,
  mood,
  eggType,
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

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden px-2 sm:px-4">
      <motion.div
        className="absolute top-[58%] h-44 w-56 -translate-y-1/2 rounded-full bg-white/18 blur-2xl"
        animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.button
        onClick={onPet}
        className="relative -mt-2 flex items-center justify-center"
        style={{
          filter: creatureFilter
        }}
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
              transition={{ duration: breatheDuration, ease: "easeInOut", repeat: Infinity }}
              initial={false}
              className={`relative ${mood === "blissful" ? "drop-shadow-[0_0_22px_rgba(251,191,36,0.75)]" : ""}`}
              animate={isExcited ? { scale: [1, 1.1, 1.05], y: [0, -10, 0] } : "idle"}
            >
              <ReactionOverlay activityReaction={activityReaction} />
              <motion.div animate={isNearDrop ? { scale: [1, 1.08, 1.1] } : { scale: 1 }}>
                {isSick ? <SickCreatureArt /> : stage === "baby" && useDefaultBabyAsset ? <DefaultBabyArt /> : <CreatureSprite stage={stage} />}
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      </motion.button>
    </div>
  );
}
