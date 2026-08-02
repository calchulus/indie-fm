import { Team, Player } from '../types';

export interface SetPieceRoutine {
  id: string;
  type: 'corner_left' | 'corner_right' | 'free_kick_wide' | 'free_kick_central' | 'throw_in';
  takerId?: string;
  targetZone: 'near_post' | 'far_post' | 'short' | 'edge_of_box' | 'mixed';
  runners: Array<{ playerId: string; target: 'near_post' | 'far_post' | 'edge' | 'short' | 'stay_back' }>;
  delivery: 'whipped' | 'driven' | 'floated' | 'short_pass';
}

export interface DefensiveSetPiece {
  type: 'corner' | 'free_kick';
  marking: 'zonal' | 'man' | 'mixed';
  assignments: Array<{ defenderId: string; marks: 'zone' | string }>;
  playersOnPosts: number;
  counterAttackers: string[];
}

export interface OppositionInstruction {
  opponentPlayerId: string;
  closingDown: 'always' | 'often' | 'sometimes' | 'rarely';
  tackling: 'hard' | 'normal' | 'easy';
  marking: 'tight' | 'normal' | 'none';
  showOntoFoot: 'left' | 'right' | 'either';
}

export function createDefaultRoutine(type: SetPieceRoutine['type']): SetPieceRoutine {
  return {
    id: `routine_${type}_${Date.now()}`,
    type,
    targetZone: 'mixed',
    runners: [],
    delivery: type.startsWith('corner') ? 'whipped' : 'driven',
  };
}

export function createDefaultDefensiveSetup(type: DefensiveSetPiece['type']): DefensiveSetPiece {
  return {
    type,
    marking: 'mixed',
    assignments: [],
    playersOnPosts: 1,
    counterAttackers: [],
  };
}

export function generateOppositionInstructions(opponent: Team): OppositionInstruction[] {
  return opponent.players.slice(0, 11).map((player) => ({
    opponentPlayerId: player.id,
    closingDown: player.overall >= 70 ? 'always' : player.overall >= 55 ? 'often' : 'sometimes',
    tackling: player.attributes.aggression >= 14 ? 'hard' : 'normal',
    marking: player.position === 'ST' ? 'tight' : 'normal',
    showOntoFoot: player.footedness === 'left' ? 'right' : player.footedness === 'right' ? 'left' : 'either',
  }));
}

export function getSetPieceTaker(team: Team, type: 'corner' | 'free_kick' | 'penalty'): Player | undefined {
  const starters = team.players.slice(0, 11);
  if (type === 'penalty') {
    return [...starters].sort((a, b) => b.attributes.penaltyTaking - a.attributes.penaltyTaking)[0];
  }
  if (type === 'corner') {
    return [...starters].sort((a, b) => (b.attributes.crossing + b.attributes.technique) - (a.attributes.crossing + a.attributes.technique))[0];
  }
  return [...starters].sort((a, b) => (b.attributes.freeKickTaking + b.attributes.technique) - (a.attributes.freeKickTaking + a.attributes.technique))[0];
}

export function evaluateRoutineQuality(routine: SetPieceRoutine, team: Team): number {
  const taker = routine.takerId ? team.players.find((p) => p.id === routine.takerId) : getSetPieceTaker(team, 'corner');
  if (!taker) return 30;

  let quality = (taker.attributes.crossing + taker.attributes.technique) / 2;
  quality += routine.runners.length * 2;

  const aerialThreats = routine.runners.filter((r) => {
    const p = team.players.find((pl) => pl.id === r.playerId);
    return p && p.attributes.heading >= 12 && p.attributes.jumpingReach >= 12;
  });
  quality += aerialThreats.length * 3;

  return Math.min(100, Math.round(quality * 2));
}

// Compute goal probability from a set piece delivery
export function computeSetPieceGoalChance(
  routine: SetPieceRoutine,
  team: Team,
  defendingTeam: Team,
): { goalChance: number; bestHeader: Player | undefined; deliveryQuality: number } {
  const taker = routine.takerId ? team.players.find((p) => p.id === routine.takerId) : getSetPieceTaker(team, 'corner');
  if (!taker) return { goalChance: 0.02, bestHeader: undefined, deliveryQuality: 0.3 };

  // Delivery quality from taker's crossing/technique
  const deliveryQuality = (taker.attributes.crossing * 0.6 + taker.attributes.technique * 0.4) / 20;

  // Delivery type modifier
  const deliveryMod: Record<string, number> = { whipped: 1.1, driven: 1.0, floated: 0.9, short_pass: 0.5 };
  const dMod = deliveryMod[routine.delivery] ?? 1.0;

  // Find best aerial target among runners
  const runners = routine.runners
    .map((r) => team.players.find((p) => p.id === r.playerId))
    .filter((p): p is Player => p != null);
  const bestHeader = runners.sort((a, b) =>
    (b.attributes.heading + b.attributes.jumpingReach) - (a.attributes.heading + a.attributes.jumpingReach)
  )[0];

  // Target zone affects chance: near post is highest percentage
  const zoneMod: Record<string, number> = { near_post: 1.2, far_post: 1.0, short: 0.4, edge_of_box: 0.7, mixed: 0.9 };
  const zMod = zoneMod[routine.targetZone] ?? 0.9;

  // Defensive aerial ability reduces chance
  const defAerial = defendingTeam.players.slice(0, 11)
    .reduce((s, p) => s + p.attributes.heading + p.attributes.jumpingReach, 0) / 22;
  const defMod = 1.0 - (defAerial / 20) * 0.3;

  const headerAbility = bestHeader
    ? (bestHeader.attributes.heading + bestHeader.attributes.jumpingReach) / 40
    : 0.3;

  const goalChance = Math.min(0.25, 0.08 * deliveryQuality * dMod * zMod * defMod * (0.5 + headerAbility));
  return { goalChance, bestHeader, deliveryQuality };
}

// --- In-match injury system (#9) ---
export interface MatchInjury {
  playerId: string;
  playerName: string;
  type: 'knock' | 'muscle' | 'ligament' | 'fracture';
  severity: number; // 1-10
  roundsOut: number;
  minute: number;
}

export function rollInjury(player: Player, minute: number, isFoul: boolean): MatchInjury | null {
  // Base injury chance per foul: 3%. Non-foul collisions: 0.5%
  const baseChance = isFoul ? 0.03 : 0.005;

  // Injury proneness trait increases risk
  const proneness = (player.hidden?.injuryProneness ?? 10) / 20;
  const chance = baseChance * (0.5 + proneness);

  if (Math.random() > chance) return null;

  // Severity: most injuries are minor knocks
  const sevRoll = Math.random();
  let type: MatchInjury['type'];
  let severity: number;
  let roundsOut: number;

  if (sevRoll < 0.50) {
    type = 'knock'; severity = 1 + Math.floor(Math.random() * 3); roundsOut = severity;
  } else if (sevRoll < 0.75) {
    type = 'muscle'; severity = 3 + Math.floor(Math.random() * 4); roundsOut = severity * 2;
  } else if (sevRoll < 0.92) {
    type = 'ligament'; severity = 5 + Math.floor(Math.random() * 4); roundsOut = severity * 3;
  } else {
    type = 'fracture'; severity = 7 + Math.floor(Math.random() * 4); roundsOut = severity * 4;
  }

  return { playerId: player.id, playerName: player.name, type, severity, roundsOut, minute };
}
