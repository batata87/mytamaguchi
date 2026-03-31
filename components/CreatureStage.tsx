"use client";

import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import type { PetMood, PetStage } from "@/lib/game";
import { PetSprite } from "@/components/PetSprite";

type CreatureStageProps = {
  stage: PetStage;
  hatchPhase: "idle" | "shake" | "flash";
  hunger: number;
  joy: number;
  mood: PetMood;
  onPet: () => void;
  petJumpKey: number;
  isExcited: boolean;
  isNearDrop: boolean;
  eggAsset: string;
  eggShouldWobble: boolean;
  useDefaultBabyAsset: boolean;
  isSick: boolean;
  healPulseKey: number;
};

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
      priority
    />
  );
}

function DefaultBabyArt() {
  return (
    <Image
      src="/default_pet.png"
      alt="Default baby pet"
      width={260}
      height={260}
      className="h-52 w-52 object-contain"
      priority
    />
  );
}

function CreatureSprite({ stage }: { stage: Exclude<PetStage, "egg"> }) {
  const spritePart = stage === "baby" ? "baby" : stage === "teen" ? "juvenile" : "adult";
  const sizeClass = stage === "adult" ? "h-56 w-72" : "h-52 w-52";

  return <PetSprite partName={spritePart} className={sizeClass} />;
}

export function CreatureStage({
  stage,
  hatchPhase,
  hunger,
  joy,
  mood,
  onPet,
  petJumpKey,
  isExcited,
  isNearDrop,
  eggAsset,
  eggShouldWobble,
  useDefaultBabyAsset,
  isSick,
  healPulseKey
}: CreatureStageProps) {
  const breatheVariants = breatheVariantsForMood(mood);
  const breatheDuration = isSick ? 4.8 : mood === "blissful" ? 1.4 : 2.4;
  const lowFeel = hunger < 20 || joy < 20;

  const creatureFilter = isSick
    ? "grayscale(0.8) contrast(1.2)"
    : lowFeel
      ? "grayscale(1)"
      : mood === "distressed"
        ? "saturate(0.5)"
        : undefined;

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden px-4">
      <motion.div
        className="absolute top-[58%] h-44 w-56 -translate-y-1/2 rounded-full bg-white/18 blur-2xl"
        animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.button
        onClick={onPet}
        className="relative -mt-2 flex items-center justify-center"
        animate={
          mood === "distressed"
            ? { x: [0, -3, 3, -2, 2, 0], y: [0, 2, -2, 1, -1, 0] }
            : undefined
        }
        transition={
          mood === "distressed"
            ? { duration: 0.35, repeat: Infinity, ease: "linear" }
            : undefined
        }
        style={{
          filter: creatureFilter
        }}
      >
        <motion.div
          key={`${petJumpKey}-${healPulseKey}`}
          initial={{ y: 0 }}
          animate={healPulseKey ? { scale: [1, 1.12, 0.98, 1], y: [0, -4, 0] } : petJumpKey ? { y: [-20, 0] } : { y: 0 }}
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
              key={stage}
              variants={breatheVariants}
              transition={{ duration: breatheDuration, ease: "easeInOut", repeat: Infinity }}
              initial={{ scale: 0.5, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              className={`relative ${mood === "blissful" ? "drop-shadow-[0_0_22px_rgba(251,191,36,0.75)]" : ""}`}
              animate={isExcited ? { scale: [1, 1.1, 1.05], y: [0, -10, 0] } : "idle"}
            >
              <motion.div animate={isNearDrop ? { scale: [1, 1.08, 1.1] } : { scale: 1 }}>
                {stage === "baby" && useDefaultBabyAsset ? <DefaultBabyArt /> : <CreatureSprite stage={stage} />}
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      </motion.button>
    </div>
  );
}
