"use client";

import type { CSSProperties } from "react";

type SpriteRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

export type SpritePartName =
  | "baby"
  | "juvenile"
  | "adult"
  | "nursery"
  | "sleepRoom"
  | "garden"
  | "bath"
  | "berries"
  | "mooncake"
  | "soup"
  | "cloudBed"
  | "crystalPod"
  | "hamperBed"
  | "meteorBall"
  | "zeroGyYoYo"
  | "sparkStick";

const SPRITE_SHEET_URL = "/assets/all.png";

/**
 * Percent-based crop rectangles over public/assets/all.png.
 * These are tuned from the current sprite sheet and can be refined
 * later without changing component callers.
 */
export const SPRITE_MAP: Record<SpritePartName, SpriteRect> = {
  baby: { left: 13.6, top: 8.6, width: 14.6, height: 19.2 },
  juvenile: { left: 42.8, top: 7.8, width: 15.2, height: 20.2 },
  adult: { left: 62.6, top: 6.8, width: 30.4, height: 21.4 },
  nursery: { left: 2.2, top: 39.5, width: 20.2, height: 24.0 },
  sleepRoom: { left: 26.2, top: 39.5, width: 23.1, height: 24.0 },
  garden: { left: 50.6, top: 39.5, width: 23.2, height: 24.0 },
  bath: { left: 74.5, top: 39.5, width: 22.9, height: 24.0 },
  berries: { left: 3.4, top: 78.2, width: 7.8, height: 13.2 },
  mooncake: { left: 13.3, top: 77.4, width: 8.4, height: 13.9 },
  soup: { left: 22.8, top: 77.5, width: 10.0, height: 14.1 },
  cloudBed: { left: 35.4, top: 77.6, width: 8.8, height: 13.9 },
  crystalPod: { left: 47.1, top: 76.8, width: 7.2, height: 15.9 },
  hamperBed: { left: 55.8, top: 77.6, width: 10.0, height: 13.9 },
  meteorBall: { left: 68.8, top: 77.9, width: 8.7, height: 13.2 },
  zeroGyYoYo: { left: 79.4, top: 77.4, width: 9.2, height: 14.1 },
  sparkStick: { left: 91.1, top: 77.6, width: 7.2, height: 13.9 }
};

function toBackgroundPosition(rect: SpriteRect) {
  const x = rect.left / (100 - rect.width);
  const y = rect.top / (100 - rect.height);

  return `${x * 100}% ${y * 100}%`;
}

function toBackgroundSize(rect: SpriteRect) {
  return `${10000 / rect.width}% ${10000 / rect.height}%`;
}

export function getSpriteStyle(partName: SpritePartName): CSSProperties {
  const rect = SPRITE_MAP[partName];

  return {
    backgroundImage: `url("${SPRITE_SHEET_URL}")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: toBackgroundPosition(rect),
    backgroundSize: toBackgroundSize(rect)
  };
}

type SpriteProps = {
  partName: SpritePartName;
  className?: string;
  style?: CSSProperties;
  rounded?: boolean;
};

export function Sprite({ partName, className = "", style, rounded = false }: SpriteProps) {
  return (
    <div
      aria-hidden
      className={`${rounded ? "rounded-xl" : ""} bg-transparent ${className}`}
      style={{
        ...getSpriteStyle(partName),
        ...style
      }}
    />
  );
}
