// In-match fatigue accumulation
// Tracks per-player fitness drain during a match, visible in the UI.
// Players with high stamina drain traits tire faster.
// Fatigued players have reduced effectiveness.

import { Player } from '../types';
import { computeTraitMultipliers } from './trait-effects';

export interface PlayerFatigue {
  playerId: string;
  fitness: number;      // 100 = fresh, 0 = exhausted
  distanceCovered: number; // relative units
  sprints: number;
}

export interface MatchFatigueState {
  players: Map<string, PlayerFatigue>;
  minute: number;
}

export function createMatchFatigue(players: Player[]): MatchFatigueState {
  const map = new Map<string, PlayerFatigue>();
  for (const p of players) {
    map.set(p.id, {
      playerId: p.id,
      fitness: 100,
      distanceCovered: 0,
      sprints: 0,
    });
  }
  return { players: map, minute: 0 };
}

// Advance fatigue by one tick. Called every tick in the engine.
// baseDrain is scaled by minute (later = more drain) and trait staminaDrain.
export function advanceFatigue(
  state: MatchFatigueState,
  players: Player[],
  tick: number,
  activePlayerIds: Set<string>,
): MatchFatigueState {
  const minute = Math.floor(tick / 60);
  const minuteFactor = 0.5 + (minute / 90) * 1.0; // 0.5 at start, 1.5 at 90'

  const next = new Map<string, PlayerFatigue>();

  for (const p of players) {
    const prev = state.players.get(p.id);
    if (!prev) continue;

    const traits = computeTraitMultipliers(p);
    const isActive = activePlayerIds.has(p.id);

    // Base drain per tick: ~0.015 per tick when active, scaled by minute and trait
    const baseDrain = isActive ? 0.015 * minuteFactor * traits.staminaDrain : 0.003;
    // Natural fitness attribute provides resistance
    const staminaResistance = p.attributes.stamina / 20; // 0-1
    const effectiveDrain = baseDrain * (1.2 - staminaResistance * 0.4);

    const newFitness = Math.max(0, prev.fitness - effectiveDrain);
    const distance = prev.distanceCovered + (isActive ? 0.12 * minuteFactor : 0.02);
    const sprints = prev.sprints + (isActive && Math.random() < 0.02 ? 1 : 0);

    next.set(p.id, {
      playerId: p.id,
      fitness: newFitness,
      distanceCovered: distance,
      sprints,
    });
  }

  return { players: next, minute };
}

// Get the effectiveness multiplier for a fatigued player (0.6-1.0)
export function getFatigueMultiplier(fitness: number): number {
  if (fitness >= 80) return 1.0;
  if (fitness >= 60) return 0.95;
  if (fitness >= 40) return 0.88;
  if (fitness >= 20) return 0.78;
  return 0.65;
}

// Get a human-readable fatigue label
export function getFatigueLabel(fitness: number): { label: string; color: string } {
  if (fitness >= 80) return { label: 'Fresh', color: '#4ade80' };
  if (fitness >= 60) return { label: 'Good', color: '#86efac' };
  if (fitness >= 40) return { label: 'Tiring', color: '#fbbf24' };
  if (fitness >= 20) return { label: 'Fatigued', color: '#fb923c' };
  return { label: 'Exhausted', color: '#f87171' };
}

// Check if a player should be substituted due to fatigue
export function shouldSubForFatigue(fitness: number, minute: number): boolean {
  if (minute < 60) return fitness < 15;
  if (minute < 75) return fitness < 25;
  return fitness < 35;
}
