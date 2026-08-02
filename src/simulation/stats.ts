import { MatchState } from '../types';

export interface MatchStats {
  possession: { home: number; away: number };
  shots: { home: number; away: number };
  shotsOnTarget: { home: number; away: number };
  corners: { home: number; away: number };
  fouls: { home: number; away: number };
  passes: { home: number; away: number };
  tackles: { home: number; away: number };
}

export function computeMatchStats(state: MatchState): MatchStats {
  const stats: MatchStats = {
    possession: state.possession,
    shots: state.shots,
    shotsOnTarget: state.shotsOnTarget,
    corners: state.corners,
    fouls: state.fouls,
    passes: { home: 0, away: 0 },
    tackles: { home: 0, away: 0 },
  };

  for (const evt of state.events) {
    const isHome = evt.teamId === state.homeTeamId;
    if (evt.type === 'pass') {
      if (isHome) stats.passes.home++;
      else stats.passes.away++;
    } else if (evt.type === 'tackle') {
      if (isHome) stats.tackles.home++;
      else stats.tackles.away++;
    }
  }

  return stats;
}

export interface ShotMapEntry {
  x: number;
  y: number;
  isGoal: boolean;
  isOnTarget: boolean;
  teamId: string;
  minute: number;
}

export function getShotMap(state: MatchState): ShotMapEntry[] {
  return state.events
    .filter((e) => e.type === 'shot' || e.type === 'goal' || e.type === 'save')
    .map((e) => ({
      x: e.x,
      y: e.y,
      isGoal: e.type === 'goal',
      isOnTarget: e.type === 'goal' || e.type === 'save',
      teamId: e.teamId,
      minute: e.minute,
    }));
}
