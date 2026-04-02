const META_KEY = "bia-player-meta-v1";

export type CareStyle = "cuddle" | "play" | "balanced";

export type PlayerMeta = {
  carePetCount: number;
  careFeedCount: number;
  carePlayCount: number;
  stardust: number;
  memoryKeys: string[];
  lastDailyGiftYmd: string | null;
};

const defaultMeta: PlayerMeta = {
  carePetCount: 0,
  careFeedCount: 0,
  carePlayCount: 0,
  stardust: 0,
  memoryKeys: [],
  lastDailyGiftYmd: null
};

export function loadPlayerMeta(): PlayerMeta {
  if (typeof window === "undefined") {
    return { ...defaultMeta };
  }
  try {
    const raw = localStorage.getItem(META_KEY);
    if (!raw) {
      return { ...defaultMeta };
    }
    const parsed = JSON.parse(raw) as Partial<PlayerMeta>;
    return {
      ...defaultMeta,
      ...parsed,
      memoryKeys: Array.isArray(parsed.memoryKeys) ? parsed.memoryKeys : []
    };
  } catch {
    return { ...defaultMeta };
  }
}

export function savePlayerMeta(meta: PlayerMeta): void {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.setItem(META_KEY, JSON.stringify(meta));
}

export function deriveCareStyle(meta: Pick<PlayerMeta, "carePetCount" | "careFeedCount" | "carePlayCount">): CareStyle {
  const { carePetCount: p, careFeedCount: f, carePlayCount: pl } = meta;
  const max = Math.max(p, f, pl, 1);
  if (p >= max && p > f + pl) {
    return "cuddle";
  }
  if (pl >= max && pl > p) {
    return "play";
  }
  return "balanced";
}

export function careStyleLabel(style: CareStyle): string {
  switch (style) {
    case "cuddle":
      return "Cuddle wings";
    case "play":
      return "Star horns";
    default:
      return "Balanced bond";
  }
}

export function todayYmd(): string {
  return new Date().toISOString().slice(0, 10);
}
