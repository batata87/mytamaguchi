import type { PetStage } from "@/lib/game";

/** Player-facing names (code still uses baby | teen | adult). */
export const STAGE_LABEL: Record<PetStage, string> = {
  egg: "Egg",
  baby: "Baby",
  teen: "Mid",
  adult: "Grown"
};

/** XP thresholds: hatch floors at 30; evolve baby→mid @50, mid→grown @250; optional mastery to 750. */
export const XP_HATCH_FLOOR = 30;
export const XP_BABY_TO_MID = 50;
export const XP_MID_TO_GROWN = 250;
export const XP_MASTERY_CAP = 750;

export type GrowthSegment = {
  title: string;
  detail: string;
  barPct: number;
  showBar: boolean;
};

/**
 * Progress within the current life stage (activities + time decay affect XP over sessions).
 */
export function getGrowthSegment(xp: number, stage: PetStage): GrowthSegment {
  if (stage === "egg") {
    return {
      title: "Ready to hatch",
      detail: "Pet the egg — then Bia Sync grows with care.",
      barPct: 0,
      showBar: false
    };
  }

  if (stage === "baby") {
    const start = XP_HATCH_FLOOR;
    const end = XP_BABY_TO_MID;
    const clampedXp = Math.max(start, Math.min(xp, end));
    const barPct = Math.min(100, Math.max(0, ((clampedXp - start) / (end - start)) * 100));
    const need = Math.max(0, end - xp);
    return {
      title: "Growing toward Mid",
      detail: need > 0 ? `${need} Bia Sync until Mid` : "Evolving…",
      barPct,
      showBar: true
    };
  }

  if (stage === "teen") {
    const start = XP_BABY_TO_MID;
    const end = XP_MID_TO_GROWN;
    const clampedXp = Math.max(start, Math.min(xp, end));
    const barPct = Math.min(100, Math.max(0, ((clampedXp - start) / (end - start)) * 100));
    const need = Math.max(0, end - xp);
    return {
      title: "Growing toward Grown",
      detail: need > 0 ? `${need} Bia Sync until Grown` : "Evolving…",
      barPct,
      showBar: true
    };
  }

  const start = XP_MID_TO_GROWN;
  const end = XP_MASTERY_CAP;
  if (xp < end) {
    const clampedXp = Math.max(start, Math.min(xp, end));
    const barPct = Math.min(100, Math.max(0, ((clampedXp - start) / (end - start)) * 100));
    const need = Math.max(0, end - xp);
    return {
      title: "Bia bond",
      detail: need > 0 ? `${need} XP to peak bond` : "Peak bond",
      barPct,
      showBar: true
    };
  }

  return {
    title: "Peak bond",
    detail: "Your companion is fully grown.",
    barPct: 100,
    showBar: true
  };
}

export const JOURNEY_STAGES: Array<{ id: PetStage; label: string }> = [
  { id: "egg", label: "Egg" },
  { id: "baby", label: "Baby" },
  { id: "teen", label: "Mid" },
  { id: "adult", label: "Grown" }
];

export function journeyStepIndex(stage: PetStage): number {
  return JOURNEY_STAGES.findIndex((s) => s.id === stage);
}
