"use client";

import { useEffect, useRef } from "react";
import type { PetState } from "@/lib/game";
import { wallClockMsUntilHungerAtOrBelow } from "@/lib/petMath";

/** Aligns with in-game "plead for food" / distressed band. */
export const HUNGER_NOTIFY_THRESHOLD = 20;

export const HUNGER_NOTIFY_BODY =
  "I'm getting a bit lonely in the kitchen... got any Mooncakes?";

type Args = {
  pet: PetState;
  isReady: boolean;
  needsEggChoice: boolean;
  /** From `Notification.permission` — include so granting permission re-runs scheduling. */
  notificationPermission: NotificationPermission;
};

/**
 * When the tab is hidden, schedules a one-shot timer matching passive hunger decay
 * so a system notification can fire near the moment hunger crosses the threshold.
 * Requires notificationPermission === "granted" (request via a user gesture).
 */
export function useHungerNotification({ pet, isReady, needsEggChoice, notificationPermission }: Args) {
  const petRef = useRef(pet);
  petRef.current = pet;
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isReady || needsEggChoice || typeof window === "undefined" || typeof Notification === "undefined") {
      return;
    }

    const clearTimer = () => {
      if (timerRef.current != null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };

    const scheduleFromHidden = () => {
      clearTimer();
      if (document.visibilityState !== "hidden" || notificationPermission !== "granted") {
        return;
      }
      const p = petRef.current;
      if (p.stage === "egg") {
        return;
      }
      const ms = wallClockMsUntilHungerAtOrBelow(p.hunger, HUNGER_NOTIFY_THRESHOLD);
      if (ms == null) {
        return;
      }

      timerRef.current = window.setTimeout(() => {
        timerRef.current = null;
        if (document.visibilityState !== "hidden") {
          return;
        }
        const latest = petRef.current;
        if (latest.stage === "egg") {
          return;
        }
        if (latest.hunger <= HUNGER_NOTIFY_THRESHOLD) {
          try {
            new Notification("Bia", {
              body: HUNGER_NOTIFY_BODY,
              icon: "/favicon.ico",
              tag: "bia-hunger"
            });
          } catch {
            // ignored
          }
        }
      }, ms);
    };

    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        scheduleFromHidden();
      } else {
        clearTimer();
      }
    };

    document.addEventListener("visibilitychange", onVisibility);
    if (document.visibilityState === "hidden") {
      scheduleFromHidden();
    }

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      clearTimer();
    };
  }, [isReady, needsEggChoice, pet.hunger, pet.stage, notificationPermission]);
}
