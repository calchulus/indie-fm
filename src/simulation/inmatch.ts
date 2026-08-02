import { MatchState, Team, Player, Tactics, Formation } from '../types';

export interface Substitution {
  offPlayerId: string;
  onPlayerId: string;
  minute: number;
  reason: 'tactical' | 'injury' | 'fatigue';
}

export interface InMatchTacticChange {
  minute: number;
  type: 'formation' | 'mentality' | 'pressing' | 'tempo' | 'shout';
  value: string;
}

export type TouchlineShout =
  | 'encourage'
  | 'demand_more'
  | 'get_creative'
  | 'hustle'
  | 'sit_deeper'
  | 'push_forward'
  | 'waste_time'
  | 'get_stuck_in';

export interface ShoutEffect {
  shout: TouchlineShout;
  moraleBoost: number;
  attackMod: number;
  defendMod: number;
  duration: number;
}

const SHOUT_EFFECTS: Record<TouchlineShout, ShoutEffect> = {
  encourage: { shout: 'encourage', moraleBoost: 1, attackMod: 1.05, defendMod: 1.0, duration: 5 },
  demand_more: { shout: 'demand_more', moraleBoost: -1, attackMod: 1.1, defendMod: 0.95, duration: 5 },
  get_creative: { shout: 'get_creative', moraleBoost: 0, attackMod: 1.15, defendMod: 0.9, duration: 4 },
  hustle: { shout: 'hustle', moraleBoost: 0, attackMod: 1.0, defendMod: 1.1, duration: 5 },
  sit_deeper: { shout: 'sit_deeper', moraleBoost: 0, attackMod: 0.85, defendMod: 1.2, duration: 8 },
  push_forward: { shout: 'push_forward', moraleBoost: 0, attackMod: 1.2, defendMod: 0.8, duration: 6 },
  waste_time: { shout: 'waste_time', moraleBoost: 0, attackMod: 0.7, defendMod: 1.1, duration: 10 },
  get_stuck_in: { shout: 'get_stuck_in', moraleBoost: 0, attackMod: 1.05, defendMod: 1.05, duration: 4 },
};

export function getShoutEffect(shout: TouchlineShout): ShoutEffect {
  return SHOUT_EFFECTS[shout];
}

export function canSubstitute(state: MatchState, _teamId: string, subsUsed: number): boolean {
  if (state.status === 'full_time' || state.status === 'pre_match') return false;
  return subsUsed < 5;
}

export function getSuggestedSubs(team: Team, state: MatchState): Array<{ off: Player; on: Player; reason: string }> {
  const starters = team.players.slice(0, 11);
  const bench = team.players.slice(11);
  const suggestions: Array<{ off: Player; on: Player; reason: string }> = [];

  for (const starter of starters) {
    if (starter.fitness < 50) {
      const replacement = bench.find((b) => b.position === starter.position && b.fitness > 70);
      if (replacement) {
        suggestions.push({ off: starter, on: replacement, reason: 'Fatigued' });
      }
    }
  }

  if (state.minute > 70 && bench.length > 0) {
    const striker = starters.find((p) => p.position === 'ST');
    const freshStriker = bench.find((p) => p.position === 'ST');
    if (striker && freshStriker && !suggestions.some((s) => s.off.id === striker.id)) {
      suggestions.push({ off: striker, on: freshStriker, reason: 'Fresh legs' });
    }
  }

  return suggestions;
}

export function applySubstitution(
  state: MatchState,
  team: Team,
  offId: string,
  onId: string,
): { state: MatchState; team: Team } {
  const offIdx = team.players.findIndex((p) => p.id === offId);
  const onIdx = team.players.findIndex((p) => p.id === onId);
  if (offIdx < 0 || onIdx < 0 || offIdx >= 11 || onIdx < 11) return { state, team };

  const updatedPlayers = [...team.players];
  const offPlayer = updatedPlayers[offIdx];
  const onPlayer = updatedPlayers[onIdx];
  updatedPlayers[offIdx] = onPlayer;
  updatedPlayers[onIdx] = offPlayer;

  const updatedPositions = state.playerPositions.map((pp) => {
    if (pp.playerId === offId) {
      return { ...pp, playerId: onId };
    }
    return pp;
  });

  return {
    state: { ...state, playerPositions: updatedPositions },
    team: { ...team, players: updatedPlayers },
  };
}

export function applyInMatchTactics(team: Team, changes: Partial<Tactics>): Team {
  return { ...team, tactics: { ...team.tactics, ...changes } };
}

export function applyFormationChange(team: Team, formation: Formation): Team {
  return { ...team, tactics: { ...team.tactics, formation } };
}

export interface HalfTimeTalkOption {
  id: string;
  label: string;
  moraleEffect: number;
  attackEffect: number;
  description: string;
}

export function getHalfTimeTalkOptions(scoreDiff: number): HalfTimeTalkOption[] {
  if (scoreDiff > 0) {
    return [
      { id: 'keep_it_up', label: 'Keep it up!', moraleEffect: 1, attackEffect: 1.0, description: 'Praise the performance, maintain intensity' },
      { id: 'push_on', label: 'Push for more', moraleEffect: 0, attackEffect: 1.1, description: 'Demand they extend the lead' },
      { id: 'stay_focused', label: 'Stay focused', moraleEffect: 0, attackEffect: 0.95, description: 'Warn against complacency' },
    ];
  } else if (scoreDiff === 0) {
    return [
      { id: 'encourage', label: 'Encourage', moraleEffect: 1, attackEffect: 1.05, description: 'Positive reinforcement' },
      { id: 'demand', label: 'Demand improvement', moraleEffect: -1, attackEffect: 1.1, description: 'Express dissatisfaction' },
      { id: 'calm', label: 'Stay patient', moraleEffect: 0, attackEffect: 1.0, description: 'Remind them to stick to the plan' },
    ];
  } else {
    return [
      { id: 'rally', label: 'Rally the troops', moraleEffect: 2, attackEffect: 1.15, description: 'Fire them up for a comeback' },
      { id: 'tactical', label: 'Tactical tweak', moraleEffect: 0, attackEffect: 1.1, description: 'Adjust the approach' },
      { id: 'hairdryer', label: 'Hairdryer treatment', moraleEffect: -2, attackEffect: 1.2, description: 'Anger as motivation (risky)' },
    ];
  }
}
