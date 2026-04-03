"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, BellOff, BookHeart, ChevronDown, ChevronUp, ShoppingBag } from "lucide-react";
import { ChooseEggScreen } from "@/components/ChooseEggScreen";
import { NameCreatureScreen } from "@/components/NameCreatureScreen";
import { CreatureStage } from "@/components/CreatureStage";
import { GrowthJourney } from "@/components/GrowthJourney";
import { MoodAura } from "@/components/MoodAura";
import { Sidebar } from "@/components/Sidebar";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { MemoryBook } from "@/components/MemoryBook";
import { Boutique } from "@/components/Boutique";
import { StardustCounter } from "@/components/StardustCounter";
import { DAILY_LOGIN_STARDUST, HATCH_STARDUST_BONUS, StardustGuideModal } from "@/components/StardustGuideModal";
import { SceneBackground, type SceneState } from "@/components/SceneBackground";
import { triggerSchoolPrideBurst } from "@/lib/confetti";
import type { CareAction } from "@/lib/activitySubmenus";
import { randomCravingPick } from "@/lib/activitySubmenus";
import {
  careStyleLabel,
  deriveCareStyle,
  loadPlayerMeta,
  savePlayerMeta,
  todayYmd,
  type PlayerMeta
} from "@/lib/playerMeta";
import { playPetPurrHaptic } from "@/lib/haptics";
import { XP_HATCH_TARGET } from "@/lib/stageProgress";
import { useHungerNotification } from "@/hooks/useHungerNotification";
import { useInterval } from "@/hooks/useInterval";
import { useStore } from "@/hooks/useStore";
import { usePetEngine, WELCOME_BACK_MIN_ABSENCE_MS } from "@/hooks/usePetEngine";
import { findStoreItem, HUE_PRESET_CSS, localCalendarYmd } from "@/lib/storeCatalog";
import type { StoreItem } from "@/lib/storeTypes";

type StatKey = "hunger" | "energy" | "joy" | "hygiene";
type FeedbackType = "feed" | "sleep" | "play" | "clean" | "pet";
type HatchPhase = "idle" | "shake" | "flash";
type AnticipationState = "idle" | "dragging" | "near";
type ScreenFlashTone = "chromatic" | "cyan" | null;
type ActivityReaction = "feed" | "sleep" | "play" | "clean" | null;
type EggCycleMeta = { startedAt: number; readyAt: number; eggType: "pink" | "blue" | "gold" };
type HealCycleMeta = { startedAt: number; readyAt: number };

const EGG_CYCLE_STORAGE_KEY = "bia-egg-cycle-v1";
const HEAL_CYCLE_STORAGE_KEY = "bia-heal-cycle-v1";
const EGG_HATCH_DURATION_MS = 36 * 60 * 60 * 1000; // 1.5 days
const HEAL_DURATION_MS = 6 * 60 * 60 * 1000; // 6 hours

type Particle = {
  id: number;
  x: number;
  y: number;
  type: FeedbackType;
};

type BiaPulse = {
  id: number;
};

type StardustFlight = {
  id: number;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
};

const biaPulse = {
  initial: { scale: 0.8, opacity: 0.6 },
  animate: { scale: 2.5, opacity: 0 },
  transition: { duration: 0.4, ease: "easeOut" }
} as const;

const statConfig: Array<{ key: StatKey; label: string; color: string }> = [
  { key: "hunger", label: "Hunger", color: "bg-rose-400" },
  { key: "energy", label: "Energy", color: "bg-sky-400" },
  { key: "joy", label: "Joy", color: "bg-amber-400" },
  { key: "hygiene", label: "Hygiene", color: "bg-emerald-400" }
];

function formatRemaining(ms: number): string {
  const safe = Math.max(0, ms);
  const totalMinutes = Math.ceil(safe / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    const remHours = hours % 24;
    return `${days}d ${remHours}h`;
  }
  return `${hours}h ${mins}m`;
}

export function PetCard() {
  const onEvolution = useCallback(() => {
    void triggerSchoolPrideBurst();
  }, []);

  const onXpMilestone = useCallback(() => {
    void triggerSchoolPrideBurst();
  }, []);

  const {
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
    completeStarterNaming,
    healPet,
    renamePet
  } = usePetEngine({
    onEvolution,
    onXpMilestone
  });

  const [notifPerm, setNotifPerm] = useState<NotificationPermission>("default");

  useEffect(() => {
    if (typeof Notification !== "undefined") {
      setNotifPerm(Notification.permission);
    }
  }, []);

  const [hatchPhase, setHatchPhase] = useState<HatchPhase>("idle");
  const [currentScene, setCurrentScene] = useState<SceneState>("nursery");
  const [particles, setParticles] = useState<Particle[]>([]);
  const [pulses, setPulses] = useState<BiaPulse[]>([]);
  const [petJumpKey, setPetJumpKey] = useState(0);
  const [activeAction, setActiveAction] = useState<CareAction | null>(null);
  const [anticipationState, setAnticipationState] = useState<AnticipationState>("idle");
  const [flashedStat, setFlashedStat] = useState<StatKey | null>(null);
  const [inputsLocked, setInputsLocked] = useState(false);
  const [useDefaultBabyAsset, setUseDefaultBabyAsset] = useState(false);
  const [screenFlashTone, setScreenFlashTone] = useState<ScreenFlashTone>(null);
  const [healPulseKey, setHealPulseKey] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isPageVisible, setIsPageVisible] = useState(true);
  const [viewport, setViewport] = useState({ width: 390, height: 844 });
  const awaitingStarterName = isReady && hasStarted && !needsEggChoice && pet.hasChosenStarterName === false;
  const shouldHideMain =
    !isReady || !hasStarted || (hasStarted && needsEggChoice) || awaitingStarterName;

  useHungerNotification({
    pet,
    isReady,
    needsEggChoice: needsEggChoice || awaitingStarterName,
    notificationPermission: notifPerm
  });

  const [nowTick, setNowTick] = useState(() => Date.now());
  const [eggCycle, setEggCycle] = useState<EggCycleMeta | null>(null);
  const [healCycle, setHealCycle] = useState<HealCycleMeta | null>(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [activityReaction, setActivityReaction] = useState<ActivityReaction>(null);
  const creatureRef = useRef<HTMLDivElement>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);
  const heartbeatContextRef = useRef<AudioContext | null>(null);
  const heartbeatGainRef = useRef<GainNode | null>(null);
  const heartbeatTimerRef = useRef<number | null>(null);
  const activityReactionTimerRef = useRef<number | null>(null);
  const ambientAudioRef = useRef<HTMLAudioElement | null>(null);

  const [playerMeta, setPlayerMeta] = useState<PlayerMeta>(() => loadPlayerMeta());
  const [craving, setCraving] = useState<{
    action: CareAction;
    id: string;
    label: string;
    emoji: string;
    expiresAt: number;
  } | null>(null);
  const [happyDanceNonce, setHappyDanceNonce] = useState(0);
  const [memoryBookOpen, setMemoryBookOpen] = useState(false);
  const stardustCounterRef = useRef<HTMLDivElement>(null);
  const [boutiqueOpen, setBoutiqueOpen] = useState(false);
  const [stardustInfoOpen, setStardustInfoOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<StoreItem | null>(null);
  const [stardustPulseNonce, setStardustPulseNonce] = useState(0);
  const [stardustFlights, setStardustFlights] = useState<StardustFlight[]>([]);
  const boutiqueYmd = localCalendarYmd(new Date(nowTick));
  const { dailyItems, cosmicEgg, buyWithStardust, equipItem, openCosmicEgg } = useStore(
    playerMeta,
    setPlayerMeta,
    boutiqueYmd
  );
  type DailyToastPayload = { title: string; detail?: string };
  const [dailyToast, setDailyToast] = useState<DailyToastPayload | null>(null);
  const [reunionPlayKey, setReunionPlayKey] = useState(0);
  const [feedSquashNonce, setFeedSquashNonce] = useState(0);
  const [statsPanelOpen, setStatsPanelOpen] = useState(true);
  const [draggingPetTool, setDraggingPetTool] = useState(false);
  const reunionConsumedRef = useRef(false);
  const stageLockedActions: CareAction[] =
    pet.stage === "baby" ? ["play"] : pet.stage === "egg" ? ["feed", "sleep", "play", "clean"] : [];
  const sickLockedActions: CareAction[] = isSick ? ["feed", "sleep", "play"] : [];
  const lockedActions: CareAction[] = Array.from(new Set([...stageLockedActions, ...sickLockedActions]));
  const isActionLocked = useCallback((action: CareAction) => lockedActions.includes(action), [lockedActions]);

  useInterval(() => {
    const foreground = typeof document !== "undefined" && !document.hidden && isPageVisible;
    tickDecay(foreground);
  }, 60_000);

  /**
   * Welcome back (4h+ away): reunion animation + confetti, then daily login stardust when eligible.
   * Single effect avoids Strict Mode double-handshake between two effects.
   */
  useEffect(() => {
    if (!hasStarted || !isReady || needsEggChoice || awaitingStarterName) {
      return;
    }

    const shouldReunite =
      welcomeBackAbsentMs != null &&
      welcomeBackAbsentMs >= WELCOME_BACK_MIN_ABSENCE_MS &&
      !reunionConsumedRef.current;
    const reunited = shouldReunite;
    if (shouldReunite) {
      reunionConsumedRef.current = true;
      setReunionPlayKey((k) => k + 1);
      void triggerSchoolPrideBurst();
      clearWelcomeBack();
    }

    const meta = loadPlayerMeta();
    const today = todayYmd();

    if (meta.lastDailyGiftYmd === today) {
      if (reunited) {
        setDailyToast({ title: `Welcome back! ${pet.name} missed you ✨` });
        const t = window.setTimeout(() => setDailyToast(null), 8000);
        return () => window.clearTimeout(t);
      }
      return;
    }

    const next = { ...meta, lastDailyGiftYmd: today, stardust: meta.stardust + DAILY_LOGIN_STARDUST };
    savePlayerMeta(next);
    setPlayerMeta(next);
    setStardustPulseNonce((n) => n + 1);
    applyStatDelta({ joy: 6 }, 5);
    const stardustDetail =
      `Stardust is your check-in spark — it adds up in the Memory Book (heart icon). Collect it to celebrate coming back to ${pet.name}.`;
    setDailyToast(
      reunited
        ? {
            title: `Welcome back! +${DAILY_LOGIN_STARDUST} stardust added.`,
            detail: stardustDetail
          }
        : {
            title: `Daily login: +${DAILY_LOGIN_STARDUST} stardust`,
            detail: stardustDetail
          }
    );
    const t = window.setTimeout(() => setDailyToast(null), 8000);
    return () => window.clearTimeout(t);
  }, [hasStarted, isReady, needsEggChoice, awaitingStarterName, welcomeBackAbsentMs, clearWelcomeBack, applyStatDelta, pet.name]);

  useEffect(() => {
    if (!hasStarted || !isReady || pet.stage === "egg" || needsEggChoice) {
      return;
    }
    const id = window.setInterval(() => {
      setCraving((c) => {
        const now = Date.now();
        if (c && now < c.expiresAt) {
          return c;
        }
        const availableCravingActions = (["feed", "sleep", "play", "clean"] as CareAction[]).filter((action) => !isActionLocked(action));
        if (availableCravingActions.length === 0) {
          return null;
        }
        if (Math.random() < 0.28) {
          const pick = randomCravingPick(availableCravingActions);
          return { ...pick, expiresAt: now + 28_000 };
        }
        return null;
      });
    }, 24_000);
    return () => window.clearInterval(id);
  }, [hasStarted, isReady, pet.stage, needsEggChoice, isActionLocked]);

  useEffect(() => {
    if (!craving) {
      return;
    }
    if (isActionLocked(craving.action) || pet.stage === "egg") {
      setCraving(null);
    }
  }, [craving, isActionLocked, pet.stage]);

  useEffect(() => {
    if (!craving) {
      return;
    }
    const left = Math.max(0, craving.expiresAt - Date.now());
    const t = window.setTimeout(() => setCraving(null), left);
    return () => window.clearTimeout(t);
  }, [craving]);

  useEffect(() => {
    if (currentScene === "nursery") {
      return;
    }

    const timer = setTimeout(() => {
      setCurrentScene("nursery");
    }, 3_200);

    return () => clearTimeout(timer);
  }, [currentScene]);

  useEffect(() => {
    const updateViewport = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    };
    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const updateVisibility = () => {
      setIsPageVisible(!document.hidden);
    };

    updateVisibility();
    document.addEventListener("visibilitychange", updateVisibility);
    window.addEventListener("pagehide", updateVisibility);
    window.addEventListener("pageshow", updateVisibility);

    return () => {
      document.removeEventListener("visibilitychange", updateVisibility);
      window.removeEventListener("pagehide", updateVisibility);
      window.removeEventListener("pageshow", updateVisibility);
    };
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNowTick(Date.now());
    }, 30_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!isReady || needsEggChoice || pet.stage !== "egg") {
      return;
    }
    const now = Date.now();
    const raw = localStorage.getItem(EGG_CYCLE_STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as EggCycleMeta;
        if (parsed.eggType === pet.eggType) {
          setEggCycle(parsed);
          return;
        }
      } catch {
        // ignore broken local value
      }
    }
    const created: EggCycleMeta = { startedAt: now, readyAt: now + EGG_HATCH_DURATION_MS, eggType: pet.eggType };
    setEggCycle(created);
    localStorage.setItem(EGG_CYCLE_STORAGE_KEY, JSON.stringify(created));
  }, [isReady, needsEggChoice, pet.stage, pet.eggType]);

  useEffect(() => {
    if (!isReady || !isSick) {
      setHealCycle(null);
      return;
    }
    const raw = localStorage.getItem(HEAL_CYCLE_STORAGE_KEY);
    if (!raw) {
      return;
    }
    try {
      const parsed = JSON.parse(raw) as HealCycleMeta;
      setHealCycle(parsed);
    } catch {
      // ignore broken local value
    }
  }, [isReady, isSick]);

  useEffect(() => {
    if (!isRenaming) {
      setDraftName(pet.name);
    }
  }, [pet.name, isRenaming]);

  useEffect(() => {
    if (!isRenaming) {
      return;
    }
    renameInputRef.current?.focus();
    renameInputRef.current?.select();
  }, [isRenaming]);

  useEffect(() => {
    if (!hasStarted || !isSick || !isPageVisible) {
      if (heartbeatTimerRef.current) {
        window.clearInterval(heartbeatTimerRef.current);
        heartbeatTimerRef.current = null;
      }
      if (heartbeatGainRef.current) {
        heartbeatGainRef.current.gain.cancelScheduledValues(0);
        heartbeatGainRef.current.gain.value = 0;
      }
      return;
    }

    if (typeof window === "undefined") {
      return;
    }

    const AudioCtx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) {
      return;
    }

    if (!heartbeatContextRef.current) {
      heartbeatContextRef.current = new AudioCtx();
      heartbeatGainRef.current = heartbeatContextRef.current.createGain();
      heartbeatGainRef.current.gain.value = 0;
      heartbeatGainRef.current.connect(heartbeatContextRef.current.destination);
    }

    const ctx = heartbeatContextRef.current;
    const gain = heartbeatGainRef.current;
    if (!ctx || !gain) {
      return;
    }

    void ctx.resume();

    const playBeat = () => {
      const now = ctx.currentTime;
      [0, 0.28].forEach((offset) => {
        const osc = ctx.createOscillator();
        const beatGain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(offset === 0 ? 54 : 48, now + offset);
        beatGain.gain.setValueAtTime(0, now + offset);
        beatGain.gain.linearRampToValueAtTime(0.035, now + offset + 0.02);
        beatGain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.22);
        osc.connect(beatGain);
        beatGain.connect(gain);
        osc.start(now + offset);
        osc.stop(now + offset + 0.24);
      });
    };

    playBeat();
    heartbeatTimerRef.current = window.setInterval(playBeat, 1900);

    return () => {
      if (heartbeatTimerRef.current) {
        window.clearInterval(heartbeatTimerRef.current);
        heartbeatTimerRef.current = null;
      }
      gain.gain.cancelScheduledValues(ctx.currentTime);
      gain.gain.setValueAtTime(0, ctx.currentTime);
    };
  }, [hasStarted, isPageVisible, isSick]);

  const ensureAmbientMusic = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }
    if (!ambientAudioRef.current) {
      const audio = new Audio("/assets/Paper_Lantern_Orbits.mp3");
      audio.loop = true;
      audio.preload = "auto";
      audio.volume = 0.35;
      ambientAudioRef.current = audio;
    }
  }, []);

  useEffect(() => {
    ensureAmbientMusic();
    const audio = ambientAudioRef.current;
    if (!audio) {
      return;
    }

    if (!hasStarted || isSick || !isPageVisible) {
      audio.pause();
      return;
    }

    const maybePromise = audio.play();
    if (maybePromise && typeof maybePromise.catch === "function") {
      void maybePromise.catch(() => {
        // iOS may block autoplay until a user gesture; begin button also primes playback.
      });
    }
  }, [ensureAmbientMusic, hasStarted, isPageVisible, isSick]);

  const spawnParticle = (type: FeedbackType) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    const x = Math.max(16, Math.min(viewport.width - 16, viewport.width / 2 + (Math.random() * 160 - 80)));
    const y = viewport.height - 120;
    setParticles((prev) => [...prev, { id, x, y, type }]);
    setTimeout(() => {
      setParticles((prev) => prev.filter((particle) => particle.id !== id));
    }, 900);
  };

  const triggerBiaPulse = () => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setPulses((prev) => [...prev, { id }]);
    window.setTimeout(() => {
      setPulses((prev) => prev.filter((pulse) => pulse.id !== id));
    }, 420);
  };

  const triggerActivityReaction = (action: ActivityReaction) => {
    if (activityReactionTimerRef.current) {
      window.clearTimeout(activityReactionTimerRef.current);
    }
    setActivityReaction(action);
    activityReactionTimerRef.current = window.setTimeout(() => {
      setActivityReaction(null);
      activityReactionTimerRef.current = null;
    }, 950);
  };

  const runPetInteraction = () => {
    playPetPurrHaptic();
    setPetJumpKey((prev) => prev + 1);
    applyStatDelta({ joy: 3 }, 1);
    spawnParticle("pet");
    triggerBiaPulse();
    setPlayerMeta((m) => {
      const next = { ...m, carePetCount: m.carePetCount + 1 };
      savePlayerMeta(next);
      return next;
    });
  };

  const triggerPetJump = () => {
    if (pet.stage === "egg") {
      if (pet.xp >= XP_HATCH_TARGET) {
        void executeHatch();
        return;
      }

      if (!eggIsReadyByTime) {
        const warmGain = Math.max(0, Math.min(3, XP_HATCH_TARGET - pet.xp));
        if (warmGain > 0) {
          applyStatDelta({}, warmGain);
        }
        return;
      }

      const nextBondXp = Math.min(XP_HATCH_TARGET, pet.xp + 8);
      applyStatDelta({}, 8);
      if (nextBondXp >= XP_HATCH_TARGET) {
        window.setTimeout(() => {
          void executeHatch();
        }, 120);
      }
      return;
    }
    runPetInteraction();
  };

  const isPointInCreature = (point: { x: number; y: number }) => {
    const rect = creatureRef.current?.getBoundingClientRect();
    if (!rect) {
      return false;
    }

    return point.x >= rect.left && point.x <= rect.right && point.y >= rect.top && point.y <= rect.bottom;
  };

  const getCreatureDistance = (point: { x: number; y: number }) => {
    const rect = creatureRef.current?.getBoundingClientRect();
    if (!rect) {
      return Number.POSITIVE_INFINITY;
    }

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    return Math.hypot(point.x - centerX, point.y - centerY);
  };

  const flashStat = (stat: StatKey) => {
    setFlashedStat(stat);
    window.setTimeout(() => {
      setFlashedStat((current) => (current === stat ? null : current));
    }, 650);
  };

  const currentEggAsset =
    pet.xp < XP_HATCH_TARGET * 0.33
      ? "/assets/stage0.png"
      : pet.xp < XP_HATCH_TARGET * 0.66
        ? "/assets/stage1.png"
        : pet.xp < XP_HATCH_TARGET
          ? "/assets/stage2.png"
          : "/assets/stage2.png";

  const eggProgressPct = eggCycle
    ? Math.max(0, Math.min(100, ((nowTick - eggCycle.startedAt) / Math.max(1, eggCycle.readyAt - eggCycle.startedAt)) * 100))
    : 0;
  const eggIsReadyByTime = (!!eggCycle && nowTick >= eggCycle.readyAt) || pet.xp >= XP_HATCH_TARGET;
  const eggRemainingLabel = eggCycle ? formatRemaining(eggCycle.readyAt - nowTick) : "--";

  const healProgressPct = healCycle
    ? Math.max(0, Math.min(100, ((nowTick - healCycle.startedAt) / Math.max(1, healCycle.readyAt - healCycle.startedAt)) * 100))
    : 0;
  const healIsReady = !!healCycle && nowTick >= healCycle.readyAt;
  const healRemainingLabel = healCycle ? formatRemaining(healCycle.readyAt - nowTick) : "--";

  const eggShouldWobble = pet.stage === "egg" && pet.xp >= XP_HATCH_TARGET * 0.75;

  const executeHatch = async () => {
    if (pet.stage !== "egg" || hatchPhase !== "idle" || inputsLocked) {
      return;
    }

    setInputsLocked(true);
    setHatchPhase("shake");
    await new Promise((resolve) => setTimeout(resolve, 650));
    setScreenFlashTone("chromatic");
    setHatchPhase("flash");
    await new Promise((resolve) => setTimeout(resolve, 260));
    setUseDefaultBabyAsset(true);
    setStage("baby", XP_HATCH_TARGET, { silent: true });
    setPlayerMeta((m) => {
      const next = { ...m, stardust: m.stardust + HATCH_STARDUST_BONUS };
      savePlayerMeta(next);
      return next;
    });
    setStardustPulseNonce((n) => n + 1);
    await triggerSchoolPrideBurst();
    setCurrentScene("nursery");
    setTimeout(() => {
      setHatchPhase("idle");
      setScreenFlashTone(null);
      setInputsLocked(false);
    }, 600);
  };

  const handleHeal = useCallback(async () => {
    if (inputsLocked || !isSick) {
      return;
    }

    setInputsLocked(true);
    setScreenFlashTone("cyan");
    await new Promise((resolve) => setTimeout(resolve, 180));
    await healPet();
    setHealPulseKey((prev) => prev + 1);
    triggerBiaPulse();
    ["hunger", "energy", "joy", "hygiene"].forEach((stat) => flashStat(stat as StatKey));
    spawnParticle("clean");
    window.setTimeout(() => {
      setScreenFlashTone(null);
      setInputsLocked(false);
      setActiveAction(null);
    }, 650);
  }, [flashStat, healPet, inputsLocked, isSick, spawnParticle, triggerBiaPulse]);

  useEffect(() => {
    if (!isSick || !healCycle || !healIsReady || inputsLocked) {
      return;
    }
    localStorage.removeItem(HEAL_CYCLE_STORAGE_KEY);
    setHealCycle(null);
    void handleHeal();
  }, [handleHeal, healCycle, healIsReady, inputsLocked, isSick]);

  const beginExperience = () => {
    ensureAmbientMusic();
    if (ambientAudioRef.current) {
      const maybePromise = ambientAudioRef.current.play();
      if (maybePromise && typeof maybePromise.catch === "function") {
        void maybePromise.catch(() => {
          // ignored: will retry from state effect after start transition
        });
      }
    }
    setIsStarting(true);
    window.setTimeout(() => {
      setHasStarted(true);
      setIsStarting(false);
    }, 700);
  };

  const chooseEgg = (eggType: "pink" | "blue" | "gold") => {
    const now = Date.now();
    const created: EggCycleMeta = { startedAt: now, readyAt: now + EGG_HATCH_DURATION_MS, eggType };
    setEggCycle(created);
    localStorage.setItem(EGG_CYCLE_STORAGE_KEY, JSON.stringify(created));
    void createPet(eggType);
  };

  const commitRename = async () => {
    const trimmed = draftName.trim().slice(0, 24);
    setIsRenaming(false);
    setDraftName(trimmed || pet.name);
    if (trimmed && trimmed !== pet.name) {
      await renamePet(trimmed);
    }
  };

  const runActivity = (action: FeedbackType) => {
    if (action !== "pet" && isActionLocked(action)) {
      return;
    }
    if (action === "feed") {
      applyStatDelta({ hunger: 16, joy: 2 }, isSick ? 0 : 8);
      setCurrentScene("feed");
      flashStat("hunger");
      setFeedSquashNonce((n) => n + 1);
    }

    if (action === "sleep") {
      applyStatDelta({ energy: 18, hunger: -4 }, 8);
      setCurrentScene("sleep");
      flashStat("energy");
    }

    if (action === "play") {
      applyStatDelta({ joy: 18, energy: -4, hunger: -2 }, isSick ? 0 : 8);
      setCurrentScene("play");
      flashStat("joy");
    }

    if (action === "clean") {
      applyStatDelta({ hygiene: 20, joy: 4 }, 8);
      setCurrentScene("clean");
      flashStat("hygiene");
    }
    spawnParticle(action);
    triggerBiaPulse();
    if (action !== "pet") {
      triggerActivityReaction(action);
    }
  };

  const onDropPet = (point: { x: number; y: number }) => {
    if (inputsLocked) {
      return;
    }
    const hitCreature = isPointInCreature(point);
    setAnticipationState("idle");
    if (!hitCreature) {
      return;
    }

    if (pet.stage === "egg") {
      const nextBondXp = Math.min(XP_HATCH_TARGET, pet.xp + 10);
      applyStatDelta({}, 10);
      if (nextBondXp >= XP_HATCH_TARGET) {
        window.setTimeout(() => {
          void executeHatch();
        }, 120);
      }
      return;
    }
    runPetInteraction();
  };

  const onSubDrop = (action: CareAction, subId: string, point: { x: number; y: number }) => {
    if (inputsLocked) {
      return;
    }
    const hitCreature = isPointInCreature(point);
    setAnticipationState("idle");
    if (!hitCreature) {
      return;
    }

    if (pet.stage === "egg") {
      return;
    }

    if (isActionLocked(action) && subId !== "star-elixir") {
      return;
    }

    if (subId === "star-elixir") {
      if (!healCycle) {
        const now = Date.now();
        const treatment: HealCycleMeta = { startedAt: now, readyAt: now + HEAL_DURATION_MS };
        setHealCycle(treatment);
        localStorage.setItem(HEAL_CYCLE_STORAGE_KEY, JSON.stringify(treatment));
      } else if (healIsReady) {
        localStorage.removeItem(HEAL_CYCLE_STORAGE_KEY);
        setHealCycle(null);
        void handleHeal();
      }
      return;
    }

    const memoryKey = `${action}:${subId}:${currentScene}`;
    const cravingMatch =
      craving &&
      action === craving.action &&
      subId === craving.id &&
      Date.now() <= craving.expiresAt;

    if (cravingMatch) {
      setCraving(null);
      setHappyDanceNonce((n) => n + 1);
    }

    setPlayerMeta((m) => {
      let next = { ...m };
      if (!next.memoryKeys.includes(memoryKey)) {
        next = { ...next, memoryKeys: [...next.memoryKeys, memoryKey] };
      }
      if (action === "feed") {
        next = { ...next, careFeedCount: next.careFeedCount + 1 };
      }
      if (action === "play") {
        next = { ...next, carePlayCount: next.carePlayCount + 1 };
      }
      savePlayerMeta(next);
      return next;
    });

    void triggerSchoolPrideBurst();
    runActivity(action);
    if (cravingMatch) {
      applyStatDelta({ joy: 22 }, 28);
    }
    setPetJumpKey((prev) => prev + 1);
    window.setTimeout(() => {
      setActiveAction(null);
    }, 350);
  };

  const onDragPoint = (point: { x: number; y: number }) => {
    if (inputsLocked) {
      return;
    }
    const distance = getCreatureDistance(point);
    setAnticipationState(distance <= 50 ? "near" : "dragging");
  };

  const showFlash = screenFlashTone !== null || hatchPhase === "flash";
  const creatureTopClass =
    statsPanelOpen
      ? pet.stage === "egg"
        ? "top-[61%] sm:top-[51%]"
        : "top-[64%] sm:top-[51%]"
      : pet.stage === "egg"
        ? "top-[53%] sm:top-[46%]"
        : "top-[56%] sm:top-[46%]";
  const creatureSizeClass =
    pet.stage === "egg" ? "h-[172px] w-[172px] sm:h-[280px] sm:w-[280px]" : "h-[180px] w-[180px] sm:h-[280px] sm:w-[280px]";

  const actionFeedbackIcon = {
    feed: "💖",
    sleep: "⭐",
    play: "✨",
    clean: "🫧",
    pet: "💕"
  } as const;

  useEffect(() => {
    if (pet.stage !== "egg" && hatchPhase !== "idle") {
      const timer = setTimeout(() => setHatchPhase("idle"), 450);
      return () => clearTimeout(timer);
    }
  }, [pet.stage, hatchPhase]);

  useEffect(() => {
    if (pet.stage === "egg") {
      setActiveAction(null);
    }
  }, [pet.stage]);

  const careStylePill = careStyleLabel(deriveCareStyle(playerMeta));
  const avgVitality = (pet.hunger + pet.energy + pet.joy + pet.hygiene) / 4;
  const cravingForStage =
    craving && pet.stage !== "egg"
      ? { label: craving.label, emoji: craving.emoji, expiresAt: craving.expiresAt }
      : null;
  const pleadForFood = pet.hunger <= 20 && pet.stage !== "egg" && !isSick;

  const grantStardust = useCallback((amount: number, from?: { x: number; y: number }) => {
    setPlayerMeta((m) => {
      const next = { ...m, stardust: m.stardust + amount };
      savePlayerMeta(next);
      return next;
    });
    setStardustPulseNonce((n) => n + 1);
    if (from && typeof window !== "undefined") {
      const el = stardustCounterRef.current;
      if (el) {
        const r = el.getBoundingClientRect();
        const id = Date.now() + Math.floor(Math.random() * 1000);
        setStardustFlights((f) => [...f, { id, x0: from.x, y0: from.y, x1: r.left + r.width / 2, y1: r.top + r.height / 2 }]);
        window.setTimeout(() => {
          setStardustFlights((f) => f.filter((p) => p.id !== id));
        }, 950);
      }
    }
  }, []);

  const resolveCosmetics = useMemo(() => {
    const hatEq = playerMeta.equippedHatId ? findStoreItem(playerMeta.equippedHatId) : undefined;
    const skinEq = playerMeta.equippedSkinId ? findStoreItem(playerMeta.equippedSkinId) : undefined;
    const roomEq = playerMeta.equippedRoomId ? findStoreItem(playerMeta.equippedRoomId) : undefined;
    let hatEmoji: string | null = hatEq?.category === "hat" ? hatEq.displayEmoji : null;
    let skinExtra: string | null =
      skinEq?.category === "skin" && skinEq.huePreset ? (HUE_PRESET_CSS[skinEq.huePreset] ?? null) : null;
    let roomEmoji: string | null = roomEq?.category === "room" ? roomEq.displayEmoji : null;
    if (previewItem) {
      if (previewItem.category === "hat") {
        hatEmoji = previewItem.displayEmoji;
      }
      if (previewItem.category === "skin") {
        skinExtra = previewItem.huePreset ? (HUE_PRESET_CSS[previewItem.huePreset] ?? null) : null;
      }
      if (previewItem.category === "room") {
        roomEmoji = previewItem.displayEmoji;
      }
    }
    return { hatEmoji, skinExtra, roomEmoji };
  }, [playerMeta.equippedHatId, playerMeta.equippedSkinId, playerMeta.equippedRoomId, previewItem]);

  const handleHoldStardust = useCallback(() => {
    if (inputsLocked) {
      return;
    }
    const rect = creatureRef.current?.getBoundingClientRect();
    if (rect) {
      grantStardust(1, {
        x: rect.left + rect.width * 0.5,
        y: rect.top + rect.height * 0.38
      });
    } else {
      grantStardust(1);
    }
  }, [inputsLocked, grantStardust]);


  return (
    <motion.section
      className={`relative min-h-[100dvh] pb-[env(safe-area-inset-bottom)] text-slate-800 selection:bg-violet-200/50 ${!isReady || !hasStarted ? "opacity-0" : ""}`}
      initial={false}
      animate={!hasStarted && !isStarting ? { scale: 0.98, opacity: 0.75 } : { scale: 1, opacity: 1 }}
      transition={{ duration: 0.7, ease: "easeInOut" }}
    >
      <SceneBackground
        currentScene={currentScene}
        mood={currentMood}
        isSick={isSick}
        roomDecorEmoji={!shouldHideMain ? resolveCosmetics.roomEmoji : null}
      />

      {!shouldHideMain && (
        <header className="pointer-events-none fixed inset-x-0 top-0 z-30 mx-auto w-full max-w-[min(100%,480px)] px-2.5 pt-[max(0.5rem,env(safe-area-inset-top))] sm:px-3 sm:pt-[max(0.75rem,env(safe-area-inset-top))]">
          <div className="pointer-events-auto rounded-3xl border border-white/45 bg-white/40 px-2.5 py-2.5 shadow-[0_10px_30px_rgba(122,111,174,0.12)] backdrop-blur-md sm:px-3 sm:py-3.5">
          <div className="mb-1 grid grid-cols-[auto_1fr_auto] items-center gap-1.5">
            <div className="flex shrink-0 items-center gap-0.5">
              <button
                type="button"
                onClick={() => setMemoryBookOpen(true)}
                className="app-tap-target flex h-8 w-8 items-center justify-center rounded-full text-rose-700/85 transition hover:bg-white/35 enabled:active:scale-[0.96]"
                title="Memory Book — stickers & memories"
                aria-label="Open memory book"
              >
                <BookHeart className="h-4 w-4 shrink-0" strokeWidth={2} />
              </button>
              <button
                type="button"
                onClick={() => setBoutiqueOpen(true)}
                className="app-tap-target flex h-8 w-8 items-center justify-center rounded-full text-violet-800/95 transition hover:bg-violet-200/35 enabled:active:scale-[0.96]"
                title="Cosmic Boutique — spend stardust"
                aria-label="Open boutique"
              >
                <ShoppingBag className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>
            <div className="flex min-w-0 justify-center">
              {isRenaming ? (
                <input
                  ref={renameInputRef}
                  value={draftName}
                  onChange={(event) => setDraftName(event.target.value.slice(0, 24))}
                  onBlur={() => void commitRename()}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      void commitRename();
                    }
                    if (event.key === "Escape") {
                      setIsRenaming(false);
                      setDraftName(pet.name);
                    }
                  }}
                  aria-label="Rename creature"
                  className="w-40 rounded-full border border-white/50 bg-white/75 px-3 py-1 text-center text-[13px] font-bold leading-tight tracking-tight text-slate-800 outline-none ring-0"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setIsRenaming(true)}
                  className="rounded-full px-3 py-1 text-[13px] font-bold leading-tight tracking-tight text-slate-800 transition hover:bg-white/25"
                  aria-label="Rename creature"
                >
                  {pet.name}
                </button>
              )}
            </div>
            <div className="flex shrink-0 items-center justify-end gap-1">
              <StardustCounter
                ref={stardustCounterRef}
                amount={playerMeta.stardust}
                onOpenInfo={() => setStardustInfoOpen(true)}
                pulseNonce={stardustPulseNonce}
              />
              {typeof Notification !== "undefined" ? (
                <button
                  type="button"
                  onClick={() => {
                    void Notification.requestPermission().then((r) => setNotifPerm(r));
                  }}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-700/90 transition hover:bg-white/35 disabled:opacity-40"
                  title={
                    notifPerm === "granted"
                      ? "Hunger reminders on"
                      : notifPerm === "denied"
                        ? "Notifications blocked in browser settings"
                        : "Enable hunger reminders"
                  }
                  aria-label={
                    notifPerm === "granted"
                      ? "Hunger reminders enabled"
                      : "Enable hunger reminder notifications"
                  }
                  disabled={notifPerm === "denied"}
                >
                  {notifPerm === "denied" ? (
                    <BellOff className="h-4 w-4" strokeWidth={2} />
                  ) : (
                    <Bell className="h-4 w-4" strokeWidth={2} />
                  )}
                </button>
              ) : null}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setStatsPanelOpen((o) => !o)}
            className="app-tap-target mb-1 mt-0.5 flex w-full items-center justify-center gap-1 rounded-full py-1 text-[9px] font-semibold uppercase tracking-wide text-slate-600/90 transition hover:bg-white/30 enabled:active:scale-[0.99]"
            aria-expanded={statsPanelOpen}
            aria-label={statsPanelOpen ? "Hide stats and mood" : "Show stats and mood"}
          >
            {statsPanelOpen ? (
              <>
                <span>Zen view</span>
                <ChevronUp className="h-3.5 w-3.5 opacity-80" strokeWidth={2.2} />
              </>
            ) : (
              <>
                <span>Stats</span>
                <ChevronDown className="h-3.5 w-3.5 opacity-80" strokeWidth={2.2} />
              </>
            )}
          </button>

          {statsPanelOpen ? (
            <>
              <GrowthJourney stage={pet.stage} bond={pet.xp} />

              <div className="mt-2">
                <MoodAura mood={currentMood} />
              </div>

              <div className="mt-2 grid grid-cols-2 gap-2">
                {statConfig.map((stat) => (
                  <div key={stat.key} className="rounded-xl bg-white/72 px-2 py-1 shadow-sm">
                    <div className="mb-1 flex items-center justify-between text-[9px] font-semibold leading-none text-slate-600">
                      <span>{stat.label}</span>
                      <span className="tabular-nums">{pet[stat.key]}%</span>
                    </div>
                    <div
                      className={`h-1.5 rounded-full bg-slate-100/90 transition-all duration-300 ${
                        flashedStat === stat.key ? "ring-2 ring-white shadow-[0_0_14px_rgba(255,255,255,0.95)]" : ""
                      }`}
                    >
                      <div
                        className={`h-1.5 rounded-full transition-all duration-300 ${stat.color}`}
                        style={{ width: `${pet[stat.key]}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-center text-[10px] font-semibold text-slate-600/90">
              {pet.name} XP <span className="tabular-nums text-slate-800">{pet.xp}</span>
              <span className="mx-1.5 text-slate-400">·</span>
              <span className="text-slate-500">Keep stats high for the happiest mood</span>
            </p>
          )}
          </div>
        </header>
      )}

      {!shouldHideMain && (
        <AnimatePresence mode="wait">
          <motion.div
            key="creature-stage"
            initial={{ opacity: 0.88 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0.88 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className={`pointer-events-none fixed inset-x-0 ${creatureTopClass} z-20 flex -translate-y-1/2 items-center justify-center`}
          >
            <div ref={creatureRef} className={`pointer-events-auto ${creatureSizeClass}`}>
              <CreatureStage
                stage={pet.stage}
                hatchPhase={hatchPhase}
                mood={currentMood}
                eggType={pet.eggType}
                hunger={pet.hunger}
                pleadForFood={pleadForFood}
                craving={cravingForStage}
                avgVitality={avgVitality}
                petToolPrimed={draggingPetTool}
                happyDanceNonce={happyDanceNonce}
                feedSquashNonce={feedSquashNonce}
                reunionPlayKey={reunionPlayKey}
                onPet={triggerPetJump}
                petJumpKey={petJumpKey}
                isExcited={anticipationState !== "idle"}
                isNearDrop={anticipationState === "near"}
                eggAsset={currentEggAsset}
                eggShouldWobble={eggShouldWobble}
                useDefaultBabyAsset={useDefaultBabyAsset}
                isSick={isSick}
                healPulseKey={healPulseKey}
                activityReaction={activityReaction}
                cosmeticSkinExtraFilter={resolveCosmetics.skinExtra}
                cosmeticHatEmoji={resolveCosmetics.hatEmoji}
                onHoldStardustReward={handleHoldStardust}
              />
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      {!shouldHideMain && (
        <Sidebar
          stage={pet.stage}
          activeAction={activeAction}
          isSick={isSick}
          lockedActions={lockedActions}
          onDragPoint={onDragPoint}
          onDropPet={onDropPet}
          onSubDrop={onSubDrop}
          onToggleAction={(action) => setActiveAction((current) => (current === action ? null : action))}
          onCloseMenu={() => setActiveAction(null)}
          onPetDragChange={setDraggingPetTool}
          disabled={inputsLocked}
        />
      )}

      <AnimatePresence>
        {showFlash && (
          screenFlashTone === "cyan" ? (
            <motion.div
              className="pointer-events-none fixed inset-0 z-50 bg-cyan-300"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
            />
          ) : (
            <motion.div
              className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
            >
              <motion.div
                className="absolute inset-0 bg-white/65 mix-blend-screen"
                animate={{ opacity: [0.15, 0.65, 0.2] }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              />
              <motion.div
                className="absolute inset-0 bg-red-400/25 mix-blend-screen"
                animate={{ x: [-8, 10, -4], opacity: [0.2, 0.42, 0.18] }}
                transition={{ duration: 0.32, ease: "easeInOut" }}
              />
              <motion.div
                className="absolute inset-0 bg-cyan-400/25 mix-blend-screen"
                animate={{ x: [10, -8, 4], opacity: [0.2, 0.42, 0.18] }}
                transition={{ duration: 0.32, ease: "easeInOut" }}
              />
            </motion.div>
          )
        )}
      </AnimatePresence>

      <AnimatePresence>
        {pulses.map((pulse) => (
          <motion.div
            key={pulse.id}
            className="pointer-events-none fixed left-1/2 top-[51%] z-20 h-36 w-36 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-200/75"
            initial={biaPulse.initial}
            animate={biaPulse.animate}
            exit={{ opacity: 0 }}
            transition={biaPulse.transition}
          />
        ))}
      </AnimatePresence>

      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="pointer-events-none fixed z-40 text-2xl"
            initial={{ x: particle.x, y: particle.y, opacity: 0.95, scale: 1 }}
            animate={{ x: viewport.width / 2, y: viewport.height / 2, opacity: 0, scale: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {actionFeedbackIcon[particle.type]}
          </motion.div>
        ))}
      </AnimatePresence>

      <AnimatePresence>
        {stardustFlights.map((f) => (
          <motion.div
            key={f.id}
            className="pointer-events-none fixed z-[60] text-lg font-bold text-amber-200 drop-shadow-[0_0_10px_rgba(251,191,36,0.95)]"
            initial={{ opacity: 1, scale: 1, left: f.x0, top: f.y0 }}
            animate={{ opacity: 0.12, scale: 0.4, left: f.x1, top: f.y1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.85, ease: "easeOut" }}
            style={{ position: "fixed", transform: "translate(-50%, -50%)" }}
          >
            ✦
          </motion.div>
        ))}
      </AnimatePresence>


      <AnimatePresence>
        {dailyToast && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+11rem)] z-[50] mx-auto max-w-[min(100%,420px)] px-4 text-center sm:bottom-[calc(env(safe-area-inset-bottom)+11.5rem)]"
          >
            <div className="rounded-2xl border border-white/45 bg-white/92 px-3 py-2.5 text-left shadow-lg backdrop-blur-md">
              <p className="text-[11px] font-semibold leading-snug text-slate-900">{dailyToast.title}</p>
              {dailyToast.detail ? (
                <p className="mt-1.5 text-[10px] font-medium leading-snug text-slate-600">{dailyToast.detail}</p>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <MemoryBook
        open={memoryBookOpen}
        onClose={() => setMemoryBookOpen(false)}
        memoryKeys={playerMeta.memoryKeys}
        stardust={playerMeta.stardust}
        careStyleNote={careStylePill}
      />

      <StardustGuideModal
        open={stardustInfoOpen}
        onClose={() => setStardustInfoOpen(false)}
        petName={pet.name}
        stage={pet.stage}
      />

      <Boutique
        open={boutiqueOpen}
        onClose={() => {
          setBoutiqueOpen(false);
          setPreviewItem(null);
        }}
        merchantFontClass="font-merchant"
        dailyItems={dailyItems}
        cosmicEgg={cosmicEgg}
        ownedIds={playerMeta.ownedItemIds}
        stardust={playerMeta.stardust}
        previewItemId={previewItem?.id ?? null}
        onPreview={(item) => setPreviewItem(item)}
        onBuyStardust={(item) => {
          const r = buyWithStardust(item);
          if (r.ok) {
            setStardustPulseNonce((n) => n + 1);
          }
          return r;
        }}
        onEquip={equipItem}
        onOpenCosmicEgg={openCosmicEgg}
      />

      <footer className="pointer-events-none fixed inset-x-0 bottom-0 z-[14] mx-auto w-full max-w-[min(100%,480px)] px-2.5 pb-[calc(env(safe-area-inset-bottom)+6.2rem)] sm:px-3 sm:pb-3">
        <div className="pointer-events-auto text-center text-[10px] font-medium leading-snug text-slate-800/90 drop-shadow-[0_1px_6px_rgba(255,255,255,0.75)]">
          {pet.stage === "egg"
            ? eggIsReadyByTime
              ? "Egg is warm enough. Keep caring to trigger hatch."
              : `Heat the egg by tapping it • Warmth ${Math.round(eggProgressPct)}% • Ready in ~${eggRemainingLabel}`
            : isSick
              ? healCycle
                ? healIsReady
                  ? "Healing complete. Drop Star Elixir to stabilize now."
                  : `Healing in progress: ${Math.round(healProgressPct)}% • ~${healRemainingLabel} left`
                : `${pet.name} is sick. Use Star Elixir to begin treatment.`
              : `Drag activities onto your companion. More options unlock as ${pet.name} grows.`}
        </div>
      </footer>
      <AnimatePresence>
        {!hasStarted && <WelcomeScreen onStart={beginExperience} isLeaving={isStarting} isReady={isReady} />}
      </AnimatePresence>

      <AnimatePresence>
        {hasStarted && isReady && needsEggChoice && <ChooseEggScreen onChoose={chooseEgg} />}
      </AnimatePresence>

      <AnimatePresence>
        {awaitingStarterName ? (
          <NameCreatureScreen key="starter-name" onConfirm={(name) => void completeStarterNaming(name)} />
        ) : null}
      </AnimatePresence>
    </motion.section>
  );
}
