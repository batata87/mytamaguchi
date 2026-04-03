"use client";

import type { PetMood } from "@/lib/game";

/** Legacy type — activity no longer swaps full scenes (single calm room). */
export type SceneState = "nursery" | "feed" | "sleep" | "play" | "clean";

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

/** One calm gradient room — no activity image layers or heavy glow stacks. */
export function SceneBackground({
  mood,
  isSick = false,
  roomDecorEmoji
}: {
  currentScene?: SceneState;
  mood: PetMood;
  isSick?: boolean;
  roomDecorEmoji?: string | null;
}) {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#E8E2FF] via-[#E4DCFB] to-[#DDD6F8]" />
      {mood === "distressed" && (
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(49,46,129,0.12),rgba(30,27,75,0.08))]" />
      )}
      {isSick && (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,transparent_0%,rgba(220,38,38,0.08)_100%)]" />
      )}
      {roomDecorEmoji ? (
        <div
          className="pointer-events-none absolute bottom-[11%] left-[6%] z-[2] text-[2.75rem] sm:bottom-[14%] sm:left-[8%] sm:text-[3.25rem]"
          aria-hidden
        >
          {roomDecorEmoji}
        </div>
      ) : null}
    </div>
  );
}
