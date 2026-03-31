"use client";

import type { EggType, PetState } from "@/lib/game";
import { clampStat, deriveMood } from "@/lib/petMath";
import { getSupabaseClient } from "@/lib/supabase";

const PLAYER_ID_KEY = "bia-player-id-v1";
const PET_NAME = "Bia";

type DbPetRow = {
  player_id: string;
  name: string;
  egg_type: EggType;
  hunger: number;
  energy: number;
  joy: number;
  hygiene: number;
  bond: number;
  stage: PetState["stage"];
  last_updated_at: string;
};

const OFFLINE_DECAY_PER_HOUR = {
  hunger: 4,
  energy: 3,
  joy: 2,
  hygiene: 2
} as const;

function getPlayerId(): string {
  if (typeof window === "undefined") {
    return "local-player";
  }

  const existing = window.localStorage.getItem(PLAYER_ID_KEY);
  if (existing) {
    return existing;
  }

  const created = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `player-${Date.now()}`;
  window.localStorage.setItem(PLAYER_ID_KEY, created);
  return created;
}

function rowToPet(row: DbPetRow): PetState {
  const pet: PetState = {
    hunger: row.hunger,
    energy: row.energy,
    joy: row.joy,
    hygiene: row.hygiene,
    xp: row.bond,
    stage: row.stage,
    eggType: row.egg_type,
    status: "happy"
  };

  return { ...pet, status: deriveMood(pet) };
}

function petToRow(pet: PetState): DbPetRow {
  return {
    player_id: getPlayerId(),
    name: PET_NAME,
    egg_type: pet.eggType,
    hunger: pet.hunger,
    energy: pet.energy,
    joy: pet.joy,
    hygiene: pet.hygiene,
    bond: pet.xp,
    stage: pet.stage,
    last_updated_at: new Date().toISOString()
  };
}

export function applyOfflineDecay(pet: PetState, lastUpdatedAt: string, now = Date.now()): PetState {
  const lastUpdatedMs = new Date(lastUpdatedAt).getTime();
  if (!Number.isFinite(lastUpdatedMs)) {
    return pet;
  }

  const elapsedHours = Math.max(0, (now - lastUpdatedMs) / 3_600_000);
  const next: PetState = { ...pet };

  next.hunger = clampStat(next.hunger - elapsedHours * OFFLINE_DECAY_PER_HOUR.hunger);
  next.energy = clampStat(next.energy - elapsedHours * OFFLINE_DECAY_PER_HOUR.energy);
  next.joy = clampStat(next.joy - elapsedHours * OFFLINE_DECAY_PER_HOUR.joy);
  next.hygiene = clampStat(next.hygiene - elapsedHours * OFFLINE_DECAY_PER_HOUR.hygiene);
  next.status = deriveMood(next);
  return next;
}

export async function saveGameState(pet: PetState): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return;
  }

  const payload = petToRow(pet);
  const { error } = await supabase.from("pets").upsert(payload, { onConflict: "player_id" });
  if (error) {
    console.error("Failed to save pet state", error);
  }
}

export async function loadGameState(): Promise<{ pet: PetState; lastUpdatedAt: string } | null> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("pets")
    .select("player_id,name,egg_type,hunger,energy,joy,hygiene,bond,stage,last_updated_at")
    .eq("player_id", getPlayerId())
    .maybeSingle<DbPetRow>();

  if (error) {
    console.error("Failed to load pet state", error);
    return null;
  }

  if (!data) {
    return null;
  }

  return {
    pet: rowToPet(data),
    lastUpdatedAt: data.last_updated_at
  };
}
