"use client";

import { useEffect } from "react";
import { useMotionValue, useSpring, type MotionValue } from "framer-motion";

const MAX_OFFSET_PX = 18;

export type TiltParallaxMotion = {
  x: MotionValue<number>;
  y: MotionValue<number>;
};

/**
 * Smooth parallax offset from device tilt (gamma/beta). Falls back to zero on desktop
 * or when orientation events are unavailable. iOS may require a user gesture before
 * `deviceorientation` fires; until then offsets stay at rest.
 */
export function useTiltParallax(enabled: boolean): TiltParallaxMotion {
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 72, damping: 24, mass: 0.85 });
  const y = useSpring(rawY, { stiffness: 72, damping: 24, mass: 0.85 });

  useEffect(() => {
    if (!enabled) {
      rawX.set(0);
      rawY.set(0);
    }
  }, [enabled, rawX, rawY]);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") {
      return;
    }

    const handler = (e: DeviceOrientationEvent) => {
      const gx = Math.max(-1, Math.min(1, (e.gamma ?? 0) / 42));
      const gy = Math.max(-1, Math.min(1, ((e.beta ?? 0) - 38) / 42));
      rawX.set(gx * MAX_OFFSET_PX);
      rawY.set(gy * MAX_OFFSET_PX);
    };

    window.addEventListener("deviceorientation", handler);
    return () => window.removeEventListener("deviceorientation", handler);
  }, [enabled, rawX, rawY]);

  return { x, y };
}
