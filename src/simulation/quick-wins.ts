// Quick wins: squad numbers, pre-contracts, friendlies, winter break,
// set piece takers, live ratings, ball trail data

import { Team, Player, MatchState, MatchEvent } from '../types';

// --- #1: Squad Numbers + Captain Selection ---
export function assignSquadNumbers(players: Player[]): Map<string, number> {
  const numbers = new Map<string, number>();
  const positionOrder: Record<string, number[]> = {
    GK: [1, 13, 25],
    CB: [4, 5, 6, 15],
    LB: [3, 12],
    RB: [2, 14],
    CDM: [4, 6, 8],
    CM: [8, 10, 14, 16],
    CAM: [10, 7, 11],
    LW: [11, 7],
    RW: [7, 11],
    ST: [9, 19, 20],
  };
  const used = new Set<number>();

  for (const p of players) {
    const preferred = positionOrder[p.position] ?? [];
    let num = preferred.find((n) => !used.has(n));
    if (!num) {
      for (let i = 1; i <= 40; i++) {
        if (!used.has(i)) { num = i; break; }
      }
    }
    used.add(num ?? 99);
    numbers.set(p.id, num ?? 99);
  }
  return numbers;
}

export function selectCaptain(team: Team): { captain: Player; vice: Player } {
  const sorted = [...team.players].sort((a, b) => {
    const aScore = a.age * 2 + a.reputation + (a.hidden?.loyalty ?? 10) * 3 + a.appearances;
    const bScore = b.age * 2 + b.reputation + (b.hidden?.loyalty ?? 10) * 3 + b.appearances;
    return bScore - aScore;
  });
  return { captain: sorted[0], vice: sorted[1] };
}

// --- #3: Pre-Contract Agreements ---
export function canSignPreContract(player: Player, currentYear: number): boolean {
  return player.contractExpiry <= currentYear + 1 && player.contractExpiry > currentYear;
}

export function getPreContractTargets(team: Team, currentYear: number): Player[] {
  return team.players.filter((p) => canSignPreContract(p, currentYear) && p.overall >= 55);
}

// --- #4: Pre-Season Friendlies ---
export interface Friendly {
  opponentId: string;
  opponentName: string;
  round: number;
  revenue: number;
}

export function generatePreSeasonFriendlies(_team: Team, opponents: Team[], count: number = 4): Friendly[] {
  const friendlies: Friendly[] = [];
  const shuffled = [...opponents].sort(() => Math.random() - 0.5);
  for (let i = 0; i < Math.min(count, shuffled.length); i++) {
    friendlies.push({
      opponentId: shuffled[i].id,
      opponentName: shuffled[i].name,
      round: i + 1,
      revenue: 50_000 + Math.floor(Math.random() * 150_000),
    });
  }
  return friendlies;
}

// --- #5: Winter Break ---
export function isWinterBreak(round: number, totalRounds: number): boolean {
  const mid = Math.floor(totalRounds / 2);
  return round === mid || round === mid + 1;
}

export function getWinterBreakMessage(): string {
  return '❄️ Winter break — no fixtures this round. Players recover fitness and morale.';
}

// --- #6: Set Piece Taker Assignment ---
export interface SetPieceTakers {
  corners: string;
  freeKicks: string;
  penalties: string;
  throwIns: string;
}

export function autoAssignTakers(team: Team): SetPieceTakers {
  const starters = team.players.slice(0, 11);
  const bestCrosser = [...starters].sort((a, b) => (b.attributes.crossing + b.attributes.technique) - (a.attributes.crossing + a.attributes.technique))[0];
  const bestFK = [...starters].sort((a, b) => ((b.attributes as any).freeKickTaking ?? b.attributes.technique) - ((a.attributes as any).freeKickTaking ?? a.attributes.technique))[0];
  const bestPen = [...starters].sort((a, b) => ((b.attributes as any).penaltyTaking ?? b.attributes.composure) - ((a.attributes as any).penaltyTaking ?? a.attributes.composure))[0];

  return {
    corners: bestCrosser?.id ?? '',
    freeKicks: bestFK?.id ?? '',
    penalties: bestPen?.id ?? '',
    throwIns: starters.find((p) => ['LB', 'RB'].includes(p.position))?.id ?? starters[0]?.id ?? '',
  };
}

// --- #9: Live Player Ratings ---
export function computeLiveRating(playerId: string, events: MatchEvent[], minute: number): number {
  let rating = 6.0;
  const playerEvents = events.filter((e) => e.playerId === playerId);

  for (const evt of playerEvents) {
    switch (evt.type) {
      case 'goal': rating += 1.5; break;
      case 'save': rating += 0.7; break;
      case 'tackle': rating += evt.outcome === 'success' ? 0.2 : -0.1; break;
      case 'pass': rating += evt.outcome === 'success' ? 0.03 : -0.1; break;
      case 'dribble': rating += evt.outcome === 'success' ? 0.15 : -0.1; break;
      case 'yellow_card': rating -= 0.5; break;
      case 'red_card': rating -= 2.0; break;
    }
  }

  // Minutes played bonus
  rating += Math.min(0.5, minute * 0.005);
  return Math.max(3, Math.min(10, Math.round(rating * 10) / 10));
}

// --- #10: Ball Trail Data ---
export interface BallTrailPoint {
  x: number;
  y: number;
  tick: number;
}

export function getBallTrail(state: MatchState, lastN: number = 20): BallTrailPoint[] {
  // Derive trail from recent events with positions
  const posEvents = state.events.filter((e) => e.x > 0 && e.y > 0).slice(-lastN);
  return posEvents.map((e) => ({ x: e.x, y: e.y, tick: e.tick }));
}
