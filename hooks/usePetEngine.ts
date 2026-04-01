"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { initialPetState, PET_STORAGE_KEY, type EggType, type PetState, type PetStage } from "@/lib/game";
import { loadGameState, saveGameState, applyOfflineDecay } from "@/lib/persistence";
import {
  applyDecayForMinutes,
  calculateEvolution,
  clampStat,
  deriveMood,
  getCrossedXpMilestones
} from "@/lib/petMath";
import { isSupabaseConfigured } from "@/lib/supabase";

type StoredPayload = {
  pet: PetState;
  lastSyncAt: number;
};

function normalizePet(partial: PetState): PetState {
  const base: PetState = {
    name: partial.name ?? "Bia",
    hunger: partial.hunger ?? 100,
    energy: partial.energy ?? 100,
    joy: partial.joy ?? 100,
    hygiene: partial.hygiene ?? 100,
    xp: partial.xp ?? 0,
    status: partial.status ?? "happy",
    stage: partial.stage ?? "egg",
    eggType: partial.eggType ?? "pink"
  };
  return withSyncedStatus(base);
}

function loadStored(): StoredPayload | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = localStorage.getItem(PET_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as StoredPayload;
  } catch {
    return null;
  }
}

function saveStored(pet: PetState, lastSyncAt: number) {
  if (typeof window === "undefined") {
    return;
  }

  const payload: StoredPayload = { pet, lastSyncAt };
  localStorage.setItem(PET_STORAGE_KEY, JSON.stringify(payload));
}

export function calculateOfflineProgress(pet: PetState, lastSyncAt: number, now: number): PetState {
  const elapsedMs = Math.max(0, now - lastSyncAt);
  const minutes = elapsedMs / 60_000;
  return applyDecayForMinutes(pet, minutes);
}

function withSyncedStatus(p: PetState): PetState {
  return { ...p, status: deriveMood(p) };
}

function withEvolution(p: PetState): PetState {
  const stage = calculateEvolution(p.xp, p.stage);
  return { ...p, stage };
}

function hasSicknessState(p: Pick<PetState, "hunger" | "energy" | "joy" | "hygiene" | "status">): boolean {
  const zeroCount = [p.hunger, p.energy, p.joy, p.hygiene].filter((value) => value <= 0).length;
  return zeroCount >= 2 || p.status === "sick";
}

export type UsePetEngineOptions = {
  onEvolution?: (from: PetStage, to: PetStage) => void;
  onXpMilestone?: (milestone: 50 | 250 | 750) => void;
};

export function usePetEngine(options: UsePetEngineOptions = {}) {
  const { onEvolution, onXpMilestone } = options;

  const [pet, setPet] = useState<PetState>(() => withSyncedStatus(initialPetState));
  const [isReady, setIsReady] = useState(false);
  const [needsEggChoice, setNeedsEggChoice] = useState(false);
  const petRef = useRef(pet);

  useEffect(() => {
    petRef.current = pet;
  }, [pet]);

  /** Hydrate from localStorage + offline decay once on mount. */
  useEffect(() => {
    let cancelled = false;

    const hydrate = async () => {
      const stored = loadStored();
      const now = Date.now();
      const remote = await loadGameState();

      if (cancelled) {
        return;
      }

      if (remote) {
        const offlinePet = applyOfflineDecay(normalizePet(remote.pet), remote.lastUpdatedAt, now);
        const synced = withSyncedStatus(withEvolution(offlinePet));
        setPet(synced);
        saveStored(synced, now);
        setNeedsEggChoice(false);
        setIsReady(true);
        return;
      }

      if (stored) {
        const offlinePet = calculateOfflineProgress(normalizePet(stored.pet), stored.lastSyncAt, now);
        const synced = withSyncedStatus(withEvolution(offlinePet));
        setPet(synced);
        saveStored(synced, now);
        setNeedsEggChoice(false);
        setIsReady(true);
        return;
      }

      const fresh = withSyncedStatus(initialPetState);
      setPet(fresh);
      setNeedsEggChoice(true);
      setIsReady(true);
      if (!isSupabaseConfigured()) {
        saveStored(fresh, now);
      }
    };

    void hydrate();

    return () => {
      cancelled = true;
    };
  }, []);

  const currentMood = useMemo(() => deriveMood(pet), [pet]);
  const isSick = useMemo(() => hasSicknessState({ ...pet, status: currentMood }), [pet, currentMood]);

  const tickDecay = useCallback(() => {
    setPet((prev) => {
      const decayed = applyDecayForMinutes(prev, 1);
      const evolved = withEvolution(decayed);
      const synced = withSyncedStatus(evolved);
      saveStored(synced, Date.now());
      return synced;
    });
  }, []);

  const applyStatDelta = useCallback(
    (updates: Partial<Pick<PetState, "hunger" | "energy" | "joy" | "hygiene">>, xpGain = 0) => {
      setPet((prev) => {
        const prevXp = prev.xp;
        const next: PetState = { ...prev };

        (["hunger", "energy", "joy", "hygiene"] as const).forEach((key) => {
          const delta = updates[key];
          if (delta !== undefined) {
            next[key] = clampStat(next[key] + delta);
          }
        });

        if (xpGain !== 0) {
          next.xp = Math.max(0, next.xp + xpGain);
        }

        const prevStage = prev.stage;
        const evolved = withEvolution(next);

        if (evolved.stage !== prevStage) {
          onEvolution?.(prevStage, evolved.stage);
        }

        const milestones = getCrossedXpMilestones(prevXp, evolved.xp);
        milestones.forEach((idx) => {
          const m = [50, 250, 750][idx] as 50 | 250 | 750;
          onXpMilestone?.(m);
        });

        const synced = withSyncedStatus(evolved);
        saveStored(synced, Date.now());
        return synced;
      });
    },
    [onEvolution, onXpMilestone]
  );

  const setStage = useCallback(
    (stage: PetStage, xpFloor?: number, options?: { silent?: boolean }) => {
      setPet((prev) => {
        const prevStage = prev.stage;
        const next = {
          ...prev,
          stage,
          xp: xpFloor !== undefined ? Math.max(prev.xp, xpFloor) : prev.xp
        };
        const evolved = withEvolution(next);
        if (!options?.silent && evolved.stage !== prevStage) {
          onEvolution?.(prevStage, evolved.stage);
        }
        const synced = withSyncedStatus(evolved);
        saveStored(synced, Date.now());
        return synced;
      });
    },
    [onEvolution]
  );

  useEffect(() => {
    if (!isReady || needsEggChoice) {
      return;
    }

    const timer = window.setInterval(() => {
      void saveGameState(petRef.current);
    }, 30_000);

    return () => window.clearInterval(timer);
  }, [isReady, needsEggChoice]);

  const createPet = useCallback(async (eggType: EggType) => {
    const next = withSyncedStatus({
      ...initialPetState,
      eggType
    });

    setPet(next);
    setNeedsEggChoice(false);
    setIsReady(true);
    saveStored(next, Date.now());
    await saveGameState(next);
  }, []);

  const renamePet = useCallback(async (name: string) => {
    const trimmed = name.trim().slice(0, 24);
    if (!trimmed) {
      return;
    }

    let renamed: PetState | null = null;
    setPet((prev) => {
      const next = withSyncedStatus({
        ...prev,
        name: trimmed
      });
      renamed = next;
      saveStored(next, Date.now());
      return next;
    });

    if (renamed) {
      await saveGameState(renamed);
    }
  }, []);

  const healPet = useCallback(async () => {
    let healed: PetState | null = null;

    setPet((prev) => {
      const next: PetState = {
        ...prev,
        hunger: 50,
        energy: 50,
        joy: 50,
        hygiene: 50,
        xp: prev.xp + 15
      };
      const synced = withSyncedStatus(withEvolution(next));
      healed = synced;
      saveStored(synced, Date.now());
      return synced;
    });

    if (healed) {
      await saveGameState(healed);
    }
  }, []);

  return {
    pet,
    isReady,
    needsEggChoice,
    currentMood,
    isSick,
    tickDecay,
    applyStatDelta,
    setStage,
    createPet,
    healPet,
    renamePet
  };
}
