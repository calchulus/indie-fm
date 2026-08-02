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
