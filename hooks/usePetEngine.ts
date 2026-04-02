"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { initialPetState, PET_STORAGE_KEY, type EggType, type PetState, type PetStage } from "@/lib/game";
import { loadGameState, saveGameState, applyOfflineDecay } from "@/lib/persistence";
import {
  applyDecayForMinutesScaled,
  applyOfflineCatchUp,
  BACKGROUND_DECAY_SCALE,
  calculateEvolution,
  clampStat,
  deriveMood,
  FOREGROUND_DECAY_SCALE,
  getCrossedXpMilestones
} from "@/lib/petMath";
import { isSupabaseConfigured } from "@/lib/supabase";

type StoredPayload = {
  pet: PetState;
  /** Wall-clock ms when the pet state was last persisted (delta-time anchor). */
  lastSeenAt: number;
  /** @deprecated Legacy key — migrated to lastSeenAt on read. */
  lastSyncAt?: number;
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
    const parsed = JSON.parse(raw) as StoredPayload;
    const lastSeenAt =
      typeof parsed.lastSeenAt === "number" && Number.isFinite(parsed.lastSeenAt)
        ? parsed.lastSeenAt
        : typeof parsed.lastSyncAt === "number" && Number.isFinite(parsed.lastSyncAt)
          ? parsed.lastSyncAt
          : Date.now();
    return { pet: parsed.pet, lastSeenAt };
  } catch {
    return null;
  }
}

function saveStored(pet: PetState, lastSeenAt: number) {
  if (typeof window === "undefined") {
    return;
  }

  const payload: StoredPayload = { pet, lastSeenAt };
  localStorage.setItem(PET_STORAGE_KEY, JSON.stringify(payload));
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
  onXpMilestone?: (milestone: 1500 | 5000 | 12000) => void;
};

/** Wall-clock absence before we treat return as a "welcome back" reunion (not just low bars). */
export const WELCOME_BACK_MIN_ABSENCE_MS = 4 * 60 * 60 * 1000;

export function usePetEngine(options: UsePetEngineOptions = {}) {
  const { onEvolution, onXpMilestone } = options;

  const [pet, setPet] = useState<PetState>(() => withSyncedStatus(initialPetState));
  const [isReady, setIsReady] = useState(false);
  const [needsEggChoice, setNeedsEggChoice] = useState(false);
  const [welcomeBackAbsentMs, setWelcomeBackAbsentMs] = useState<number | null>(null);
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

      let welcomeAbsence: number | null = null;

      if (remote) {
        const lastRemoteMs = new Date(remote.lastUpdatedAt).getTime();
        const elapsedRemote = Number.isFinite(lastRemoteMs) ? Math.max(0, now - lastRemoteMs) : 0;
        if (elapsedRemote >= WELCOME_BACK_MIN_ABSENCE_MS) {
          welcomeAbsence = elapsedRemote;
        }
        const offlinePet = applyOfflineDecay(normalizePet(remote.pet), remote.lastUpdatedAt, now);
        const synced = withSyncedStatus(withEvolution(offlinePet));
        setPet(synced);
        saveStored(synced, now);
        setNeedsEggChoice(false);
        setWelcomeBackAbsentMs(welcomeAbsence);
        setIsReady(true);
        return;
      }

      if (stored) {
        const elapsedMs = Math.max(0, now - stored.lastSeenAt);
        if (elapsedMs >= WELCOME_BACK_MIN_ABSENCE_MS) {
          welcomeAbsence = elapsedMs;
        }
        const offlinePet = applyOfflineCatchUp(normalizePet(stored.pet), elapsedMs);
        const synced = withSyncedStatus(withEvolution(offlinePet));
        setPet(synced);
        saveStored(synced, now);
        setNeedsEggChoice(false);
        setWelcomeBackAbsentMs(welcomeAbsence);
        setIsReady(true);
        return;
      }

      const fresh = withSyncedStatus(initialPetState);
      setPet(fresh);
      setNeedsEggChoice(true);
      setWelcomeBackAbsentMs(null);
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

  /** When `foreground` is true, stats drop faster (player is engaged). When false, minimal decay. */
  const clearWelcomeBack = useCallback(() => {
    setWelcomeBackAbsentMs(null);
  }, []);

  const tickDecay = useCallback((foreground: boolean) => {
    const scale = foreground ? FOREGROUND_DECAY_SCALE : BACKGROUND_DECAY_SCALE;
    setPet((prev) => {
      const decayed = applyDecayForMinutesScaled(prev, 1, scale);
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
          const m = [1500, 5000, 12000][idx] as 1500 | 5000 | 12000;
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

  /** Persist last_seen_timestamp when the tab hides or unloads (no background game loop). */
  useEffect(() => {
    if (!isReady) {
      return;
    }

    const flushLastSeen = () => {
      saveStored(petRef.current, Date.now());
      void saveGameState(petRef.current);
    };

    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        flushLastSeen();
      }
    };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", flushLastSeen);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", flushLastSeen);
    };
  }, [isReady]);

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
    welcomeBackAbsentMs,
    clearWelcomeBack,
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
