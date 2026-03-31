import type { PetMood, PetStage, PetState } from "@/lib/game";

/** Decay per real-time minute (applied each game tick = 60s = 1 minute). */
export const DECAY_PER_MINUTE = {
  hunger: 1,
  energy: 1,
  joy: 0.75,
  hygiene: 0.75
} as const;

export const XP_MILESTONES = [50, 250, 750] as const;

export function clampStat(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value * 10) / 10));
}

/**
 * Priority: sick → distressed → blissful → happy.
 */
export function deriveMood(stats: Pick<PetState, "hunger" | "energy" | "joy" | "hygiene">): PetMood {
  const { hunger, energy, joy, hygiene } = stats;

  if (hunger < 10 && energy < 10 && joy < 10 && hygiene < 10) {
    return "sick";
  }

  if (hunger < 20 || energy < 20 || joy < 20 || hygiene < 20) {
    return "distressed";
  }

  if (joy > 80 && hunger > 80) {
    return "blissful";
  }

  return "happy";
}

export function calculateEvolution(xp: number, currentStage: PetStage): PetStage {
  if (currentStage === "egg") {
    return "egg";
  }

  if (xp >= 250) {
    return "adult";
  }

  if (xp >= 50) {
    return "teen";
  }

  return "baby";
}

/**
 * Returns milestone indices (0,1,2) newly crossed when going from prevXp → nextXp.
 */
export function getCrossedXpMilestones(prevXp: number, nextXp: number): number[] {
  const crossed: number[] = [];
  XP_MILESTONES.forEach((m, i) => {
    if (prevXp < m && nextXp >= m) {
      crossed.push(i);
    }
  });
  return crossed;
}

export function applyDecayForMinutes(state: PetState, minutes: number): PetState {
  if (minutes <= 0) {
    return state;
  }

  const next: PetState = {
    ...state,
    hunger: clampStat(state.hunger - minutes * DECAY_PER_MINUTE.hunger),
    energy: clampStat(state.energy - minutes * DECAY_PER_MINUTE.energy),
    joy: clampStat(state.joy - minutes * DECAY_PER_MINUTE.joy),
    hygiene: clampStat(state.hygiene - minutes * DECAY_PER_MINUTE.hygiene)
  };

  next.status = deriveMood(next);
  return next;
}
