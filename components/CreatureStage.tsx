"use client";

import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { animate, AnimatePresence, motion, useMotionValue, useSpring, type Variants } from "framer-motion";
import { BrushCleaning, Cherry, CloudMoon, Sparkles } from "lucide-react";
import type { EggType, PetMood, PetStage } from "@/lib/game";

type ActivityReaction = "feed" | "sleep" | "play" | "clean" | null;

export type ActiveCraving = {
  label: string;
  emoji: string;
  expiresAt: number;
} | null;

type CreatureStageProps = {
  stage: PetStage;
  hatchPhase: "idle" | "shake" | "flash";
  mood: PetMood;
  eggType: EggType;
  hunger: number;
  /** Hunger low: lean toward feed / "puppy eyes" plea */
  pleadForFood: boolean;
  craving: ActiveCraving;
  /** Floor mess — cleared by Clean; drives hygiene pressure in parent. */
  poopIds: string[];
  /** Pet tool menu open: subtle “ready for pets” look before touch. */
  petToolPrimed: boolean;
  /** Increment to replay a one-shot happy dance (e.g. craving fulfilled). */
  happyDanceNonce: number;
  /** Increment on successful feed — soft marshmallow squash-and-stretch. */
  feedSquashNonce: number;
  /** When > 0, one-shot “reunion” rush toward the player after a long absence. */
  reunionPlayKey: number;
  onPet: () => void;
  petJumpKey: number;
  isExcited: boolean;
  isNearDrop: boolean;
  eggAsset: string;
  eggShouldWobble: boolean;
  useDefaultBabyAsset: boolean;
  isSick: boolean;
  healPulseKey: number;
  activityReaction: ActivityReaction;
  /** Extra CSS filter for equipped / preview boutique skin (hue-shift variants). */
  cosmeticSkinExtraFilter?: string | null;
  /** Equipped or preview hat emoji */
  cosmeticHatEmoji?: string | null;
  /** Every 5s continuous hold while not egg: callback (stardust grant in parent). */
  onHoldStardustReward?: () => void;
  /** Global finger for eye tracking (screen coords). */
  fingerScreen?: { x: number; y: number } | null;
  /** Long idle — calmer pose + “meditation” feel. */
  zenMeditate?: boolean;
  /** Session open — one rush toward camera. */
  peekSessionKey?: number;
  /** Long absence — shy in corner until interaction. */
  shyCorner?: boolean;
  onShyDismiss?: () => void;
  onTickle?: () => void;
  onNudge?: () => void;
  /** Any physical gesture — resets idle zen timer in parent. */
  onPhysicalActivity?: () => void;
};

function eggTypeToTintFilter(eggType: EggType): string {
  // We recolor the existing purple art via hue rotation.
  // These values are tuned for the current asset set; if you provide specific egg reference renders,
  // we can fine-tune for each egg.
  switch (eggType) {
    case "pink":
      return "hue-rotate(46deg) saturate(1.12) contrast(1.02)";
    case "blue":
      return "hue-rotate(-58deg) saturate(1.2) contrast(1.03)";
    case "gold":
      return "hue-rotate(142deg) saturate(1.28) contrast(1.06)";
    default:
      return "";
  }
}

function breatheVariantsForMood(mood: PetMood): Variants {
  const fast = mood === "blissful";
  return {
    idle: {
      scale: [1, fast ? 1.06 : 1.05, 1],
      y: [0, fast ? -14 : -10, 0]
    }
  };
}

const wobbleVariants: Variants = {
  idle: { rotate: 0, scale: 1 },
  wobble: {
    rotate: [-2, 2, -1, 2, 0],
    y: [0, -2, 0]
  },
  shake: {
    rotate: [-10, 10, -12, 12, -8, 8, 0],
    x: [-8, 8, -10, 10, -6, 6, 0],
    scale: [1, 1.02, 0.98, 1.03, 1]
  }
};

function EggStateArt({ src }: { src: string }) {
  return (
    <Image
      src={src}
      alt="Egg stage"
      width={260}
      height={260}
      className="h-44 w-44 object-contain sm:h-60 sm:w-60"
      unoptimized
      priority
    />
  );
}

function DefaultBabyArt() {
  return (
    <Image
      src="/assets/stage3_baby.png"
      alt="Default baby pet"
      width={260}
      height={260}
      className="h-52 w-52 object-contain"
      unoptimized
      priority
    />
  );
}

function CreatureSprite({ stage }: { stage: Exclude<PetStage, "egg"> }) {
  const src =
    stage === "baby" ? "/assets/stage3_baby.png" : stage === "teen" ? "/assets/stage4_medium.png" : "/assets/stage5_adult.png";
  const sizeClass = stage === "adult" ? "h-56 w-72" : "h-52 w-52";

  return <Image src={src} alt={`${stage} creature`} width={320} height={320} className={`${sizeClass} object-contain`} unoptimized priority />;
}

function SickCreatureArt() {
  return (
    <Image
      src="/assets/sick.png"
      alt="Sick creature"
      width={320}
      height={320}
      className="h-56 w-56 object-contain"
      unoptimized
      priority
    />
  );
}

function ReactionOverlay({ activityReaction }: { activityReaction: ActivityReaction }) {
  if (!activityReaction) {
    return null;
  }

  if (activityReaction === "feed") {
    return (
      <motion.div
        className="pointer-events-none absolute left-1/2 top-[34%] z-20 ml-6"
        initial={{ opacity: 0, scale: 0.7, x: 10, y: 8 }}
        animate={{ opacity: [0, 1, 1, 0], scale: [0.7, 1.05, 1, 0.92], x: [10, 0, -6, -10], y: [8, 0, 2, 4] }}
        transition={{ duration: 0.85, ease: "easeOut" }}
      >
        <div className="rounded-full border border-white/40 bg-white/28 p-2 text-rose-50 shadow-[0_0_18px_rgba(255,255,255,0.25)] backdrop-blur-sm">
          <Cherry size={18} strokeWidth={2} />
        </div>
      </motion.div>
    );
  }

  if (activityReaction === "sleep") {
    return (
      <motion.div
        className="pointer-events-none absolute left-1/2 top-[18%] z-20 ml-8 text-indigo-50"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: [0, 1, 1, 0], y: [10, -6, -18, -30] }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      >
        <div className="mb-1 flex justify-center">
          <CloudMoon size={18} strokeWidth={2} />
        </div>
        <div className="text-xs font-bold tracking-[0.18em]">Zz</div>
      </motion.div>
    );
  }

  if (activityReaction === "play") {
    return (
      <motion.div
        className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center text-amber-50"
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: [0, 1, 1, 0], scale: [0.85, 1.1, 1] }}
        transition={{ duration: 0.9, ease: "easeOut" }}
      >
        <motion.div
          className="absolute -left-2 top-10"
          animate={{ x: [0, 12, 0], y: [0, -12, 0], rotate: [0, 20, 0] }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          <Sparkles size={18} strokeWidth={2} />
        </motion.div>
        <motion.div
          className="absolute -right-1 top-14"
          animate={{ x: [0, -10, 0], y: [0, 8, 0], rotate: [0, -18, 0] }}
          transition={{ duration: 0.75, ease: "easeInOut" }}
        >
          <Sparkles size={20} strokeWidth={2} />
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center text-cyan-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 1, 0] }}
      transition={{ duration: 0.95, ease: "easeOut" }}
    >
      {Array.from({ length: 4 }).map((_, idx) => (
        <motion.div
          key={idx}
          className="absolute"
          style={{
            left: `${28 + idx * 14}%`,
            top: `${24 + (idx % 2) * 18}%`
          }}
          animate={{ y: [8, -8, -18], opacity: [0, 1, 0], scale: [0.7, 1, 0.85] }}
          transition={{ duration: 0.9, ease: "easeOut", delay: idx * 0.08 }}
        >
          <BrushCleaning size={16} strokeWidth={2} />
        </motion.div>
      ))}
    </motion.div>
  );
}

function PleadingOverlay({ active, hunger }: { active: boolean; hunger: number }) {
  if (!active) {
    return null;
  }
  const urgency = Math.max(0, Math.min(1, (20 - hunger) / 20));
  return (
    <>
      <motion.div
        className="pointer-events-none absolute -right-2 top-[8%] z-30 flex flex-col items-end gap-0.5 sm:right-0 sm:top-[10%]"
        initial={{ opacity: 0, x: 8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.35 }}
      >
        <span className="text-[10px] font-bold uppercase tracking-wide text-rose-100/90 drop-shadow">Feed</span>
        <motion.span
          className="text-lg"
          animate={{ x: [0, 4 + urgency * 2, 0], y: [0, 2, 0] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
          aria-hidden
        >
          🍒
        </motion.span>
      </motion.div>
      <div
        className="pointer-events-none absolute left-1/2 top-[12%] z-30 flex items-center gap-1 rounded-full border border-white/35 bg-white/20 px-2 py-0.5 text-lg shadow-lg backdrop-blur-sm"
        aria-hidden
        style={{ transform: `translateX(-50%) scale(${1 + urgency * 0.08})` }}
      >
        <span>🥺</span>
      </div>
    </>
  );
}

function CravingBubble({ craving, now }: { craving: NonNullable<ActiveCraving>; now: number }) {
  const leftMs = Math.max(0, craving.expiresAt - now);
  const secs = Math.ceil(leftMs / 1000);
  return (
    <motion.div
      className="pointer-events-none relative z-40 max-w-[8.75rem] shrink-0"
      initial={{ opacity: 0, x: 12, scale: 0.94 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 8 }}
    >
      <div className="relative rounded-2xl border border-amber-200/50 bg-amber-50/95 px-2.5 py-1.5 text-left shadow-lg">
        <div
          className="absolute left-0 top-1/2 z-10 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rotate-45 border-b border-l border-amber-200/50 bg-amber-50/95"
          aria-hidden
        />
        <p className="text-[9px] font-bold uppercase tracking-wide text-amber-900/80">Craving</p>
        <p className="text-xs font-semibold leading-tight text-amber-950">
          {craving.emoji} {craving.label}
        </p>
        <p className="text-[10px] text-amber-900/70">{secs}s</p>
      </div>
    </motion.div>
  );
}

function isInBellyRegion(clientX: number, clientY: number, rect: DOMRect) {
  const nx = (clientX - rect.left) / rect.width;
  const ny = (clientY - rect.top) / rect.height;
  return ny > 0.38 && ny < 0.8 && nx > 0.22 && nx < 0.78;
}

export function CreatureStage({
  stage,
  hatchPhase,
  mood,
  eggType,
  hunger,
  pleadForFood,
  craving,
  poopIds,
  petToolPrimed,
  happyDanceNonce,
  feedSquashNonce,
  reunionPlayKey,
  onPet,
  petJumpKey,
  isExcited,
  isNearDrop,
  eggAsset,
  eggShouldWobble,
  useDefaultBabyAsset,
  isSick,
  healPulseKey,
  activityReaction,
  cosmeticSkinExtraFilter,
  cosmeticHatEmoji,
  onHoldStardustReward,
  fingerScreen = null,
  zenMeditate = false,
  peekSessionKey = 0,
  shyCorner = false,
  onShyDismiss,
  onTickle,
  onNudge,
  onPhysicalActivity
}: CreatureStageProps) {
  const breatheForBody = useMemo(() => {
    if (zenMeditate && stage !== "egg" && !isSick) {
      return { idle: { scale: [1, 1.03, 1], y: [0, -3, 0] } };
    }
    return breatheVariantsForMood(mood);
  }, [zenMeditate, stage, isSick, mood]);
  const breatheDuration = useMemo(() => {
    if (zenMeditate && stage !== "egg" && !isSick) return 5.4;
    return isSick ? 4.8 : mood === "blissful" ? 1.4 : 2.4;
  }, [zenMeditate, stage, isSick, mood]);
  const creatureFilterParts: string[] = [];

  if (isSick) {
    // Sick art swaps out, but we keep this for safety if any layer still uses the base sprite.
    creatureFilterParts.push("grayscale(0.8) contrast(1.2)");
  } else {
    const moodFilter = mood === "distressed" ? "saturate(0.75) brightness(0.96)" : "";
    const tintFilter = eggTypeToTintFilter(eggType);
    if (moodFilter) creatureFilterParts.push(moodFilter);
    if (tintFilter) creatureFilterParts.push(tintFilter);
  }

  if (cosmeticSkinExtraFilter && !isSick) {
    creatureFilterParts.push(cosmeticSkinExtraFilter);
  }

  const creatureFilter = creatureFilterParts.length ? creatureFilterParts.join(" ") : undefined;
  const creatureRootRef = useRef<HTMLDivElement>(null);
  const nudgeX = useMotionValue(0);
  const smoothNudgeX = useSpring(nudgeX, { stiffness: 380, damping: 26 });
  const stretchX = useMotionValue(1);
  const stretchY = useMotionValue(1);
  const smoothStretchX = useSpring(stretchX, { stiffness: 420, damping: 32 });
  const smoothStretchY = useSpring(stretchY, { stiffness: 420, damping: 32 });
  const pointersMapRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const stretchBaseDistRef = useRef<number | null>(null);
  const tickleSessionRef = useRef<{ acc: number; lastAngle: number | null; start: number } | null>(null);
  const tickleFiredRef = useRef(false);
  const nudgeDownXRef = useRef(0);
  const nudgeDownTRef = useRef(0);
  const didMultiTouchRef = useRef(false);
  const nudgeFiredRef = useRef(false);
  const [tickleNonce, setTickleNonce] = useState(0);
  const [faceLayout, setFaceLayout] = useState(0);
  const [eyeGaze, setEyeGaze] = useState({ ox: 0, oy: 0 });

  useLayoutEffect(() => {
    if (!fingerScreen || stage === "egg" || isSick || !creatureRootRef.current) {
      setEyeGaze({ ox: 0, oy: 0 });
      return;
    }
    const r = creatureRootRef.current.getBoundingClientRect();
    const cx = r.left + r.width * 0.5;
    const cy = r.top + r.height * 0.36;
    const dx = Math.max(-1, Math.min(1, (fingerScreen.x - cx) / Math.max(40, r.width * 0.38)));
    const dy = Math.max(-1, Math.min(1, (fingerScreen.y - cy) / Math.max(40, r.height * 0.42)));
    setEyeGaze({ ox: dx * 7, oy: dy * 5 });
  }, [fingerScreen, stage, isSick, petJumpKey, tickleNonce, faceLayout]);

  const holdTimerRef = useRef<number | null>(null);
  const holdRepeatRef = useRef<number | null>(null);
  const pointerDownAtRef = useRef(0);
  const holdRewardedRef = useRef(false);

  const clearHoldTimers = () => {
    if (holdTimerRef.current != null) {
      window.clearTimeout(holdTimerRef.current);
    }
    if (holdRepeatRef.current != null) {
      window.clearInterval(holdRepeatRef.current);
    }
    holdTimerRef.current = null;
    holdRepeatRef.current = null;
  };

  useEffect(() => () => clearHoldTimers(), []);

  const [nowTick, setNowTick] = useState(() => Date.now());
  useEffect(() => {
    if (!craving) {
      return;
    }
    const id = window.setInterval(() => setNowTick(Date.now()), 500);
    return () => window.clearInterval(id);
  }, [craving]);

  useLayoutEffect(() => {
    const el = creatureRootRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setFaceLayout((n) => n + 1));
    ro.observe(el);
    return () => ro.disconnect();
  }, [stage, isSick]);

  const enableHoldStardust = Boolean(onHoldStardustReward && stage !== "egg");

  const handleHoldPointerDown = () => {
    if (!enableHoldStardust) {
      return;
    }
    holdRewardedRef.current = false;
    pointerDownAtRef.current = Date.now();
    holdTimerRef.current = window.setTimeout(() => {
      holdRewardedRef.current = true;
      onHoldStardustReward?.();
      holdRepeatRef.current = window.setInterval(() => onHoldStardustReward?.(), 5000);
    }, 5000);
  };

  const handleHoldPointerEnd = () => {
    if (tickleFiredRef.current) {
      tickleFiredRef.current = false;
      tickleSessionRef.current = null;
      return;
    }
    if (nudgeFiredRef.current) {
      nudgeFiredRef.current = false;
      return;
    }
    if (!enableHoldStardust) {
      return;
    }
    clearHoldTimers();
    const elapsed = Date.now() - pointerDownAtRef.current;
    if (elapsed < 280 && !holdRewardedRef.current) {
      onPet();
    }
  };

  const fireNudge = (deltaX: number) => {
    nudgeFiredRef.current = true;
    onPhysicalActivity?.();
    onNudge?.();
    const push = Math.max(-56, Math.min(56, deltaX * 0.85));
    void animate(nudgeX, push, { type: "spring", stiffness: 420, damping: 20 }).then(() =>
      animate(nudgeX, 0, { type: "spring", stiffness: 200, damping: 24 })
    );
  };

  const tryTickleFromMove = (clientX: number, clientY: number) => {
    const el = creatureRootRef.current;
    if (!el || stage === "egg" || isSick) return;
    const rect = el.getBoundingClientRect();
    if (!isInBellyRegion(clientX, clientY, rect)) {
      return;
    }
    const cx = rect.left + rect.width * 0.5;
    const cy = rect.top + rect.height * 0.58;
    const angle = Math.atan2(clientY - cy, clientX - cx);
    const sess = tickleSessionRef.current;
    if (!sess) return;
    if (sess.lastAngle != null) {
      let d = angle - sess.lastAngle;
      if (d > Math.PI) d -= 2 * Math.PI;
      if (d < -Math.PI) d += 2 * Math.PI;
      sess.acc += Math.abs(d);
    }
    sess.lastAngle = angle;
    if (sess.acc > Math.PI * 2.2 && Date.now() - sess.start < 900) {
      tickleFiredRef.current = true;
      clearHoldTimers();
      tickleSessionRef.current = null;
      onTickle?.();
      onPhysicalActivity?.();
      setTickleNonce((n) => n + 1);
      void animate(nudgeX, [0, -5, 5, -3, 0], { duration: 0.55, ease: "easeInOut" });
    }
  };

  const onCreaturePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    onPhysicalActivity?.();
    if (shyCorner) {
      onShyDismiss?.();
    }
    pointersMapRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointersMapRef.current.size === 2) {
      didMultiTouchRef.current = true;
      const pts = [...pointersMapRef.current.values()];
      const d = Math.hypot(pts[0]!.x - pts[1]!.x, pts[0]!.y - pts[1]!.y);
      stretchBaseDistRef.current = Math.max(24, d);
      clearHoldTimers();
      return;
    }
    nudgeDownXRef.current = e.clientX;
    nudgeDownTRef.current = Date.now();
    if (stage !== "egg" && !isSick && enableHoldStardust) {
      tickleSessionRef.current = { acc: 0, lastAngle: null, start: Date.now() };
    }
    if (enableHoldStardust) {
      handleHoldPointerDown();
    }
  };

  const onCreaturePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!pointersMapRef.current.has(e.pointerId)) return;
    pointersMapRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointersMapRef.current.size >= 2 && stretchBaseDistRef.current != null) {
      const pts = [...pointersMapRef.current.values()];
      const d = Math.hypot(pts[0]!.x - pts[1]!.x, pts[0]!.y - pts[1]!.y);
      const ratio = d / stretchBaseDistRef.current;
      const clamped = Math.max(0.88, Math.min(1.14, ratio));
      stretchX.set(clamped);
      stretchY.set(2 - clamped);
      onPhysicalActivity?.();
      return;
    }
    if (tickleSessionRef.current && enableHoldStardust) {
      tryTickleFromMove(e.clientX, e.clientY);
    }
  };

  const onCreaturePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    pointersMapRef.current.delete(e.pointerId);
    if (pointersMapRef.current.size < 2) {
      stretchBaseDistRef.current = null;
      void animate(stretchX, 1, { type: "spring", stiffness: 380, damping: 28 });
      void animate(stretchY, 1, { type: "spring", stiffness: 380, damping: 28 });
    }
    if (pointersMapRef.current.size > 0) {
      return;
    }
    const dt = Date.now() - nudgeDownTRef.current;
    const dx = e.clientX - nudgeDownXRef.current;
    if (!didMultiTouchRef.current && Math.abs(dx) > 38 && dt < 420 && stage !== "egg" && !isSick) {
      fireNudge(dx);
      clearHoldTimers();
      tickleSessionRef.current = null;
      didMultiTouchRef.current = false;
      if (enableHoldStardust) {
        handleHoldPointerEnd();
      }
      return;
    }
    didMultiTouchRef.current = false;
    tickleSessionRef.current = null;
    if (enableHoldStardust) {
      handleHoldPointerEnd();
    }
  };

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-visible px-2 sm:px-4">
      {stage !== "egg" && !isSick && (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-40 flex justify-end pt-1 pr-1 sm:pr-4">
          <AnimatePresence>
            {craving && <CravingBubble craving={craving} now={nowTick} key="craving" />}
          </AnimatePresence>
        </div>
      )}
      <motion.div
        role="button"
        tabIndex={0}
        onKeyDown={(ev) => {
          if (ev.key === "Enter" || ev.key === " ") {
            ev.preventDefault();
            onPet();
          }
        }}
        onClick={enableHoldStardust ? undefined : onPet}
        onPointerDown={onCreaturePointerDown}
        onPointerMove={onCreaturePointerMove}
        onPointerUp={onCreaturePointerUp}
        onPointerLeave={enableHoldStardust ? handleHoldPointerEnd : undefined}
        onPointerCancel={enableHoldStardust ? handleHoldPointerEnd : undefined}
        className="relative -mt-2 flex cursor-pointer touch-none items-center justify-center rounded-[2.5rem] outline-none focus-visible:ring-2 focus-visible:ring-violet-400/80"
        animate={pleadForFood ? { rotate: -5 } : { rotate: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <motion.div
          style={{ x: smoothNudgeX }}
          className="relative flex flex-col items-center justify-center"
        >
        <motion.div
          key={`reunion-${reunionPlayKey}-peek-${peekSessionKey}-shy-${shyCorner ? 1 : 0}`}
          initial={
            reunionPlayKey > 0
              ? { scale: 0.68, y: 100, opacity: 0.72 }
              : peekSessionKey > 0
                ? { scale: 1.14, y: 48, opacity: 0.88 }
                : shyCorner
                  ? { scale: 0.88, y: 36, opacity: 0.9 }
                  : false
          }
          animate={{ scale: 1, y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 340, damping: 19, mass: 0.62 }}
          className="relative flex flex-col items-center justify-center"
          style={{ transformOrigin: "50% 60%" }}
        >
        <motion.div
          ref={creatureRootRef}
          className="relative flex flex-col items-center justify-center"
          style={{
            scaleX: smoothStretchX,
            scaleY: smoothStretchY,
            filter: creatureFilter ?? undefined,
            transformOrigin: "50% 60%"
          }}
        >
        <motion.div
          initial={false}
          animate={healPulseKey ? { scale: [1, 1.12, 0.98, 1], y: [0, -4, 0] } : petJumpKey ? { y: [0, -20, 0] } : { y: 0 }}
          transition={{ duration: healPulseKey ? 0.9 : 0.35, ease: "easeOut" }}
          className="flex items-center justify-center"
        >
          {stage === "egg" ? (
            <motion.div
              variants={wobbleVariants}
              animate={hatchPhase === "shake" ? "shake" : eggShouldWobble ? "wobble" : "idle"}
              transition={
                hatchPhase === "shake"
                  ? { duration: 0.55, ease: "easeInOut" }
                  : { duration: 2.2, repeat: Infinity, ease: "easeInOut" }
              }
            >
              <EggStateArt src={eggAsset} />
            </motion.div>
          ) : (
            <motion.div
              variants={breatheForBody}
              initial={false}
              className="relative"
              animate={
                isExcited
                  ? { scale: [1, 1.1, 1.05], y: [0, -10, 0] }
                  : petToolPrimed && !isSick
                    ? { scaleY: [1, 0.94, 1], scaleX: [1, 1.03, 1], y: [0, -1, 0] }
                    : "idle"
              }
              style={petToolPrimed && !isExcited ? { transformOrigin: "center 60%" } : undefined}
              transition={
                isExcited
                  ? { duration: 0.55, ease: "easeOut" }
                  : petToolPrimed && !isSick
                    ? { duration: 2.2, repeat: Infinity, ease: "easeInOut" }
                    : { duration: breatheDuration, ease: "easeInOut", repeat: Infinity }
              }
            >
              {petToolPrimed && !isSick && (
                <div
                  className="pointer-events-none absolute left-1/2 top-[10%] z-20 -translate-x-1/2 text-2xl opacity-95 drop-shadow-md"
                  aria-hidden
                >
                  😌
                </div>
              )}
              <PleadingOverlay active={pleadForFood && !isSick} hunger={hunger} />
              <ReactionOverlay activityReaction={activityReaction} />
              {zenMeditate && !isSick && (
                <div
                  className="pointer-events-none absolute left-1/2 top-[-6%] z-[22] -translate-x-1/2 text-xl opacity-90"
                  aria-hidden
                >
                  🧘
                </div>
              )}
              {!isSick && (
                <div
                  className="pointer-events-none absolute left-[31%] top-[28%] z-[24] h-2 w-2 rounded-full bg-slate-900/85 sm:left-[32%] sm:top-[29%]"
                  style={{ transform: `translate(${eyeGaze.ox}px, ${eyeGaze.oy}px)` }}
                  aria-hidden
                />
              )}
              {!isSick && (
                <div
                  className="pointer-events-none absolute right-[31%] top-[28%] z-[24] h-2 w-2 rounded-full bg-slate-900/85 sm:right-[32%] sm:top-[29%]"
                  style={{ transform: `translate(${eyeGaze.ox}px, ${eyeGaze.oy}px)` }}
                  aria-hidden
                />
              )}
              {poopIds.length > 0 ? (
                <div className="pointer-events-none absolute -bottom-[6%] left-1/2 z-[15] flex max-w-[min(100%,200px)] -translate-x-1/2 items-end justify-center gap-0.5 sm:-bottom-[4%]">
                  <AnimatePresence>
                    {poopIds.map((id) => (
                      <motion.div
                        key={id}
                        initial={{ opacity: 0, scale: 0.45, y: 14 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.75, y: 8 }}
                        transition={{ type: "spring", stiffness: 420, damping: 24 }}
                        className="w-[40px] shrink-0 sm:w-[48px]"
                        aria-hidden
                      >
                        <Image
                          src="/assets/poop.png"
                          alt=""
                          width={72}
                          height={72}
                          className="h-auto w-full object-contain drop-shadow-[0_4px_10px_rgba(15,23,42,0.35)]"
                          unoptimized
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              ) : null}
              <motion.div
                key={feedSquashNonce}
                className="relative inline-block"
                style={{ transformOrigin: "center 62%" }}
                initial={false}
                animate={
                  feedSquashNonce > 0
                    ? { scaleX: [1, 1.14, 0.86, 1.06, 1], scaleY: [1, 0.82, 1.12, 0.95, 1] }
                    : { scaleX: 1, scaleY: 1 }
                }
                transition={{ duration: 0.55, ease: [0.34, 1.5, 0.64, 1] }}
              >
              <motion.div
                key={happyDanceNonce}
                className="relative"
                initial={happyDanceNonce === 0 ? false : { rotate: 0, scale: 1 }}
                animate={
                  happyDanceNonce > 0
                    ? { rotate: [0, -14, 14, -10, 10, 0], scale: [1, 1.12, 1.06, 1.1, 1] }
                    : { rotate: 0, scale: 1 }
                }
                transition={{ duration: 0.85, ease: "easeInOut" }}
              >
                <AnimatePresence mode="sync" initial={false}>
                  <motion.div
                    key={`${stage}-${isSick ? "sick" : "well"}-${useDefaultBabyAsset ? "default" : "evo"}`}
                    initial={{ opacity: 0, scale: 0.94, y: 8 }}
                    animate={isNearDrop ? { opacity: 1, scale: [1, 1.08, 1.02], y: [0, -4, 0] } : { opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 1.04, y: -6 }}
                    transition={{ duration: 0.65, ease: [0.4, 0, 0.2, 1] }}
                  >
                    {isSick ? (
                      <SickCreatureArt />
                    ) : stage === "baby" && useDefaultBabyAsset ? (
                      <DefaultBabyArt />
                    ) : (
                      <CreatureSprite stage={stage} />
                    )}
                  </motion.div>
                </AnimatePresence>
              </motion.div>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
        {cosmeticHatEmoji ? (
          <div
            className="pointer-events-none absolute left-1/2 top-[6%] z-50 -translate-x-1/2 text-[2.6rem] leading-none sm:text-[2.85rem]"
            style={{ filter: "none" }}
            aria-hidden
          >
            {cosmeticHatEmoji}
          </div>
        ) : null}
        </motion.div>
        </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
