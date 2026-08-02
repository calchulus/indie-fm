// Player decision-making AI
// Determines what action the ball carrier takes based on context:
// position, attributes, zone, and game state.

import { Player } from '../types';

export type ActionType = 'pass' | 'dribble' | 'shot' | 'cross' | 'through_ball' | 'hold';

export interface ActionProbabilities {
  pass: number;
  dribble: number;
  shot: number;
  cross: number;
  through_ball: number;
  hold: number;
}

// Compute context-aware action probabilities for the ball carrier
export function computeActionProbabilities(
  carrier: Player,
  zone: 'defense' | 'midfield' | 'attack',
  atkStrength: number,
  defStrength: number,
  isWide: boolean,
): ActionProbabilities {
  const attrs = carrier.attributes;
  const pressureRatio = defStrength / (atkStrength + defStrength);

  // Base probabilities by zone
  let probs: ActionProbabilities;
  if (zone === 'attack') {
    probs = { pass: 0.20, dribble: 0.15, shot: 0.35, cross: 0.10, through_ball: 0.10, hold: 0.10 };
  } else if (zone === 'midfield') {
    probs = { pass: 0.40, dribble: 0.15, shot: 0.10, cross: 0.05, through_ball: 0.20, hold: 0.10 };
  } else {
    probs = { pass: 0.55, dribble: 0.10, shot: 0.02, cross: 0.03, through_ball: 0.10, hold: 0.20 };
  }

  // Attribute-based adjustments
  // High finishing + composure → more shots in attack
  if (zone === 'attack') {
    const shotBias = (attrs.finishing + attrs.composure) / 40; // 0-1
    probs.shot *= 0.7 + shotBias * 0.6;
    probs.hold *= 1.2 - shotBias * 0.4;
  }

  // High vision + passing → more through balls and passes
  const playmakerBias = (attrs.vision + attrs.passing) / 40;
  probs.through_ball *= 0.6 + playmakerBias * 0.8;
  probs.pass *= 0.8 + playmakerBias * 0.4;

  // High dribbling + pace + agility → more dribbles
  const dribbleBias = (attrs.dribbling + attrs.pace + attrs.agility) / 60;
  probs.dribble *= 0.5 + dribbleBias * 1.0;

  // Wide players cross more
  if (isWide) {
    const crossBias = attrs.crossing / 20;
    probs.cross *= 1.0 + crossBias * 1.5;
    probs.shot *= 0.6; // less likely to shoot from wide
  }

  // Under pressure → less time on ball, more passes, fewer dribbles
  if (pressureRatio > 0.55) {
    probs.pass *= 1.3;
    probs.dribble *= 0.6;
    probs.hold *= 0.5;
    probs.shot *= 0.8;
  }

  // Low decisions attribute → more random/suboptimal choices
  const decisionQuality = attrs.decisions / 20;
  if (decisionQuality < 0.5) {
    // Flatten probabilities toward uniform (worse decisions)
    const uniform = 1 / 6;
    const blend = 1 - decisionQuality; // 0.5-1.0 blend toward uniform
    probs = {
      pass: probs.pass * (1 - blend * 0.5) + uniform * blend * 0.5,
      dribble: probs.dribble * (1 - blend * 0.5) + uniform * blend * 0.5,
      shot: probs.shot * (1 - blend * 0.5) + uniform * blend * 0.5,
      cross: probs.cross * (1 - blend * 0.5) + uniform * blend * 0.5,
      through_ball: probs.through_ball * (1 - blend * 0.5) + uniform * blend * 0.5,
      hold: probs.hold * (1 - blend * 0.5) + uniform * blend * 0.5,
    };
  }

  // Normalize
  const total = probs.pass + probs.dribble + probs.shot + probs.cross + probs.through_ball + probs.hold;
  return {
    pass: probs.pass / total,
    dribble: probs.dribble / total,
    shot: probs.shot / total,
    cross: probs.cross / total,
    through_ball: probs.through_ball / total,
    hold: probs.hold / total,
  };
}

// Roll an action from the probability distribution
export function rollAction(probs: ActionProbabilities): ActionType {
  const roll = Math.random();
  let cumulative = 0;
  const entries: Array<[ActionType, number]> = [
    ['pass', probs.pass],
    ['dribble', probs.dribble],
    ['shot', probs.shot],
    ['cross', probs.cross],
    ['through_ball', probs.through_ball],
    ['hold', probs.hold],
  ];
  for (const [action, prob] of entries) {
    cumulative += prob;
    if (roll < cumulative) return action;
  }
  return 'pass';
}

// Passing quality: distance and pressure modifiers
export function computePassDifficulty(
  passer: Player,
  distance: number, // 0-100 normalized pitch distance
  pressingIntensity: number, // 0.8-1.5 from pressing modifier
): { successMod: number; description: string } {
  // Short passes (dist < 20) are easy; long passes (dist > 60) are hard
  let distanceMod: number;
  if (distance < 20) distanceMod = 1.05;
  else if (distance < 40) distanceMod = 1.0;
  else if (distance < 60) distanceMod = 0.88;
  else distanceMod = 0.72;

  // Passer's passing + vision + technique mitigate distance penalty
  const passerQuality = (passer.attributes.passing + passer.attributes.vision + passer.attributes.technique) / 60;
  distanceMod = distanceMod + (1 - distanceMod) * passerQuality * 0.5;

  // Pressing reduces success
  const pressMod = 1.15 - pressingIntensity * 0.2;

  const successMod = distanceMod * pressMod;
  const description = distance > 60 ? 'long ball' : distance > 40 ? 'medium pass' : 'short pass';
  return { successMod, description };
}

// Goalkeeper AI: enhanced save logic
export interface GKDecision {
  action: 'catch' | 'punch' | 'parry' | 'dive';
  saveChance: number;
  reboundChance: number;
  distributionQuality: number;
}

export function computeGKDecision(
  gk: Player,
  shotPower: number, // 0-1 normalized
  shotPlacement: number, // 0-1 (0 = central, 1 = corner)
  isOneOnOne: boolean,
): GKDecision {
  const reflexes = gk.attributes.reflexes / 20;
  const handling = gk.attributes.handling / 20;
  const positioning = gk.attributes.positioning / 20;
  const oneOnOnes = gk.attributes.oneOnOnes / 20;
  const aerialReach = gk.attributes.aerialReach / 20;

  // Base save chance from attributes
  let saveChance = reflexes * 0.35 + positioning * 0.30 + handling * 0.20 + aerialReach * 0.15;

  // Shot placement reduces save chance (well-placed shots are harder)
  saveChance *= 1.0 - shotPlacement * 0.4;

  // Shot power reduces save chance slightly
  saveChance *= 1.0 - shotPower * 0.15;

  // One-on-one situations use the oneOnOnes attribute more
  if (isOneOnOne) {
    saveChance = saveChance * 0.5 + oneOnOnes * 0.5;
  }

  saveChance = Math.max(0.05, Math.min(0.92, saveChance));

  // Decision: catch vs punch vs parry
  let action: GKDecision['action'];
  let reboundChance: number;

  if (shotPower > 0.7 && handling < 0.6) {
    action = 'punch';
    reboundChance = 0.35;
  } else if (shotPlacement > 0.7) {
    action = 'dive';
    reboundChance = 0.25;
  } else if (handling > 0.7 && shotPower < 0.5) {
    action = 'catch';
    reboundChance = 0.05;
  } else {
    action = 'parry';
    reboundChance = 0.20;
  }

  // Distribution quality: how well the GK launches counter-attacks
  const distributionQuality = (gk.attributes.passing ?? 10) / 20 * 0.5 + handling * 0.3 + reflexes * 0.2;

  return { action, saveChance, reboundChance, distributionQuality };
}
