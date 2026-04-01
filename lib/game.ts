export type PetStage = "egg" | "baby" | "teen" | "adult";
export type EggType = "pink" | "blue" | "gold";

export type PetMood = "happy" | "distressed" | "blissful" | "sick";

export type PetState = {
  name: string;
  hunger: number;
  energy: number;
  joy: number;
  hygiene: number;
  xp: number;
  status: PetMood;
  stage: PetStage;
  eggType: EggType;
};

export const initialPetState: PetState = {
  name: "Bia",
  hunger: 100,
  energy: 100,
  joy: 100,
  hygiene: 100,
  xp: 0,
  status: "happy",
  stage: "egg",
  eggType: "pink"
};

export const PET_STORAGE_KEY = "bia-pet-engine-v1";
