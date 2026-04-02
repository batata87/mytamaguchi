"use client";

import type { EggType, PetState } from "@/lib/game";
import { applyOfflineCatchUp, deriveMood } from "@/lib/petMath";
import { getSupabaseClient } from "@/lib/supabase";

const PLAYER_ID_KEY = "bia-player-id-v1";
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
    name: row.name,
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
    name: pet.name,
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

/** Remote sync: same delta-time decay + offline safety floor as local storage. */
export function applyOfflineDecay(pet: PetState, lastUpdatedAt: string, now = Date.now()): PetState {
  const lastUpdatedMs = new Date(lastUpdatedAt).getTime();
  if (!Number.isFinite(lastUpdatedMs)) {
    return pet;
  }
  const elapsedMs = Math.max(0, now - lastUpdatedMs);
  return applyOfflineCatchUp(pet, elapsedMs);
}

export async function saveGameState(pet: PetState): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return;
  }

  const payload = petToRow(pet);
  const { error } = await supabase.from("pets").upsert(payload, { onConflict: "player_id" });
  if (error) {
    console.error("Failed to save pet state", {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint
    });
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
    console.error("Failed to load pet state", {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint
    });
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
