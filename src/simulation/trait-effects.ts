import { Player } from '../types';

// Trait effects that modify match engine outcomes
export interface TraitEffect {
  trait?: string;
  // Multipliers applied to relevant calculations
  shotAccuracy?: number;    // Multiplies shot on-target chance
  shotPower?: number;       // Multiplies goal chance
  passAccuracy?: number;    // Multiplies pass completion
  passCreativity?: number;  // Multiplies assist chance
  dribbleSuccess?: number;  // Multiplies dribble success
  tackleSuccess?: number;   // Multiplies tackle success
  aerialAbility?: number;   // Multiplies header/aerial duel success
  setPieceAccuracy?: number;// Multiplies free kick/corner accuracy
  offBallMovement?: number; // Multiplies chance of being in right position
  composure?: number;       // Multiplies composure in key moments
  aggression?: number;      // Multiplies foul chance (higher = more fouls)
  staminaDrain?: number;    // Multiplies stamina drain rate
}

// Map trait strings to their mechanical effects
const TRAIT_EFFECTS: Record<string, TraitEffect> = {
  'Likes to try long range shots': { shotAccuracy: 0.9, shotPower: 1.15, offBallMovement: 1.05 },
  'Shoots from distance': { shotAccuracy: 0.85, shotPower: 1.2 },
  'Tries first time shots': { shotAccuracy: 1.1, shotPower: 0.95, composure: 1.1 },
  'Likes to lob keeper': { shotAccuracy: 0.8, shotPower: 1.1, composure: 1.15 },
  'Plays one-twos': { passAccuracy: 1.1, passCreativity: 1.15, offBallMovement: 1.1 },
  'Plays through balls': { passCreativity: 1.25, passAccuracy: 1.05 },
  'Likes to switch ball': { passAccuracy: 1.1, passCreativity: 1.1 },
  'Comes deep to get ball': { offBallMovement: 1.15, passAccuracy: 1.05 },
  'Runs with ball often': { dribbleSuccess: 1.2, offBallMovement: 1.1, staminaDrain: 1.1 },
  'Cuts inside': { dribbleSuccess: 1.15, shotAccuracy: 1.1 },
  'Hugs the line': { offBallMovement: 1.1, passCreativity: 1.1 },
  'Dives into tackles': { tackleSuccess: 1.2, aggression: 1.3 },
  'Marks opponent tightly': { tackleSuccess: 1.15, offBallMovement: 1.1 },
  'Tries to beat offside trap': { offBallMovement: 1.2, shotPower: 1.05 },
  'Gets into opposition area': { offBallMovement: 1.2, shotAccuracy: 1.05 },
  'Makes late runs into the box': { offBallMovement: 1.25, shotPower: 1.1 },
  'Argues with officials': { aggression: 1.4, composure: 0.9 },
  'Leaders on the pitch': { composure: 1.15, passAccuracy: 1.05 },
  'Plays short corners': { setPieceAccuracy: 1.1, passAccuracy: 1.05 },
  'Stays back at set pieces': { tackleSuccess: 1.1, offBallMovement: 0.9 },
  'Knocks ball past opponent': { dribbleSuccess: 1.2, offBallMovement: 1.1 },
  'Tries overhead kicks': { shotPower: 1.15, aerialAbility: 1.2, shotAccuracy: 0.85 },
  'Comes short to link play': { passAccuracy: 1.1, offBallMovement: 1.1 },
  'Likes to round keeper': { dribbleSuccess: 1.15, shotPower: 1.1, composure: 1.1 },
  'Plays with back to goal': { passAccuracy: 1.1, aerialAbility: 1.15 },
  'Likes to try skills and tricks': { dribbleSuccess: 1.25, passAccuracy: 0.95 },
  'Tends to hold up the ball': { passAccuracy: 1.1, aerialAbility: 1.1, staminaDrain: 0.95 },
  'Winds up opponents': { aggression: 1.2, composure: 1.05 },
  'Retains possession rather than risk pass': { passAccuracy: 1.15, passCreativity: 0.85 },
  'Pushes forward at every opportunity': { offBallMovement: 1.2, staminaDrain: 1.15 },
  'Sits on shoulder of last defender': { offBallMovement: 1.2, shotPower: 1.05 },
  'Drops deep to collect ball from defence': { passAccuracy: 1.1, offBallMovement: 1.1 },
  'Likes to close down opponents': { tackleSuccess: 1.15, staminaDrain: 1.1 },
  'Plays the final ball': { passCreativity: 1.3, passAccuracy: 1.05 },
};

export function getTraitEffects(player: Player): TraitEffect[] {
  return player.traits
    .map((t) => TRAIT_EFFECTS[t])
    .filter((e): e is TraitEffect => e !== undefined);
}

// Compute aggregate multipliers for a player based on all their traits
export function computeTraitMultipliers(player: Player): Required<TraitEffect> {
  const effects = getTraitEffects(player);
  const base: Required<TraitEffect> = {
    trait: '',
    shotAccuracy: 1.0,
    shotPower: 1.0,
    passAccuracy: 1.0,
    passCreativity: 1.0,
    dribbleSuccess: 1.0,
    tackleSuccess: 1.0,
    aerialAbility: 1.0,
    setPieceAccuracy: 1.0,
    offBallMovement: 1.0,
    composure: 1.0,
    aggression: 1.0,
    staminaDrain: 1.0,
  };

  for (const effect of effects) {
    if (effect.shotAccuracy) base.shotAccuracy *= effect.shotAccuracy;
    if (effect.shotPower) base.shotPower *= effect.shotPower;
    if (effect.passAccuracy) base.passAccuracy *= effect.passAccuracy;
    if (effect.passCreativity) base.passCreativity *= effect.passCreativity;
    if (effect.dribbleSuccess) base.dribbleSuccess *= effect.dribbleSuccess;
    if (effect.tackleSuccess) base.tackleSuccess *= effect.tackleSuccess;
    if (effect.aerialAbility) base.aerialAbility *= effect.aerialAbility;
    if (effect.setPieceAccuracy) base.setPieceAccuracy *= effect.setPieceAccuracy;
    if (effect.offBallMovement) base.offBallMovement *= effect.offBallMovement;
    if (effect.composure) base.composure *= effect.composure;
    if (effect.aggression) base.aggression *= effect.aggression;
    if (effect.staminaDrain) base.staminaDrain *= effect.staminaDrain;
  }

  return base;
}

// Apply trait multipliers to a shot calculation
export function applyShotTraits(baseGoalChance: number, baseOnTarget: number, player: Player): { goalChance: number; onTarget: number } {
  const m = computeTraitMultipliers(player);
  return {
    goalChance: Math.min(0.95, baseGoalChance * m.shotPower * m.composure),
    onTarget: Math.min(0.95, baseOnTarget * m.shotAccuracy),
  };
}

// Apply trait multipliers to a pass calculation
export function applyPassTraits(basePassSuccess: number, player: Player): number {
  const m = computeTraitMultipliers(player);
  return Math.min(0.98, basePassSuccess * m.passAccuracy);
}

// Apply trait multipliers to a tackle calculation
export function applyTackleTraits(baseTackleSuccess: number, player: Player): { success: number; foulChance: number } {
  const m = computeTraitMultipliers(player);
  return {
    success: Math.min(0.95, baseTackleSuccess * m.tackleSuccess),
    foulChance: Math.min(0.5, 0.15 * m.aggression),
  };
}

// Apply trait multipliers to a dribble calculation
export function applyDribbleTraits(baseDribbleSuccess: number, player: Player): number {
  const m = computeTraitMultipliers(player);
  return Math.min(0.95, baseDribbleSuccess * m.dribbleSuccess);
}
