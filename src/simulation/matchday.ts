import { MatchState, Team } from '../types';

export interface MatchDayEvent {
  type: 'injury' | 'var_review' | 'penalty_awarded' | 'penalty_missed' | 'injury_time';
  minute: number;
  description: string;
  playerId?: string;
  teamId?: string;
}

export function rollMatchDayInjury(state: MatchState, team: Team): MatchDayEvent | null {
  if (Math.random() > 0.005) return null;
  const starters = team.players.slice(0, 11);
  const victim = starters[Math.floor(Math.random() * starters.length)];
  const injuryTypes = ['hamstring strain', 'ankle twist', 'knee knock', 'calf cramp', 'groin pull'];
  const injury = injuryTypes[Math.floor(Math.random() * injuryTypes.length)];

  return {
    type: 'injury',
    minute: state.minute,
    description: `🏥 ${victim.name} goes down with a ${injury}! Forced substitution.`,
    playerId: victim.id,
    teamId: team.id,
  };
}

export function rollVARReview(state: MatchState, lastEventType: string): MatchDayEvent | null {
  if (!['goal', 'penalty_awarded'].includes(lastEventType)) return null;
  if (Math.random() > 0.15) return null;

  const outcomes = ['confirmed', 'overturned'];
  const outcome = outcomes[Math.random() < 0.7 ? 0 : 1];

  return {
    type: 'var_review',
    minute: state.minute,
    description: outcome === 'confirmed'
      ? '📺 VAR check... Goal confirmed! Decision stands.'
      : '📺 VAR check... Decision OVERTURNED! Goal disallowed!',
  };
}

export function rollPenalty(state: MatchState, attackingTeam: Team): MatchDayEvent | null {
  if (Math.random() > 0.008) return null;
  const taker = attackingTeam.players.find((p) => p.position === 'ST') ?? attackingTeam.players[9];

  const scored = Math.random() < 0.76;
  return {
    type: scored ? 'penalty_awarded' : 'penalty_missed',
    minute: state.minute,
    description: scored
      ? `⚽ PENALTY! ${taker.name} converts from the spot!`
      : `❌ PENALTY MISS! ${taker.name} blazes it over!`,
    playerId: taker.id,
    teamId: attackingTeam.id,
  };
}

export function computeInjuryTime(state: MatchState): number {
  const fouls = state.fouls.home + state.fouls.away;
  const goals = state.homeScore + state.awayScore;
  const base = 1;
  const foulTime = Math.floor(fouls / 5);
  const goalTime = goals;
  return Math.min(7, base + foulTime + goalTime);
}
