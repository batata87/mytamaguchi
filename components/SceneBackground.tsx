"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { PetMood } from "@/lib/game";

/** Cinematic habitat scenes — background cross-fades on activity. */
export type SceneState = "nursery" | "feed" | "sleep" | "play" | "clean";

const sceneGradients: Record<SceneState, string> = {
  nursery: "from-[#EAE1FF] via-[#E5DBFF] to-[#DCCCF8]",
  feed: "from-[#FFE7F1] via-[#F8E9FF] to-[#E2D2FF]",
  sleep: "from-[#0D1734] via-[#1A2558] to-[#101A3F]",
  play: "from-[#CFF9EF] via-[#B8F3FF] to-[#C7E4FF]",
  clean: "from-[#D6FCF6] via-[#E4F7FF] to-[#F4FCFF]"
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

const sceneAtmosphereClass: Record<SceneState, string> = {
  nursery:
    "bg-[radial-gradient(circle_at_50%_28%,rgba(255,255,255,0.34)_0%,rgba(255,255,255,0.1)_34%,rgba(186,162,255,0.08)_64%,transparent_100%)]",
  feed:
    "bg-[radial-gradient(circle_at_62%_24%,rgba(255,235,244,0.52)_0%,rgba(255,215,235,0.24)_30%,rgba(213,180,255,0.16)_58%,transparent_100%)]",
  sleep:
    "bg-[radial-gradient(circle_at_48%_18%,rgba(198,216,255,0.18)_0%,rgba(95,105,175,0.18)_32%,rgba(6,11,36,0.62)_82%,rgba(5,9,29,0.74)_100%)]",
  play:
    "bg-[radial-gradient(circle_at_35%_24%,rgba(229,255,246,0.4)_0%,rgba(166,243,255,0.22)_32%,rgba(126,190,255,0.16)_62%,transparent_100%)]",
  clean:
    "bg-[radial-gradient(circle_at_52%_22%,rgba(255,255,255,0.44)_0%,rgba(207,250,254,0.24)_32%,rgba(168,236,255,0.14)_60%,transparent_100%)]"
};

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
  isSick = false,
  roomDecorEmoji
}: {
  currentScene: SceneState;
  mood: PetMood;
  isSick?: boolean;
  /** Boutique room decor — preview or equipped. */
  roomDecorEmoji?: string | null;
}) {
  const sceneEase = [0.22, 1, 0.36, 1] as const;
  const sceneDuration = 0.9;

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <AnimatePresence mode="sync">
        <motion.div
          key={`gradient-${currentScene}`}
          className={`absolute inset-0 bg-gradient-to-b ${sceneGradients[currentScene]}`}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.985 }}
          transition={{ duration: sceneDuration, ease: sceneEase }}
        />
      </AnimatePresence>
      <AnimatePresence mode="sync">
        <motion.div
          key={`atmosphere-${currentScene}`}
          className={`absolute inset-0 ${sceneAtmosphereClass[currentScene]}`}
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: sceneDuration, ease: sceneEase }}
        />
      </AnimatePresence>
      <motion.div
        className="absolute inset-0"
        animate={{
          background:
            currentScene === "sleep"
              ? "radial-gradient(circle_at_50%_25%, rgba(180,196,255,0.14), transparent 48%), linear-gradient(180deg, rgba(13,23,52,0.28), rgba(6,11,36,0.42))"
              : currentScene === "feed"
                ? "radial-gradient(circle_at_62%_28%, rgba(255,205,232,0.2), transparent 45%), linear-gradient(180deg, rgba(255,255,255,0.08), rgba(128,90,213,0.12))"
                : currentScene === "play"
                  ? "radial-gradient(circle_at_36%_26%, rgba(186,255,237,0.22), transparent 48%), linear-gradient(180deg, rgba(34,211,238,0.08), rgba(59,130,246,0.12))"
                  : currentScene === "clean"
                    ? "radial-gradient(circle_at_50%_24%, rgba(255,255,255,0.26), transparent 50%), linear-gradient(180deg, rgba(6,182,212,0.06), rgba(14,165,233,0.1))"
                    : "radial-gradient(circle_at_50%_26%, rgba(255,255,255,0.2), transparent 48%), linear-gradient(180deg, rgba(255,255,255,0.04), rgba(167,139,250,0.1))"
        }}
        transition={{ duration: 1.2, ease: sceneEase }}
      />
      {currentScene === "nursery" ? (
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-white/22 via-transparent to-fuchsia-300/16"
          animate={{ opacity: [0.28, 0.44, 0.28] }}
          transition={{ duration: 8.5, repeat: Infinity, ease: "easeInOut" }}
        />
      ) : null}
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
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_58%,rgba(255,255,255,0.16)_0%,transparent_52%)]"
        animate={{ opacity: [0.45, 0.7, 0.45] }}
        transition={{ duration: 6.4, repeat: Infinity, ease: "easeInOut" }}
      />
      <SceneParticles scene={currentScene} />
      <MoodParticles mood={mood} />
      {roomDecorEmoji ? (
        <motion.div
          className="pointer-events-none absolute bottom-[11%] left-[6%] z-[2] text-[2.75rem] drop-shadow-[0_6px_18px_rgba(30,27,75,0.25)] sm:bottom-[14%] sm:left-[8%] sm:text-[3.25rem]"
          animate={{ y: [0, -5, 0], rotate: [-2, 2, -2] }}
          transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
          aria-hidden
        >
          {roomDecorEmoji}
        </motion.div>
      ) : null}
    </div>
  );
}
