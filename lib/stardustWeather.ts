/** Rotating “room weather” for soft retention — no push notifications. */

export type RoomWeatherId = "calm" | "meteor_shower";

const STORAGE_KEY = "bia-stardust-weather-v1";
const ROTATION_MS = 4 * 60 * 60 * 1000;

type Stored = {
  /** Epoch ms when current weather started */
  since: number;
  /** Index into cycle */
  cycleIndex: number;
};

const CYCLE: RoomWeatherId[] = ["calm", "calm", "meteor_shower", "calm"];

function load(): Stored {
  if (typeof window === "undefined") {
    return { since: Date.now(), cycleIndex: 0 };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const s: Stored = { since: Date.now(), cycleIndex: 0 };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
      return s;
    }
    return JSON.parse(raw) as Stored;
  } catch {
    return { since: Date.now(), cycleIndex: 0 };
  }
}

function save(s: Stored) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

/** Advance weather if 4h+ elapsed; returns current id and ms until next rotation. */
export function getStardustWeather(now = Date.now()): {
  weather: RoomWeatherId;
  msUntilNext: number;
} {
  let s = load();
  let elapsed = now - s.since;
  while (elapsed >= ROTATION_MS) {
    s = {
      since: s.since + ROTATION_MS,
      cycleIndex: (s.cycleIndex + 1) % CYCLE.length
    };
    elapsed = now - s.since;
  }
  save(s);
  const weather = CYCLE[s.cycleIndex] ?? "calm";
  return { weather, msUntilNext: ROTATION_MS - elapsed };
}
