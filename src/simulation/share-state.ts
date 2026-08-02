// Shareable game states: export, import, compress, scenario presets
// Players can share their team's circumstances as a code or file.

import { League } from '../types';

// --- Export/Import Core ---

export interface ShareableState {
  version: number;
  exportedAt: number;
  description: string;
  league: League;
  userTeamId: string;
  seasonNumber: number;
  round: number;
  boardConfidence: number;
  budget: number;
}

// Compress state to a shareable base64 string
export function exportToCode(state: ShareableState): string {
  const json = JSON.stringify(state);
  // Use base64 encoding for shareability
  const encoded = btoa(unescape(encodeURIComponent(json)));
  return `IFM1:${encoded}`;
}

// Decode a shared code back to state
export function importFromCode(code: string): ShareableState | null {
  try {
    const trimmed = code.trim();
    if (!trimmed.startsWith('IFM1:')) return null;
    const encoded = trimmed.slice(5);
    const json = decodeURIComponent(escape(atob(encoded)));
    const state = JSON.parse(json) as ShareableState;
    if (!state.league || !state.userTeamId || !state.version) return null;
    return state;
  } catch {
    return null;
  }
}

// Export as downloadable JSON file
export function exportToFile(state: ShareableState): void {
  const json = JSON.stringify(state, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `indie-fm-save-${state.league.teams.find((t) => t.id === state.userTeamId)?.shortName ?? 'club'}-s${state.seasonNumber}r${state.round}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// Import from uploaded JSON file
export function importFromFile(file: File): Promise<ShareableState | null> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const state = JSON.parse(reader.result as string) as ShareableState;
        if (state.league && state.userTeamId && state.version) resolve(state);
        else resolve(null);
      } catch {
        resolve(null);
      }
    };
    reader.onerror = () => resolve(null);
    reader.readAsText(file);
  });
}

// Generate a short summary of the shared state for display
export function describeState(state: ShareableState): string {
  const team = state.league.teams.find((t) => t.id === state.userTeamId);
  const standings = [...state.league.standings].sort((a, b) => b.points - a.points);
  const position = standings.findIndex((s) => s.teamId === state.userTeamId) + 1;
  return `${team?.name ?? 'Unknown'} — ${position}th place, Season ${state.seasonNumber} Round ${state.round}, Budget: £${(state.budget / 1_000_000).toFixed(1)}M, Board: ${state.boardConfidence}%`;
}

// --- Scenario Presets ---

export interface Scenario {
  id: string;
  name: string;
  description: string;
  icon: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
  setup: (league: League) => { userTeamId: string; modifications: string };
}

export const SCENARIOS: Scenario[] = [
  {
    id: 'title_race',
    name: 'Title Race',
    description: 'You\'re 2nd, 3 points behind the leaders with 5 games left. Win the league.',
    icon: '🏆',
    difficulty: 'medium',
    setup: (league) => {
      // Put user team in 2nd place, close to 1st
      const sorted = [...league.standings].sort((a, b) => b.points - a.points);
      const userStanding = sorted[1];
      return { userTeamId: userStanding.teamId, modifications: 'Title race: 2nd place, 3pts behind, 5 games left' };
    },
  },
  {
    id: 'relegation_battle',
    name: 'Relegation Battle',
    description: 'You\'re 18th, 2 points from safety with 6 games left. Survive.',
    icon: '🔥',
    difficulty: 'hard',
    setup: (league) => {
      const sorted = [...league.standings].sort((a, b) => b.points - a.points);
      const userStanding = sorted[sorted.length - 3]; // 3rd from bottom
      return { userTeamId: userStanding.teamId, modifications: 'Relegation battle: 18th, 2pts from safety' };
    },
  },
  {
    id: 'rebuild',
    name: 'Club Rebuild',
    description: 'Take over a struggling club with a tiny budget. Build them into contenders over 3 seasons.',
    icon: '🔨',
    difficulty: 'hard',
    setup: (league) => {
      const sorted = [...league.standings].sort((a, b) => b.points - a.points);
      const userStanding = sorted[sorted.length - 1]; // Last place
      return { userTeamId: userStanding.teamId, modifications: 'Rebuild: last place, minimal budget, 3-season plan' };
    },
  },
  {
    id: 'youth_revolution',
    name: 'Youth Revolution',
    description: 'You can only sign players under 21. Build a team of wonderkids.',
    icon: '🌱',
    difficulty: 'extreme',
    setup: (league) => {
      const midTeam = league.teams[Math.floor(league.teams.length / 2)];
      return { userTeamId: midTeam.id, modifications: 'Youth only: can only sign U21 players' };
    },
  },
  {
    id: 'moneyball',
    name: 'Moneyball',
    description: 'No transfer budget. Sign only free agents and loans. Outsmart the market.',
    icon: '📊',
    difficulty: 'medium',
    setup: (league) => {
      const midTeam = league.teams[Math.floor(league.teams.length / 3)];
      return { userTeamId: midTeam.id, modifications: 'Moneyball: £0 budget, free agents and loans only' };
    },
  },
  {
    id: 'galacticos',
    name: 'Galácticos',
    description: 'Unlimited budget. Build the greatest team ever assembled. Win everything.',
    icon: '⭐',
    difficulty: 'easy',
    setup: (league) => {
      const topTeam = league.teams[0];
      return { userTeamId: topTeam.id, modifications: 'Galácticos: unlimited budget, sign anyone' };
    },
  },
];

// Generate a share URL compatible with GitHub Pages (calchulus.github.io/indie-fm/?load=...)
export function exportToURL(state: ShareableState): { url: string; tooLong: boolean } {
  const code = exportToCode(state);
  const encoded = encodeURIComponent(code);
  // Use current origin + pathname (works on localhost, GH Pages, custom domains)
  const base = `${window.location.origin}${window.location.pathname}`;
  const url = `${base}?load=${encoded}`;
  // Warn if URL exceeds practical limits (~8000 chars for most browsers)
  const tooLong = url.length > 8000;
  return { url, tooLong };
}

// Generate a compact share URL (scenario-only, no full state — always short)
export function exportScenarioURL(scenarioId: string, teamId: string, round: number): string {
  const base = `${window.location.origin}${window.location.pathname}`;
  return `${base}?scenario=${scenarioId}&team=${teamId}&round=${round}`;
}

// Parse a share code or scenario from URL params
export function parseURLParams(): { loadCode?: string; scenario?: string; team?: string; round?: number } {
  const params = new URLSearchParams(window.location.search);
  return {
    loadCode: params.get('load') ?? undefined,
    scenario: params.get('scenario') ?? undefined,
    team: params.get('team') ?? undefined,
    round: params.get('round') ? Number(params.get('round')) : undefined,
  };
}
