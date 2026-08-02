// Match context tracking: possession chains, counter-attacks, pressing traps, set piece variation
// Items #1-4 from the second improvement list.

import { Team, Player } from '../types';

// --- #1: Possession Chains ---
// Track consecutive successful passes to build "tiki-taka" bonus.

export interface PossessionChain {
  teamId: string;
  length: number;        // consecutive successful passes
  maxThisMatch: number;  // longest chain this match
  bonus: number;         // current goal chance bonus from chain
}

export function createPossessionChain(teamId: string): PossessionChain {
  return { teamId, length: 0, maxThisMatch: 0, bonus: 0 };
}

export function advanceChain(chain: PossessionChain, success: boolean): PossessionChain {
  if (!success) return { ...chain, length: 0, bonus: 0 };
  const length = chain.length + 1;
  // Bonus scales: 5+ passes = +5%, 10+ = +10%, 15+ = +15% (capped)
  const bonus = Math.min(0.15, Math.max(0, (length - 4) * 0.01));
  return { ...chain, length, maxThisMatch: Math.max(chain.maxThisMatch, length), bonus };
}

// --- #2: Counter-Attack Detection ---
// When defending team wins ball in own half with pacey forwards, boost breakaway chance.

export interface CounterAttackState {
  active: boolean;
  teamId: string | null;
  speed: number;      // 0-1, how dangerous the break is
  ticksRemaining: number;
}

export function createCounterState(): CounterAttackState {
  return { active: false, teamId: null, speed: 0, ticksRemaining: 0 };
}

export function detectCounterAttack(
  winningTeam: Team,
  ballWonInOwnHalf: boolean,
  _previousPossessionTeamId: string,
): CounterAttackState {
  if (!ballWonInOwnHalf) return createCounterState();

  // Check if winning team has pacey forwards
  const forwards = winningTeam.players.slice(0, 11).filter((p) => ['ST', 'LW', 'RW'].includes(p.position));
  const avgPace = forwards.length > 0
    ? forwards.reduce((s, p) => s + p.attributes.pace + p.attributes.acceleration, 0) / (forwards.length * 2)
    : 0;

  // Counter is dangerous if forwards are fast (>14 avg pace+accel)
  if (avgPace < 12) return createCounterState();

  const speed = Math.min(1, (avgPace - 10) / 10);
  return {
    active: true,
    teamId: winningTeam.id,
    speed,
    ticksRemaining: 8 + Math.floor(speed * 6), // 8-14 ticks of advantage
  };
}

export function tickCounter(state: CounterAttackState): CounterAttackState {
  if (!state.active) return state;
  const remaining = state.ticksRemaining - 1;
  if (remaining <= 0) return createCounterState();
  return { ...state, ticksRemaining: remaining, speed: state.speed * 0.92 };
}

export function getCounterAttackBonus(state: CounterAttackState, teamId: string): number {
  if (!state.active || state.teamId !== teamId) return 0;
  // Up to +20% goal chance during a counter
  return state.speed * 0.20;
}

// --- #3: Pressing Traps ---
// High press forces errors in opponent's defensive third; low press concedes space but limits through balls.

export interface PressingEffect {
  errorChance: number;      // chance opponent makes a mistake in their own half
  throughBallReduction: number; // reduction in through ball success for opponent
  staminaCost: number;      // extra stamina drain for pressing team
}

export function computePressingEffect(pressingIntensity: string, minute: number): PressingEffect {
  // Pressing effectiveness drops as players tire
  const fatigueFactor = minute > 70 ? 0.5 : minute > 55 ? 0.75 : 1.0;

  switch (pressingIntensity) {
    case 'high':
      return {
        errorChance: 0.12 * fatigueFactor,
        throughBallReduction: 0.05,
        staminaCost: 1.4,
      };
    case 'medium':
      return {
        errorChance: 0.06 * fatigueFactor,
        throughBallReduction: 0.15,
        staminaCost: 1.1,
      };
    case 'low':
      return {
        errorChance: 0.02 * fatigueFactor,
        throughBallReduction: 0.30,
        staminaCost: 0.9,
      };
    default:
      return { errorChance: 0.04, throughBallReduction: 0.10, staminaCost: 1.0 };
  }
}

// Check if a pressing trap triggers an error in the opponent's defensive third
export function rollPressingError(effect: PressingEffect, ballInDefensiveThird: boolean): boolean {
  if (!ballInDefensiveThird) return false;
  return Math.random() < effect.errorChance;
}

// --- #4: Set Piece Taker Variation ---
// Left-footed takers deliver inswinging corners (different target zones effective).

export interface SetPieceDelivery {
  takerFoot: 'left' | 'right';
  side: 'left' | 'right';  // which side of the pitch
  swing: 'inswinging' | 'outswinging';
  effectiveZones: Array<'near_post' | 'far_post' | 'edge_of_box'>;
  deliveryQualityMod: number;
}

export function computeSetPieceDelivery(taker: Player, side: 'left' | 'right'): SetPieceDelivery {
  const takerFoot = taker.footedness === 'left' ? 'left' : 'right';

  // Determine swing: left foot from right side = inswinging, etc.
  const isInswinging = (takerFoot === 'left' && side === 'right') || (takerFoot === 'right' && side === 'left');
  const swing = isInswinging ? 'inswinging' : 'outswinging';

  // Inswinging corners favor near post; outswinging favor far post
  let effectiveZones: SetPieceDelivery['effectiveZones'];
  let deliveryQualityMod: number;

  if (isInswinging) {
    effectiveZones = ['near_post', 'edge_of_box'];
    deliveryQualityMod = 1.1; // inswinging is generally more dangerous
  } else {
    effectiveZones = ['far_post', 'edge_of_box'];
    deliveryQualityMod = 1.0;
  }

  // Taker's crossing ability modifies quality
  const crossingMod = 0.8 + (taker.attributes.crossing / 20) * 0.4;

  return {
    takerFoot,
    side,
    swing,
    effectiveZones,
    deliveryQualityMod: deliveryQualityMod * crossingMod,
  };
}
