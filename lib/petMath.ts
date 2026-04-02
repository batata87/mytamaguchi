import type { PetMood, PetStage, PetState } from "@/lib/game";

/** Decay per real-time minute (applied each game tick = 60s = 1 minute). */
export const DECAY_PER_MINUTE = {
  hunger: 1,
  energy: 1,
  joy: 0.75,
  hygiene: 0.75
} as const;

export const XP_MILESTONES = [1500, 5000, 12000] as const;

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

  if (xp >= 5000) {
    return "adult";
  }

  if (xp >= 1500) {
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

/** Foreground session: faster biological rhythm (player has things to do now). */
export const FOREGROUND_DECAY_SCALE = 2.4;

/**
 * Passive mode: app closed or tab in background — 20% of base decay rate so the pet
 * still "exists" but won't collapse before the player wonders about them.
 */
export const PASSIVE_DECAY_SCALE = 0.2;

/** Same as passive — background tab uses biological buffer, not a full pause. */
export const BACKGROUND_DECAY_SCALE = PASSIVE_DECAY_SCALE;

export function applyDecayForMinutes(state: PetState, minutes: number): PetState {
  return applyDecayForMinutesScaled(state, minutes, 1);
}

export function applyDecayForMinutesScaled(state: PetState, minutes: number, scale: number): PetState {
  if (minutes <= 0 || scale <= 0) {
    return state;
  }

  const next: PetState = {
    ...state,
    hunger: clampStat(state.hunger - minutes * DECAY_PER_MINUTE.hunger * scale),
    energy: clampStat(state.energy - minutes * DECAY_PER_MINUTE.energy * scale),
    joy: clampStat(state.joy - minutes * DECAY_PER_MINUTE.joy * scale),
    hygiene: clampStat(state.hygiene - minutes * DECAY_PER_MINUTE.hygiene * scale)
  };

  next.status = deriveMood(next);
  return next;
}

/** While the app is closed, stats never decay below this floor (mercy / no "dead pet" on wake). */
export const OFFLINE_CRITICAL_FLOOR = 10;

function applyOfflineSafetyClamp(pet: PetState): PetState {
  const floor = OFFLINE_CRITICAL_FLOOR;
  const next: PetState = {
    ...pet,
    hunger: Math.max(floor, Math.min(100, pet.hunger)),
    energy: Math.max(floor, Math.min(100, pet.energy)),
    joy: Math.max(floor, Math.min(100, pet.joy)),
    hygiene: Math.max(floor, Math.min(100, pet.hygiene))
  };
  next.status = deriveMood(next);
  return next;
}

/**
 * Delta-time catch-up when the app was not running: decay by `DECAY_PER_MINUTE` × minutes elapsed,
 * then clamp so offline time alone cannot push any stat below {@link OFFLINE_CRITICAL_FLOOR}.
 */
export function applyOfflineCatchUp(state: PetState, elapsedMs: number): PetState {
  const elapsedMsSafe = Math.max(0, elapsedMs);
  if (elapsedMsSafe <= 0) {
    return state;
  }
  const minutes = elapsedMsSafe / 60_000;
  const decayed = applyDecayForMinutesScaled(state, minutes, PASSIVE_DECAY_SCALE);
  return applyOfflineSafetyClamp(decayed);
}

/** Wall-clock ms until hunger reaches `thresholdPercent` at passive decay (if above threshold). */
export function wallClockMsUntilHungerAtOrBelow(currentHunger: number, thresholdPercent: number): number | null {
  if (currentHunger <= thresholdPercent) {
    return null;
  }
  const perMinute = DECAY_PER_MINUTE.hunger * PASSIVE_DECAY_SCALE;
  if (perMinute <= 0) {
    return null;
  }
  const minutes = (currentHunger - thresholdPercent) / perMinute;
  const ms = minutes * 60_000;
  if (!Number.isFinite(ms) || ms <= 0) {
    return null;
  }
  return Math.min(ms, 24 * 60 * 60_000);
}
