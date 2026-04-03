"use client";

import { useEffect, useRef, useState } from "react";

const IDLE_MS = 90_000;

/** Finger position for eye tracking; resets zen timer on activity. */
export function useGlobalFingerAndIdle(enabled: boolean) {
  const [finger, setFinger] = useState<{ x: number; y: number } | null>(null);
  const [zenMeditate, setZenMeditate] = useState(false);
  const lastActivityRef = useRef(Date.now());

  const bumpActivity = () => {
    lastActivityRef.current = Date.now();
    setZenMeditate(false);
  };

  useEffect(() => {
    if (!enabled) {
      setFinger(null);
      return;
    }
    const onMove = (e: PointerEvent) => {
      setFinger({ x: e.clientX, y: e.clientY });
    };
    const onDown = () => bumpActivity();
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    const id = window.setInterval(() => {
      if (document.hidden) return;
      if (Date.now() - lastActivityRef.current > IDLE_MS) {
        setZenMeditate(true);
      }
    }, 4000);
    return () => window.clearInterval(id);
  }, [enabled]);

  return { finger, zenMeditate, bumpActivity };
}
