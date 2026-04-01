"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import type { PetMood } from "@/lib/game";

/** Cinematic habitat scenes — background cross-fades on activity. */
export type SceneState = "nursery" | "feed" | "sleep" | "play" | "clean";

const sceneGradients: Record<SceneState, string> = {
  nursery: "from-[#E8DDFF] via-[#E2D4FF] to-[#DBC4F9]",
  feed: "from-[#ffe4f0] via-[#f5e6ff] to-[#DBC4F9]",
  sleep: "from-[#0f172a] via-[#1e1b4b] to-[#172554]",
  play: "from-[#d1fae5] via-[#a5f3fc] to-[#93c5fd]",
  clean: "from-[#ccfbf1] via-[#e0f2fe] to-[#f0fdfa]"
};

const distressedNursery = "from-slate-800 via-indigo-950 to-slate-900";

function SceneParticles({ scene }: { scene: SceneState }) {
  if (scene === "sleep") {
    return (
      <div className="pointer-events-none absolute inset-0">
        {Array.from({ length: 18 }).map((_, idx) => (
          <motion.span
            key={`star-${idx}`}
            className="absolute text-yellow-100/70"
            style={{ left: `${6 + idx * 5}%`, top: `${10 + (idx % 7) * 10}%` }}
            animate={{ opacity: [0.3, 1, 0.3], y: [0, -8, 0] }}
            transition={{ duration: 2 + (idx % 4), repeat: Infinity, ease: "easeInOut" }}
          >
            ✦
          </motion.span>
        ))}
      </div>
    );
  }

  if (scene === "clean") {
    return (
      <div className="pointer-events-none absolute inset-0">
        {Array.from({ length: 12 }).map((_, idx) => (
          <motion.span
            key={`bubble-${idx}`}
            className="absolute rounded-full bg-white/60"
            style={{
              left: `${8 + idx * 7}%`,
              bottom: `${5 + (idx % 5) * 8}%`,
              width: `${8 + (idx % 4) * 6}px`,
              height: `${8 + (idx % 4) * 6}px`
            }}
            animate={{ y: [-4, -26, -4], opacity: [0.2, 0.9, 0.2] }}
            transition={{ duration: 2.6 + (idx % 3), repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </div>
    );
  }

  return null;
}

function MoodParticles({ mood }: { mood: PetMood }) {
  if (mood === "sick") {
    return (
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {Array.from({ length: 14 }).map((_, idx) => (
          <motion.div
            key={`smoke-${idx}`}
            className="absolute rounded-full bg-emerald-500/35 blur-md"
            style={{
              left: `${(idx * 13) % 100}%`,
              bottom: `${-10 + (idx % 4) * 8}%`,
              width: `${24 + (idx % 5) * 12}px`,
              height: `${24 + (idx % 5) * 12}px`
            }}
            animate={{ y: [-10, -120], opacity: [0.4, 0], scale: [1, 1.4] }}
            transition={{ duration: 2.2 + (idx % 3) * 0.2, repeat: Infinity, ease: "easeOut", delay: idx * 0.15 }}
          />
        ))}
      </div>
    );
  }

  if (mood === "blissful") {
    return (
      <div className="pointer-events-none absolute inset-0">
        {Array.from({ length: 20 }).map((_, idx) => (
          <motion.span
            key={`sparkle-${idx}`}
            className="absolute text-amber-200/90"
            style={{ left: `${5 + (idx * 17) % 90}%`, top: `${8 + (idx * 11) % 70}%` }}
            animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 1.4 + (idx % 4) * 0.2, repeat: Infinity, ease: "easeInOut" }}
          >
            ✦
          </motion.span>
        ))}
      </div>
    );
  }

  return null;
}

function resolveSceneClass(scene: SceneState, mood: PetMood): string {
  if (scene === "nursery" && mood === "distressed") {
    return distressedNursery;
  }
  return sceneGradients[scene];
}

export function sceneDisplayName(scene: SceneState): string {
  const names: Record<SceneState, string> = {
    nursery: "Nursery",
    feed: "Meal",
    sleep: "Sleep",
    play: "Play",
    clean: "Clean"
  };
  return names[scene];
}

export function SceneBackground({
  currentScene,
  mood,
  isSick = false
}: {
  currentScene: SceneState;
  mood: PetMood;
  isSick?: boolean;
}) {
  const gradientKey = `${currentScene}-${mood === "distressed" && currentScene === "nursery" ? "d" : "n"}`;

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={gradientKey}
          className={`absolute inset-0 bg-gradient-to-b ${resolveSceneClass(currentScene, mood)}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: "easeInOut" }}
        />
      </AnimatePresence>
      {currentScene === "nursery" && mood !== "distressed" && (
        <div className="absolute inset-0">
          <Image src="/assets/nursery_background.png" alt="" fill priority className="object-cover opacity-95" />
        </div>
      )}
      {currentScene === "feed" && (
        <div className="absolute inset-0">
          <Image src="/assets/nursery_background.png" alt="" fill className="object-cover opacity-60" />
        </div>
      )}
      {currentScene === "sleep" && (
        <div className="absolute inset-0">
          <Image src="/assets/bed_background.png" alt="" fill className="object-cover opacity-70" />
        </div>
      )}
      {currentScene === "play" && (
        <div className="absolute inset-0">
          <Image src="/assets/nursery_background.png" alt="" fill className="object-cover opacity-72" />
        </div>
      )}
      {currentScene === "clean" && (
        <div className="absolute inset-0">
          <Image src="/assets/bath_background.png" alt="" fill className="object-cover opacity-72" />
        </div>
      )}
      {currentScene === "nursery" && mood !== "distressed" && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-fuchsia-300/20"
          animate={{ opacity: [0.4, 0.65, 0.4] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
      {isSick && (
        <motion.div
          className="absolute inset-0 shadow-[inset_0_0_140px_rgba(220,38,38,0.32)]"
          animate={{ opacity: [0.2, 0.42, 0.2] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
      <SceneParticles scene={currentScene} />
      <MoodParticles mood={mood} />
    </div>
  );
}
