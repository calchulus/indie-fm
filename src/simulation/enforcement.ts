// Core game enforcement rules
// Items 11-20: momentum, fatigue, transfer window, contract expiry, retirement, wage budget, squad limit, position familiarity, captain

import { Player, Team, Position } from '../types';

// --- Item 14: Transfer window enforcement ---
export function isTransferWindowOpen(round: number, totalRounds: number): boolean {
  // Summer window: rounds 1-4, Winter window: rounds totalRounds/2 ± 2
  const midSeason = Math.floor(totalRounds / 2);
  return round <= 4 || (round >= midSeason - 2 && round <= midSeason + 2);
}

export function getTransferWindowLabel(round: number, totalRounds: number): string {
  if (round <= 4) return 'Summer Window (Open)';
  const midSeason = Math.floor(totalRounds / 2);
  if (round >= midSeason - 2 && round <= midSeason + 2) return 'Winter Window (Open)';
  return 'Window Closed';
}

// --- Item 15: Contract expiry enforcement ---
export function getExpiringContracts(team: Team, currentYear: number): Player[] {
  return team.players.filter((p) => p.contractExpiry <= currentYear);
}

export function removeExpiredContracts(team: Team, currentYear: number): { team: Team; released: Player[] } {
  const expired = team.players.filter((p) => p.contractExpiry <= currentYear);
  const remaining = team.players.filter((p) => p.contractExpiry > currentYear);
  return { team: { ...team, players: remaining }, released: expired };
}

// --- Item 16: Player retirement ---
export function checkRetirements(team: Team): { team: Team; retired: Player[] } {
  const retired = team.players.filter((p) => p.age >= 36 && Math.random() < 0.6);
  const remaining = team.players.filter((p) => !retired.some((r) => r.id === p.id));
  return { team: { ...team, players: remaining }, retired };
}

// --- Item 17: Wage budget enforcement ---
export function getTotalWages(team: Team): number {
  return team.players.reduce((sum, p) => sum + p.wage, 0);
}

export function isOverWageBudget(team: Team, wageBudget: number): boolean {
  return getTotalWages(team) > wageBudget;
}

export function canAffordPlayer(team: Team, playerWage: number, wageBudget: number): boolean {
  return getTotalWages(team) + playerWage <= wageBudget;
}

// --- Item 18: Squad size limit ---
export const MAX_SQUAD_SIZE = 25;

export function isSquadFull(team: Team): boolean {
  return team.players.length >= MAX_SQUAD_SIZE;
}

export function canSignPlayer(team: Team): boolean {
  return team.players.length < MAX_SQUAD_SIZE;
}

// --- Item 19: Position familiarity penalty ---
const POSITION_GROUPS: Record<string, string[]> = {
  GK: ['GK'],
  CB: ['CB'],
  LB: ['LB', 'LWB'],
  RB: ['RB', 'RWB'],
  CDM: ['CDM', 'CM'],
  CM: ['CM', 'CDM', 'CAM'],
  CAM: ['CAM', 'CM', 'LW', 'RW'],
  LW: ['LW', 'RW', 'CAM'],
  RW: ['RW', 'LW', 'CAM'],
  ST: ['ST', 'CAM'],
};

export function getPositionFamiliarity(playerPosition: Position, slotPosition: string): number {
  if (playerPosition === slotPosition) return 1.0; // Natural position
  const group = POSITION_GROUPS[slotPosition] ?? [];
  if (group.includes(playerPosition)) return 0.85; // Familiar
  // Check reverse familiarity
  const playerGroup = POSITION_GROUPS[playerPosition] ?? [];
  if (playerGroup.includes(slotPosition)) return 0.80;
  return 0.65; // Unfamiliar — significant penalty
}

export function applyPositionFamiliarity(baseRating: number, playerPosition: Position, slotPosition: string): number {
  return baseRating * getPositionFamiliarity(playerPosition, slotPosition);
}

// --- Item 20: Captain / leadership effects ---
export function selectCaptain(team: Team): Player | null {
  // Captain is the player with highest leadership + age + appearances
  const candidates = team.players
    .filter((p) => p.age >= 24)
    .sort((a, b) => {
      const scoreA = a.attributes.leadership * 3 + a.age + a.appearances * 0.5;
      const scoreB = b.attributes.leadership * 3 + b.age + b.appearances * 0.5;
      return scoreB - scoreA;
    });
  return candidates[0] ?? null;
}

export function getCaptainBonus(captain: Player | null): number {
  if (!captain) return 1.0;
  // Captain's leadership provides a small team-wide bonus
  return 1.0 + (captain.attributes.leadership / 20) * 0.05; // Up to +5%
}

export function getCaptainMoraleEffect(captain: Player | null, teamMorale: number): number {
  if (!captain) return teamMorale;
  // Captain's leadership helps stabilize team morale
  const leadershipFactor = captain.attributes.leadership / 20;
  // Pulls morale toward 6 (stable) based on leadership
  return teamMorale + (6 - teamMorale) * leadershipFactor * 0.2;
}

// --- Item 11: Momentum tracking ---
export interface MatchMomentum {
  home: number; // 0-100
  away: number;
  homeStreak: number;
  awayStreak: number;
}

export function createMomentum(): MatchMomentum {
  return { home: 50, away: 50, homeStreak: 0, awayStreak: 0 };
}

export function updateMomentum(momentum: MatchMomentum, eventTeamId: string, homeTeamId: string, eventType: string): MatchMomentum {
  const isHome = eventTeamId === homeTeamId;
  const weight = eventType === 'goal' ? 15 : eventType === 'shot' ? 5 : eventType === 'corner' ? 3 : 1;

  const next = { ...momentum };
  if (isHome) {
    next.home = Math.min(95, next.home + weight);
    next.away = Math.max(5, next.away - weight * 0.5);
    next.homeStreak++;
    next.awayStreak = 0;
  } else {
    next.away = Math.min(95, next.away + weight);
    next.home = Math.max(5, next.home - weight * 0.5);
    next.awayStreak++;
    next.homeStreak = 0;
  }
  return next;
}

export function getMomentumMultiplier(momentum: MatchMomentum, teamId: string, homeTeamId: string): number {
  const isHome = teamId === homeTeamId;
  const value = isHome ? momentum.home : momentum.away;
  // 50 = neutral (1.0), 95 = max boost (1.15), 5 = min (0.90)
  return 0.90 + (value / 100) * 0.25;
}

// --- Item 12-13: Fatigue tracking ---
export interface PlayerFatigue {
  playerId: string;
  fitness: number; // 100 = fresh, 0 = exhausted
  distanceCovered: number;
  sprints: number;
}

export function createPlayerFatigue(playerId: string): PlayerFatigue {
  return { playerId, fitness: 100, distanceCovered: 0, sprints: 0 };
}

export function advancePlayerFatigue(fatigue: PlayerFatigue, minute: number, isActive: boolean, staminaDrainTrait: number, staminaAttr: number): PlayerFatigue {
  const minuteFactor = 0.5 + (minute / 90) * 1.0;
  const baseDrain = isActive ? 0.015 * minuteFactor * staminaDrainTrait : 0.003;
  const staminaResistance = staminaAttr / 20;
  const effectiveDrain = baseDrain * (1.2 - staminaResistance * 0.4);

  return {
    ...fatigue,
    fitness: Math.max(0, fatigue.fitness - effectiveDrain),
    distanceCovered: fatigue.distanceCovered + (isActive ? 0.12 * minuteFactor : 0.02),
    sprints: fatigue.sprints + (isActive && Math.random() < 0.02 ? 1 : 0),
  };
}

export function getFatigueMultiplier(fitness: number): number {
  if (fitness >= 80) return 1.0;
  if (fitness >= 60) return 0.95;
  if (fitness >= 40) return 0.88;
  if (fitness >= 20) return 0.78;
  return 0.65;
}

export function shouldSubForFatigue(fitness: number, minute: number): boolean {
  if (minute < 60) return fitness < 15;
  if (minute < 75) return fitness < 25;
  return fitness < 35;
}
