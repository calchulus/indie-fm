import { Player, PlayerAttributes } from '../types';

export type DevelopmentPhase = 'wonderkid' | 'emerging' | 'prime' | 'veteran' | 'declining';

export interface DevelopmentArc {
  playerId: string;
  phase: DevelopmentPhase;
  growthRate: number;
  peakAge: number;
  potentialReached: boolean;
  seasonsAtClub: number;
  breakoutChance: number;
}

export function getDevelopmentPhase(age: number, potentialAbility: number, _currentAbility: number): DevelopmentPhase {
  if (age <= 19 && potentialAbility >= 140) return 'wonderkid';
  if (age <= 23) return 'emerging';
  if (age <= 29) return 'prime';
  if (age <= 32) return 'veteran';
  return 'declining';
}

export function createDevelopmentArc(player: Player): DevelopmentArc {
  const phase = getDevelopmentPhase(player.age, player.potentialAbility, player.currentAbility);
  const peakAge = 26 + Math.floor(Math.random() * 4);

  return {
    playerId: player.id,
    phase,
    growthRate: getGrowthRate(phase, player.age),
    peakAge,
    potentialReached: player.currentAbility >= player.potentialAbility * 0.95,
    seasonsAtClub: 0,
    breakoutChance: phase === 'wonderkid' ? 0.15 : phase === 'emerging' ? 0.08 : 0,
  };
}

function getGrowthRate(phase: DevelopmentPhase, age: number): number {
  switch (phase) {
    case 'wonderkid': return 3 + Math.floor(Math.random() * 3);
    case 'emerging': return 2 + Math.floor(Math.random() * 2);
    case 'prime': return age <= 27 ? 1 : 0;
    case 'veteran': return 0;
    case 'declining': return -(1 + Math.floor(Math.random() * 2));
  }
}

export function processDevelopment(player: Player, arc: DevelopmentArc): { player: Player; arc: DevelopmentArc } {
  const updated = { ...player, attributes: { ...player.attributes } };
  const updatedArc = { ...arc, seasonsAtClub: arc.seasonsAtClub + 1 };

  // Phase transition check
  const newPhase = getDevelopmentPhase(updated.age, updated.potentialAbility, updated.currentAbility);
  if (newPhase !== arc.phase) {
    updatedArc.phase = newPhase;
    updatedArc.growthRate = getGrowthRate(newPhase, updated.age);
  }

  // Wonderkid breakout event
  if (updatedArc.phase === 'wonderkid' && Math.random() < updatedArc.breakoutChance) {
    const boost = 3 + Math.floor(Math.random() * 3);
    applyGrowth(updated.attributes, boost, getKeyAttributesForPosition(updated.position));
    updatedArc.breakoutChance = Math.max(0.05, updatedArc.breakoutChance - 0.03);
  }

  // Normal development
  if (updatedArc.growthRate > 0) {
    const keyAttrs = getKeyAttributesForPosition(updated.position);
    applyGrowth(updated.attributes, updatedArc.growthRate, keyAttrs);

    // Secondary attributes grow slower
    const secondaryGrowth = Math.max(0, Math.floor(updatedArc.growthRate / 2));
    if (secondaryGrowth > 0) {
      applyGrowth(updated.attributes, secondaryGrowth, getSecondaryAttributes(updated.position));
    }
  } else if (updatedArc.growthRate < 0) {
    // Age regression — physical attributes decline first
    applyDecline(updated.attributes, Math.abs(updatedArc.growthRate), getPhysicalDeclineAttributes());

    // Mental attributes can still grow slightly in veteran phase
    if (updatedArc.phase === 'veteran' && Math.random() < 0.3) {
      applyGrowth(updated.attributes, 1, ['composure', 'decisions', 'vision', 'positioning']);
    }
  }

  // Cap at potential ability
  const newCA = computeCurrentAbility(updated.attributes);
  if (newCA > updated.potentialAbility) {
    updatedArc.potentialReached = true;
  }
  updated.currentAbility = Math.min(newCA, updated.potentialAbility);

  // Recalculate overall
  updated.overall = Math.round(updated.currentAbility / 10);

  return { player: updated, arc: updatedArc };
}

function applyGrowth(attrs: PlayerAttributes, amount: number, keys: Array<keyof PlayerAttributes>): void {
  for (const key of keys) {
    if (Math.random() < 0.6) {
      attrs[key] = Math.min(20, attrs[key] + Math.min(amount, 20 - attrs[key]));
    }
  }
}

function applyDecline(attrs: PlayerAttributes, amount: number, keys: Array<keyof PlayerAttributes>): void {
  for (const key of keys) {
    if (Math.random() < 0.7) {
      attrs[key] = Math.max(1, attrs[key] - amount);
    }
  }
}

function getKeyAttributesForPosition(position: string): Array<keyof PlayerAttributes> {
  switch (position) {
    case 'GK': return ['reflexes', 'handling', 'oneOnOnes', 'aerialReach', 'commandOfArea'];
    case 'CB': return ['marking', 'tackling', 'heading', 'positioning', 'strength'];
    case 'LB': case 'RB': return ['pace', 'stamina', 'crossing', 'tackling', 'dribbling'];
    case 'CDM': return ['tackling', 'positioning', 'passing', 'stamina', 'strength'];
    case 'CM': return ['passing', 'vision', 'stamina', 'firstTouch', 'technique'];
    case 'CAM': return ['passing', 'vision', 'technique', 'flair', 'finishing'];
    case 'LW': case 'RW': return ['pace', 'dribbling', 'crossing', 'acceleration', 'technique'];
    case 'ST': return ['finishing', 'offTheBall', 'composure', 'acceleration', 'firstTouch'];
    default: return ['passing', 'tackling', 'pace', 'stamina', 'composure'];
  }
}

function getSecondaryAttributes(position: string): Array<keyof PlayerAttributes> {
  switch (position) {
    case 'GK': return ['kicking', 'throwing', 'communication'];
    case 'CB': return ['passing', 'composure', 'concentration'];
    case 'LB': case 'RB': return ['passing', 'workRate', 'concentration'];
    case 'CDM': return ['vision', 'composure', 'aggression'];
    case 'CM': return ['tackling', 'workRate', 'composure'];
    case 'CAM': return ['offTheBall', 'composure', 'dribbling'];
    case 'LW': case 'RW': return ['finishing', 'offTheBall', 'flair'];
    case 'ST': return ['strength', 'heading', 'dribbling'];
    default: return ['workRate', 'teamwork', 'decisions'];
  }
}

function getPhysicalDeclineAttributes(): Array<keyof PlayerAttributes> {
  return ['pace', 'acceleration', 'stamina', 'strength', 'agility', 'balance', 'jumpingReach', 'naturalFitness'];
}

function computeCurrentAbility(attrs: PlayerAttributes): number {
  const vals = Object.values(attrs);
  return Math.round(vals.reduce((s, v) => s + v, 0) / vals.length * 10);
}

export function isWonderkid(player: Player): boolean {
  return player.age <= 19 && player.potentialAbility >= 140;
}

export function getWonderkidRating(player: Player): number {
  if (!isWonderkid(player)) return 0;
  const gap = player.potentialAbility - player.currentAbility;
  return Math.min(100, Math.round(gap * 1.5 + player.overall * 2));
}

export function projectPeak(player: Player, arc: DevelopmentArc): { peakAge: number; projectedOverall: number } {
  const yearsToGrow = Math.max(0, arc.peakAge - player.age);
  const totalGrowth = yearsToGrow * arc.growthRate;
  const projectedCA = Math.min(player.potentialAbility, player.currentAbility + totalGrowth * 5);
  return {
    peakAge: arc.peakAge,
    projectedOverall: Math.min(99, Math.round(projectedCA / 2)),
  };
}
