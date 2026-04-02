export type SubItem = {
  id: string;
  label: string;
  emoji: string;
};

export const STAR_ELIXIR_ITEM: SubItem = {
  id: "star-elixir",
  label: "Star Elixir",
  emoji: "🧪"
};

/** Diegetic food & care variants — drag a sub-item onto the creature. */
export const ACTIVITY_SUBMENUS: Record<"feed" | "sleep" | "play" | "clean", SubItem[]> = {
  feed: [
    { id: "berries", label: "Stellar Berries", emoji: "🫐" },
    { id: "mooncake", label: "Mooncake", emoji: "🥮" },
    { id: "soup", label: "Bia Soup", emoji: "🍲" }
  ],
  sleep: [
    { id: "catnap", label: "Cloud Catnap", emoji: "☁️" },
    { id: "starlight", label: "Starlight Slumber", emoji: "✦" },
    { id: "dream", label: "Dream Veil", emoji: "🌙" }
  ],
  play: [
    { id: "orbit", label: "Orbit Ball", emoji: "🪐" },
    { id: "comet", label: "Comet Chase", emoji: "☄️" },
    { id: "starhop", label: "Star Hops", emoji: "⭐" }
  ],
  clean: [
    { id: "mist", label: "Mist Spray", emoji: "💨" },
    { id: "sparkle", label: "Sparkle Bath", emoji: "✨" },
    { id: "nebula", label: "Bia Rinse", emoji: "🫧" }
  ]
};

export type CareAction = "feed" | "sleep" | "play" | "clean";

export type CravingPick = {
  action: CareAction;
  id: string;
  label: string;
  emoji: string;
};

/** Random micro-craving for emotional "I want this now" moments. */
export function randomCravingPick(): CravingPick {
  const actions: CareAction[] = ["feed", "sleep", "play", "clean"];
  const action = actions[Math.floor(Math.random() * actions.length)]!;
  const list = ACTIVITY_SUBMENUS[action];
  const item = list[Math.floor(Math.random() * list.length)]!;
  return { action, id: item.id, label: item.label, emoji: item.emoji };
}
