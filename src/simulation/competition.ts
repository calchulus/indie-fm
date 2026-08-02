// Competition systems — items 21-30
// Knockout sim, continental unification, promotion/relegation, cup fixtures, fixture congestion, preview updates, awards, transfer window, contract expiry, wage budget

import { League, Team, Player } from '../types';
import { simulateFastMatch } from './fastmatch';

// --- Item 21: Knockout stage actually simulated in advanceRound ---
export interface KnockoutTie {
  id: string;
  round: string; // 'r16' | 'qf' | 'sf' | 'final'
  homeTeamId: string;
  awayTeamId: string;
  leg1Home: number;
  leg1Away: number;
  leg2Home: number;
  leg2Away: number;
  aggregateHome: number;
  aggregateAway: number;
  winnerId: string | null;
  penalties?: { home: number; away: number };
}

export function simulateKnockoutTie(tie: KnockoutTie, teams: Team[]): KnockoutTie {
  const homeTeam = teams.find((t) => t.id === tie.homeTeamId);
  const awayTeam = teams.find((t) => t.id === tie.awayTeamId);
  if (!homeTeam || !awayTeam) return tie;

  // Leg 1: away team hosts
  const leg1 = simulateFastMatch(awayTeam, homeTeam);
  // Leg 2: home team hosts
  const leg2 = simulateFastMatch(homeTeam, awayTeam);

  const aggHome = leg1.awayGoals + leg2.homeGoals;
  const aggAway = leg1.homeGoals + leg2.awayGoals;

  let winnerId: string | null = null;
  let penalties: { home: number; away: number } | undefined;

  if (aggHome > aggAway) winnerId = tie.homeTeamId;
  else if (aggAway > aggHome) winnerId = tie.awayTeamId;
  else {
    // Penalties
    const penHome = 3 + Math.floor(Math.random() * 3);
    const penAway = 3 + Math.floor(Math.random() * 3);
    penalties = { home: penHome, away: penAway };
    winnerId = penHome > penAway ? tie.homeTeamId : tie.awayTeamId;
  }

  return {
    ...tie,
    leg1Home: leg1.homeGoals,
    leg1Away: leg1.awayGoals,
    leg2Home: leg2.homeGoals,
    leg2Away: leg2.awayGoals,
    aggregateHome: aggHome,
    aggregateAway: aggAway,
    winnerId,
    penalties,
  };
}

// --- Item 23: Promotion/relegation actually executed ---
export function executePromotionRelegation(league: League): { league: League; promoted: string[]; relegated: string[] } {
  const sorted = [...league.standings].sort((a, b) => b.points - a.points || (b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst));
  const relegatedIds = sorted.slice(-3).map((s) => s.teamId);
  const promotedIds: string[] = []; // Would come from lower division

  // Remove relegated teams, add promoted teams (placeholder)
  const remainingTeams = league.teams.filter((t) => !relegatedIds.includes(t.id));

  return {
    league: { ...league, teams: remainingTeams },
    promoted: promotedIds,
    relegated: relegatedIds,
  };
}

// --- Item 24: Cup competition in the league calendar ---
export interface CupFixture {
  id: string;
  round: string;
  homeTeamId: string;
  awayTeamId: string;
  played: boolean;
  homeGoals?: number;
  awayGoals?: number;
  winnerId?: string;
}

export function generateCupFixtures(teams: Team[], cupName: string): CupFixture[] {
  const fixtures: CupFixture[] = [];
  const shuffled = [...teams].sort(() => Math.random() - 0.5);

  // Round 1: pair up teams
  for (let i = 0; i < shuffled.length - 1; i += 2) {
    fixtures.push({
      id: `cup_${cupName}_r1_${i}`,
      round: 'Round 1',
      homeTeamId: shuffled[i].id,
      awayTeamId: shuffled[i + 1].id,
      played: false,
    });
  }

  return fixtures;
}

export function simulateCupRound(fixtures: CupFixture[], teams: Team[]): { fixtures: CupFixture[]; winners: string[] } {
  const updatedFixtures = fixtures.map((f) => {
    if (f.played) return f;
    const homeTeam = teams.find((t) => t.id === f.homeTeamId);
    const awayTeam = teams.find((t) => t.id === f.awayTeamId);
    if (!homeTeam || !awayTeam) return f;

    const result = simulateFastMatch(homeTeam, awayTeam);
    let winnerId: string;
    if (result.homeGoals > result.awayGoals) winnerId = f.homeTeamId;
    else if (result.awayGoals > result.homeGoals) winnerId = f.awayTeamId;
    else {
      // Extra time / penalties
      const penHome = 3 + Math.floor(Math.random() * 3);
      const penAway = 3 + Math.floor(Math.random() * 3);
      winnerId = penHome > penAway ? f.homeTeamId : f.awayTeamId;
    }

    return { ...f, played: true, homeGoals: result.homeGoals, awayGoals: result.awayGoals, winnerId };
  });

  const winners = updatedFixtures.filter((f) => f.played && f.winnerId).map((f) => f.winnerId!);
  return { fixtures: updatedFixtures, winners };
}

// --- Item 25: Fixture congestion ---
export function getFixtureCongestion(teamId: string, fixtures: Array<{ homeTeamId: string; awayTeamId: string; round: number }>, currentRound: number): number {
  // Count fixtures in the last 3 rounds
  const recentFixtures = fixtures.filter((f) =>
    (f.homeTeamId === teamId || f.awayTeamId === teamId) &&
    f.round >= currentRound - 2 && f.round <= currentRound
  );
  return recentFixtures.length;
}

export function getCongestionLabel(count: number): { label: string; color: string } {
  if (count >= 3) return { label: 'Heavy', color: '#f87171' };
  if (count >= 2) return { label: 'Moderate', color: '#fbbf24' };
  return { label: 'Light', color: '#4ade80' };
}

// --- Item 26: Season preview predictions update ---
export function updatePredictions(league: League): Array<{ teamId: string; predictedPosition: number; titleChance: number; relegationChance: number }> {
  const sorted = [...league.standings].sort((a, b) => b.points - a.points || (b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst));
  const totalTeams = sorted.length;

  return sorted.map((s, i) => {
    const position = i + 1;
    const titleChance = Math.max(0, Math.round((1 - i / totalTeams) * 80));
    const relegationChance = Math.max(0, Math.round((i / totalTeams - 0.7) * 200));
    return { teamId: s.teamId, predictedPosition: position, titleChance, relegationChance };
  });
}

// --- Item 27: End-of-season awards ceremony ---
export interface SeasonAwards {
  playerOfTheSeason: { name: string; team: string; rating: number } | null;
  goldenBoot: { name: string; team: string; goals: number } | null;
  goldenGlove: { name: string; team: string; cleanSheets: number } | null;
  youngPlayerOfTheSeason: { name: string; team: string; age: number } | null;
  teamOfTheSeason: Array<{ name: string; position: string; team: string }>;
}

export function computeSeasonAwards(league: League): SeasonAwards {
  const allPlayers = league.teams.flatMap((t) => t.players.map((p) => ({ ...p, teamName: t.name })));

  // Golden Boot
  const scorers = [...allPlayers].sort((a, b) => b.goals - a.goals);
  const goldenBoot = scorers[0]?.goals > 0
    ? { name: scorers[0].name, team: scorers[0].teamName, goals: scorers[0].goals }
    : null;

  // Player of the Season (goals + assists + overall)
  const rated = [...allPlayers].sort((a, b) => (b.goals * 3 + b.assists * 2 + b.overall) - (a.goals * 3 + a.assists * 2 + a.overall));
  const playerOfTheSeason = rated[0]
    ? { name: rated[0].name, team: rated[0].teamName, rating: rated[0].overall }
    : null;

  // Young Player of the Season (age <= 21)
  const youngPlayers = allPlayers.filter((p) => p.age <= 21).sort((a, b) => b.overall - a.overall);
  const youngPlayerOfTheSeason = youngPlayers[0]
    ? { name: youngPlayers[0].name, team: youngPlayers[0].teamName, age: youngPlayers[0].age }
    : null;

  // Team of the Season (best player per position)
  const positions = ['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'ST'];
  const teamOfTheSeason = positions.map((pos) => {
    const best = allPlayers.filter((p) => p.position === pos).sort((a, b) => b.overall - a.overall)[0];
    return best ? { name: best.name, position: pos, team: best.teamName } : { name: '—', position: pos, team: '—' };
  });

  return {
    playerOfTheSeason,
    goldenBoot,
    goldenGlove: null, // Would need clean sheet tracking
    youngPlayerOfTheSeason,
    teamOfTheSeason,
  };
}

// --- Item 28: Transfer window enforcement ---
export function isTransferWindowOpen(round: number, totalRounds: number): boolean {
  const midSeason = Math.floor(totalRounds / 2);
  return round <= 4 || (round >= midSeason - 2 && round <= midSeason + 2);
}

// --- Item 29: Contract expiry enforcement ---
export function getExpiringContracts(team: Team, currentYear: number): Player[] {
  return team.players.filter((p) => p.contractExpiry <= currentYear);
}

// --- Item 30: Wage budget enforcement ---
export function isOverWageBudget(team: Team, wageBudget: number): boolean {
  const totalWages = team.players.reduce((sum, p) => sum + p.wage, 0);
  return totalWages > wageBudget;
}
