"use client";

import { Sprite, type SpritePartName } from "@/components/Sprite";

type PetSpriteProps = {
  partName: Extract<SpritePartName, "baby" | "juvenile" | "adult">;
  className?: string;
};

/**
 * Displays only the creature from the sprite sheet.
 * The sprite sheet already has transparency around the creature art,
 * so this component intentionally avoids blend/mask tricks that can
 * introduce halos or clip the character.
 */
export function PetSprite({ partName, className = "" }: PetSpriteProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Sprite
        partName={partName}
        className="absolute inset-0 h-full w-full bg-contain bg-center bg-no-repeat"
        style={{
          filter: "drop-shadow(0 12px 18px rgba(122, 111, 174, 0.18))"
        }}
      />
    </div>
  );
}
