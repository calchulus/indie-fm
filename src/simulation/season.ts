import { League, Fixture, LeagueStanding, Team } from '../types';
import { initMatchState, simulateMinutes } from './engine';
import { simulateFastMatch } from './fastmatch';

export interface MatchResult {
  fixtureId: string;
  homeTeamId: string;
  awayTeamId: string;
  homeGoals: number;
  awayGoals: number;
}

export function simulateFixture(fixture: Fixture, home: Team, away: Team): MatchResult {
  let state = initMatchState(home, away);
  state = simulateMinutes(state, home, away, 90);
  return {
    fixtureId: fixture.id,
    homeTeamId: home.id,
    awayTeamId: away.id,
    homeGoals: state.homeScore,
    awayGoals: state.awayScore,
  };
}

export function simulateRound(league: League): { league: League; results: MatchResult[] } {
  const round = league.currentRound;
  const roundFixtures = league.fixtures.filter((f) => f.round === round && !f.played);
  const results: MatchResult[] = [];

  const updatedFixtures = [...league.fixtures];
  const updatedStandings = league.standings.map((s) => ({ ...s }));

  for (const fixture of roundFixtures) {
    const home = league.teams.find((t) => t.id === fixture.homeTeamId);
    const away = league.teams.find((t) => t.id === fixture.awayTeamId);
    if (!home || !away) continue;

    const result = simulateFixture(fixture, home, away);
    results.push(result);

    const fIdx = updatedFixtures.findIndex((f) => f.id === fixture.id);
    if (fIdx >= 0) {
      updatedFixtures[fIdx] = {
        ...updatedFixtures[fIdx],
        played: true,
        homeGoals: result.homeGoals,
        awayGoals: result.awayGoals,
      };
    }

    updateStanding(updatedStandings, result.homeTeamId, result.homeGoals, result.awayGoals);
    updateStanding(updatedStandings, result.awayTeamId, result.awayGoals, result.homeGoals);
  }

  const maxRound = Math.max(...league.fixtures.map((f) => f.round));
  const nextRound = round < maxRound ? round + 1 : round;

  return {
    league: {
      ...league,
      fixtures: updatedFixtures,
      standings: updatedStandings,
      currentRound: nextRound,
    },
    results,
  };
}

export function simulateSeason(league: League): { league: League; allResults: MatchResult[] } {
  let current = league;
  const allResults: MatchResult[] = [];
  const maxRound = Math.max(...league.fixtures.map((f) => f.round));

  while (current.currentRound <= maxRound) {
    const roundFixtures = current.fixtures.filter((f) => f.round === current.currentRound && !f.played);
    if (roundFixtures.length === 0) {
      current = { ...current, currentRound: current.currentRound + 1 };
      continue;
    }

    const updatedFixtures = [...current.fixtures];
    const updatedStandings = current.standings.map((s) => ({ ...s }));
    const results: MatchResult[] = [];

    for (const fixture of roundFixtures) {
      const home = current.teams.find((t) => t.id === fixture.homeTeamId);
      const away = current.teams.find((t) => t.id === fixture.awayTeamId);
      if (!home || !away) continue;

      // Use fast resolver instead of tick-based engine (60× faster)
      const fast = simulateFastMatch(home, away);
      const result: MatchResult = {
        fixtureId: fixture.id,
        homeTeamId: home.id,
        awayTeamId: away.id,
        homeGoals: fast.homeGoals,
        awayGoals: fast.awayGoals,
      };
      results.push(result);

      const fIdx = updatedFixtures.findIndex((f) => f.id === fixture.id);
      if (fIdx >= 0) {
        updatedFixtures[fIdx] = { ...updatedFixtures[fIdx], played: true, homeGoals: fast.homeGoals, awayGoals: fast.awayGoals };
      }
      updateStanding(updatedStandings, result.homeTeamId, result.homeGoals, result.awayGoals);
      updateStanding(updatedStandings, result.awayTeamId, result.awayGoals, result.homeGoals);
    }

    allResults.push(...results);
    current = { ...current, fixtures: updatedFixtures, standings: updatedStandings, currentRound: current.currentRound + 1 };
  }

  return { league: current, allResults };
}

function updateStanding(standings: LeagueStanding[], teamId: string, goalsFor: number, goalsAgainst: number): void {
  const s = standings.find((st) => st.teamId === teamId);
  if (!s) return;
  s.played++;
  s.goalsFor += goalsFor;
  s.goalsAgainst += goalsAgainst;
  if (goalsFor > goalsAgainst) {
    s.won++;
    s.points += 3;
  } else if (goalsFor === goalsAgainst) {
    s.drawn++;
    s.points += 1;
  } else {
    s.lost++;
  }
}

export function getSortedStandings(standings: LeagueStanding[]): LeagueStanding[] {
  return [...standings].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const gdA = a.goalsFor - a.goalsAgainst;
    const gdB = b.goalsFor - b.goalsAgainst;
    if (gdB !== gdA) return gdB - gdA;
    return b.goalsFor - a.goalsFor;
  });
}

export function getFormGuide(league: League, teamId: string, lastN: number = 5): string[] {
  const teamFixtures = league.fixtures
    .filter((f) => f.played && (f.homeTeamId === teamId || f.awayTeamId === teamId))
    .sort((a, b) => b.round - a.round)
    .slice(0, lastN);

  return teamFixtures.map((f) => {
    const isHome = f.homeTeamId === teamId;
    const gf = isHome ? f.homeGoals! : f.awayGoals!;
    const ga = isHome ? f.awayGoals! : f.homeGoals!;
    if (gf > ga) return 'W';
    if (gf === ga) return 'D';
    return 'L';
  }).reverse();
}
