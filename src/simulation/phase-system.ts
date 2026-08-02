// ZenGM-style phase system: full season loop
// PRESEASON → REGULAR_SEASON → AFTER_TRADE_DEADLINE → PLAYOFFS → DRAFT → FREE_AGENCY → RESIGN → (loop)

import { Player } from '../types';

// --- Phase Definitions ---
export enum Phase {
  PRESEASON = 0,
  REGULAR_SEASON = 1,
  AFTER_TRADE_DEADLINE = 2,
  PLAYOFFS = 3,
  DRAFT = 4,
  FREE_AGENCY = 5,
  RESIGN_PLAYERS = 6,
}

export const PHASE_TEXT: Record<Phase, string> = {
  [Phase.PRESEASON]: 'Preseason',
  [Phase.REGULAR_SEASON]: 'Regular Season',
  [Phase.AFTER_TRADE_DEADLINE]: 'After Trade Deadline',
  [Phase.PLAYOFFS]: 'Playoffs',
  [Phase.DRAFT]: 'Draft',
  [Phase.FREE_AGENCY]: 'Free Agency',
  [Phase.RESIGN_PLAYERS]: 'Re-Sign Players',
};

export interface SeasonState {
  phase: Phase;
  seasonNumber: number;
  round: number;
  totalRounds: number;
  tradeDeadlineRound: number;
  playoffRound: number;
  draftPick: number;
  freeAgencyDay: number;
}

export function createSeasonState(seasonNumber: number = 1, totalRounds: number = 38): SeasonState {
  return {
    phase: Phase.PRESEASON,
    seasonNumber,
    round: 0,
    totalRounds,
    tradeDeadlineRound: Math.floor(totalRounds * 0.74), // ~round 28 of 38
    playoffRound: 0,
    draftPick: 0,
    freeAgencyDay: 0,
  };
}

// --- Phase Transitions ---
export function getNextPhase(current: Phase): Phase {
  switch (current) {
    case Phase.PRESEASON: return Phase.REGULAR_SEASON;
    case Phase.REGULAR_SEASON: return Phase.AFTER_TRADE_DEADLINE;
    case Phase.AFTER_TRADE_DEADLINE: return Phase.PLAYOFFS;
    case Phase.PLAYOFFS: return Phase.DRAFT;
    case Phase.DRAFT: return Phase.FREE_AGENCY;
    case Phase.FREE_AGENCY: return Phase.RESIGN_PLAYERS;
    case Phase.RESIGN_PLAYERS: return Phase.PRESEASON;
  }
}

export function shouldTransitionPhase(state: SeasonState): boolean {
  switch (state.phase) {
    case Phase.PRESEASON: return state.round >= 2; // 2 preseason rounds
    case Phase.REGULAR_SEASON: return state.round >= state.tradeDeadlineRound;
    case Phase.AFTER_TRADE_DEADLINE: return state.round >= state.totalRounds;
    case Phase.PLAYOFFS: return state.playoffRound >= 4; // R16, QF, SF, Final
    case Phase.DRAFT: return state.draftPick >= 20; // 20 picks (1 per team)
    case Phase.FREE_AGENCY: return state.freeAgencyDay >= 5; // 5 days of FA
    case Phase.RESIGN_PLAYERS: return true; // Auto-advance after resigning
  }
}

export function isTradeEnabled(state: SeasonState): boolean {
  return state.phase === Phase.REGULAR_SEASON || state.phase === Phase.PRESEASON;
}

// --- Per-Match Player Stats ---
export interface PlayerMatchStats {
  playerId: string;
  playerName: string;
  teamId: string;
  matchId: string;
  round: number;
  season: number;
  minutes: number;
  rating: number;
  goals: number;
  assists: number;
  shots: number;
  shotsOnTarget: number;
  passesCompleted: number;
  passesFailed: number;
  tackles: number;
  saves: number;
  fouls: number;
  yellowCards: number;
  redCards: number;
  motm: boolean;
}

export function computePlayerMatchStats(
  player: Player,
  teamId: string,
  matchId: string,
  round: number,
  season: number,
  events: Array<{ type: string; playerId?: string; teamId: string; outcome: string; minute: number }>,
  matchMinute: number,
): PlayerMatchStats {
  const pEvents = events.filter((e) => e.playerId === player.id);
  const goals = pEvents.filter((e) => e.type === 'goal' && e.outcome === 'success').length;
  const saves = pEvents.filter((e) => e.type === 'save' && e.outcome === 'success').length;
  const tackles = pEvents.filter((e) => e.type === 'tackle' && e.outcome === 'success').length;
  const passesOk = pEvents.filter((e) => e.type === 'pass' && e.outcome === 'success').length;
  const passesFail = pEvents.filter((e) => e.type === 'pass' && e.outcome === 'failure').length;
  const shots = pEvents.filter((e) => e.type === 'shot').length;
  const shotsOnTarget = pEvents.filter((e) => e.type === 'shot' && e.outcome === 'success').length;
  const fouls = pEvents.filter((e) => e.type === 'foul').length;
  const yellowCards = pEvents.filter((e) => e.type === 'yellow_card').length;
  const redCards = pEvents.filter((e) => e.type === 'red_card').length;

  // Assists: pass followed by goal within 3 events
  let assists = 0;
  for (let i = 0; i < events.length; i++) {
    const evt = events[i];
    if (evt.playerId === player.id && evt.type === 'pass' && evt.outcome === 'success') {
      for (let j = i + 1; j < Math.min(i + 4, events.length); j++) {
        if (events[j].type === 'goal' && events[j].teamId === teamId && events[j].playerId !== player.id) {
          assists++; break;
        }
      }
    }
  }

  // Rating
  let rating = 6.0;
  rating += goals * 1.5 + assists * 0.8 + saves * 0.7 + tackles * 0.2;
  rating += passesOk * 0.03 - passesFail * 0.1;
  rating -= yellowCards * 0.5 + redCards * 2.0;
  rating += Math.min(0.5, matchMinute * 0.005);
  rating = Math.max(3, Math.min(10, Math.round(rating * 10) / 10));

  return {
    playerId: player.id, playerName: player.name, teamId, matchId, round, season,
    minutes: matchMinute, rating, goals, assists, shots, shotsOnTarget,
    passesCompleted: passesOk, passesFailed: passesFail, tackles, saves,
    fouls, yellowCards, redCards, motm: false,
  };
}

// --- Playoff System ---
export interface PlayoffSeries {
  round: number; // 0=R16, 1=QF, 2=SF, 3=Final
  homeId: string;
  awayId: string;
  homeGoals: number;
  awayGoals: number;
  winner: string | null;
  played: boolean;
}

export function generatePlayoffBracket(standings: Array<{ teamId: string; points: number }>): PlayoffSeries[] {
  const sorted = [...standings].sort((a, b) => b.points - a.points);
  const top16 = sorted.slice(0, 16);
  const series: PlayoffSeries[] = [];

  // Round of 16: 1v16, 2v15, 3v14, etc.
  for (let i = 0; i < 8; i++) {
    series.push({
      round: 0,
      homeId: top16[i].teamId,
      awayId: top16[15 - i].teamId,
      homeGoals: 0, awayGoals: 0, winner: null, played: false,
    });
  }
  return series;
}

export function advancePlayoffRound(series: PlayoffSeries[]): PlayoffSeries[] {
  // Determine winners of current round
  const currentRound = Math.max(...series.filter((s) => s.played).map((s) => s.round), 0);
  const currentSeries = series.filter((s) => s.round === currentRound && s.played);
  const winners = currentSeries.map((s) => s.winner!).filter(Boolean);

  if (winners.length < 2) return series;

  // Generate next round
  const nextRound = currentRound + 1;
  const nextSeries: PlayoffSeries[] = [];
  for (let i = 0; i < winners.length; i += 2) {
    nextSeries.push({
      round: nextRound,
      homeId: winners[i],
      awayId: winners[i + 1] ?? winners[i],
      homeGoals: 0, awayGoals: 0, winner: null, played: false,
    });
  }
  return [...series, ...nextSeries];
}

// --- Draft System ---
export interface DraftPick {
  pick: number;
  teamId: string;
  playerId: string | null;
  playerName: string | null;
}

export function generateDraftOrder(standings: Array<{ teamId: string; points: number }>): string[] {
  // Worst record picks first
  return [...standings].sort((a, b) => a.points - b.points).map((s) => s.teamId);
}

export function generateDraftProspects(count: number): Array<{ id: string; name: string; position: string; age: number; potential: number; overall: number }> {
  const positions = ['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'ST'];
  const first = ['James', 'Oliver', 'Harry', 'Jack', 'Leo', 'Charlie', 'Archie', 'Theo', 'Luca', 'Oscar', 'Freddie', 'George'];
  const last = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Wilson', 'Moore', 'Taylor', 'Anderson'];

  return Array.from({ length: count }, (_, i) => {
    const potential = 3 + Math.floor(Math.random() * 3); // 3-5 stars
    const overall = 35 + Math.floor(Math.random() * 20); // 35-55
    return {
      id: `draft_${i}_${Date.now()}`,
      name: `${first[Math.floor(Math.random() * first.length)]} ${last[Math.floor(Math.random() * last.length)]}`,
      position: positions[Math.floor(Math.random() * positions.length)],
      age: 17 + Math.floor(Math.random() * 2),
      potential,
      overall,
    };
  });
}

// --- Free Agency ---
export interface FreeAgentListing {
  playerId: string;
  playerName: string;
  position: string;
  overall: number;
  age: number;
  askingWage: number;
  daysAvailable: number;
  offers: number;
}

export function generateFreeAgentPool(count: number): FreeAgentListing[] {
  const positions = ['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'ST'];
  const first = ['Marco', 'Carlos', 'Hans', 'Pierre', 'Kenji', 'Omar', 'Lars', 'Diego', 'Andre', 'Viktor'];
  const last = ['Rossi', 'Mendez', 'Mueller', 'Dubois', 'Tanaka', 'Hassan', 'Eriksson', 'Silva', 'Petrov', 'Nakamura'];

  return Array.from({ length: count }, (_, i) => {
    const overall = 45 + Math.floor(Math.random() * 30);
    return {
      playerId: `fa_${i}_${Date.now()}`,
      playerName: `${first[Math.floor(Math.random() * first.length)]} ${last[Math.floor(Math.random() * last.length)]}`,
      position: positions[Math.floor(Math.random() * positions.length)],
      overall,
      age: 22 + Math.floor(Math.random() * 12),
      askingWage: overall * 100 + Math.floor(Math.random() * 5000),
      daysAvailable: 0,
      offers: 0,
    };
  });
}

// --- Awards ---
export interface SeasonAwards {
  mvp: { playerId: string; playerName: string; rating: number } | null;
  topScorer: { playerId: string; playerName: string; goals: number } | null;
  mostAssists: { playerId: string; playerName: string; assists: number } | null;
  bestGK: { playerId: string; playerName: string; saves: number } | null;
  youngPOTS: { playerId: string; playerName: string; rating: number } | null;
}

export function computeSeasonAwards(allStats: PlayerMatchStats[]): SeasonAwards {
  if (allStats.length === 0) return { mvp: null, topScorer: null, mostAssists: null, bestGK: null, youngPOTS: null };

  // Aggregate per player
  const playerAgg = new Map<string, { name: string; totalRating: number; games: number; goals: number; assists: number; saves: number }>();
  for (const stat of allStats) {
    const agg = playerAgg.get(stat.playerId) ?? { name: stat.playerName, totalRating: 0, games: 0, goals: 0, assists: 0, saves: 0 };
    agg.totalRating += stat.rating;
    agg.games++;
    agg.goals += stat.goals;
    agg.assists += stat.assists;
    agg.saves += stat.saves;
    playerAgg.set(stat.playerId, agg);
  }

  const players = [...playerAgg.entries()].map(([id, agg]) => ({ id, ...agg, avgRating: agg.totalRating / Math.max(1, agg.games) }));
  const withMinGames = players.filter((p) => p.games >= 10);

  const mvp = withMinGames.sort((a, b) => b.avgRating - a.avgRating)[0];
  const topScorer = players.sort((a, b) => b.goals - a.goals)[0];
  const mostAssists = players.sort((a, b) => b.assists - a.assists)[0];
  const bestGK = players.filter((p) => p.saves > 0).sort((a, b) => b.saves - a.saves)[0];

  return {
    mvp: mvp ? { playerId: mvp.id, playerName: mvp.name, rating: Math.round(mvp.avgRating * 10) / 10 } : null,
    topScorer: topScorer ? { playerId: topScorer.id, playerName: topScorer.name, goals: topScorer.goals } : null,
    mostAssists: mostAssists ? { playerId: mostAssists.id, playerName: mostAssists.name, assists: mostAssists.assists } : null,
    bestGK: bestGK ? { playerId: bestGK.id, playerName: bestGK.name, saves: bestGK.saves } : null,
    youngPOTS: null, // Would need age data
  };
}

// --- Statistical Leaders ---
export interface StatLeader {
  playerId: string;
  playerName: string;
  teamId: string;
  value: number;
}

export function getStatLeaders(allStats: PlayerMatchStats[], stat: 'goals' | 'assists' | 'rating' | 'saves' | 'tackles', limit: number = 10): StatLeader[] {
  const agg = new Map<string, { name: string; teamId: string; total: number; games: number }>();
  for (const s of allStats) {
    const entry = agg.get(s.playerId) ?? { name: s.playerName, teamId: s.teamId, total: 0, games: 0 };
    entry.total += stat === 'rating' ? s.rating : (s as any)[stat] ?? 0;
    entry.games++;
    agg.set(s.playerId, entry);
  }

  return [...agg.entries()]
    .map(([id, e]) => ({ playerId: id, playerName: e.name, teamId: e.teamId, value: stat === 'rating' ? Math.round((e.total / e.games) * 10) / 10 : e.total }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
}

// --- Owner Mood ---
export interface OwnerMood {
  wins: number; // 0-100
  playoffs: number; // 0-100
  finances: number; // 0-100
  overall: number;
}

export function updateOwnerMood(current: OwnerMood, won: boolean, madePlayoffs: boolean, profit: boolean): OwnerMood {
  const wins = Math.max(0, Math.min(100, current.wins + (won ? 3 : -2)));
  const playoffs = madePlayoffs ? Math.min(100, current.playoffs + 10) : current.playoffs;
  const finances = Math.max(0, Math.min(100, current.finances + (profit ? 2 : -1)));
  const overall = Math.round((wins + playoffs + finances) / 3);
  return { wins, playoffs, finances, overall };
}
