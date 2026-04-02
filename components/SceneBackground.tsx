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

function resolveSceneClass(scene: SceneState): string {
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
  const gradientKey = currentScene;

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <AnimatePresence mode="sync">
        <motion.div
          key={gradientKey}
          className={`absolute inset-0 bg-gradient-to-b ${resolveSceneClass(currentScene)}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        />
      </AnimatePresence>
      <AnimatePresence mode="sync">
        {currentScene === "nursery" && (
          <motion.div
            key="scene-nursery"
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.02, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 1.015, filter: "blur(8px)" }}
            transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
          >
            <Image
              src="/assets/idle.png"
              alt=""
              fill
              priority
              unoptimized
              className="object-cover object-[center_38%] opacity-95 sm:object-center"
            />
          </motion.div>
        )}
        {currentScene === "feed" && (
          <motion.div
            key="scene-feed"
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.03, filter: "blur(12px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 1.02, filter: "blur(10px)" }}
            transition={{ duration: 1.05, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.22),transparent_34%),linear-gradient(180deg,rgba(255,240,245,0.72),rgba(236,233,255,0.78)_36%,rgba(220,228,255,0.82))]" />
            <motion.div
              className="absolute inset-x-0 top-[6%] mx-auto w-full max-w-6xl px-3 sm:top-[7%] sm:px-6"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.985 }}
              transition={{ duration: 1.05, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="overflow-hidden rounded-[2rem] border border-white/30 bg-white/12 shadow-[0_24px_70px_rgba(55,45,95,0.18)]">
                <Image
                  src="/assets/kitchen.png"
                  alt=""
                  width={1600}
                  height={820}
                  unoptimized
                  className="h-auto w-full object-cover"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
        {currentScene === "sleep" && (
          <motion.div
            key="scene-sleep"
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.02, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 1.015, filter: "blur(8px)" }}
            transition={{ duration: 1.05, ease: [0.22, 1, 0.36, 1] }}
          >
            <Image
              src="/assets/bed_background.png"
              alt=""
              fill
              unoptimized
              className="object-cover object-[center_36%] opacity-70 sm:object-center"
            />
          </motion.div>
        )}
        {currentScene === "play" && (
          <motion.div
            key="scene-play"
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.02, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 1.015, filter: "blur(8px)" }}
            transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
          >
            <Image
              src="/assets/nursery_background.png"
              alt=""
              fill
              unoptimized
              className="object-cover object-[center_38%] opacity-72 sm:object-center"
            />
          </motion.div>
        )}
        {currentScene === "clean" && (
          <motion.div
            key="scene-clean"
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.02, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 1.015, filter: "blur(8px)" }}
            transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
          >
            <Image
              src="/assets/bath_background.png"
              alt=""
              fill
              unoptimized
              className="object-cover object-[center_36%] opacity-72 sm:object-center"
            />
          </motion.div>
        )}
      </AnimatePresence>
      {currentScene === "nursery" && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-fuchsia-300/20"
          animate={{ opacity: [0.4, 0.65, 0.4] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
      {currentScene === "nursery" && mood === "distressed" && (
        <motion.div
          className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(49,46,129,0.16),transparent_38%),linear-gradient(180deg,rgba(15,23,42,0.18),rgba(49,46,129,0.26))]"
          animate={{ opacity: [0.55, 0.72, 0.55] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
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
