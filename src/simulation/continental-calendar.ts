import { League } from '../types';

export interface ContinentalFixture {
  id: string;
  round: number;
  matchday: number; // Which league round this continental match is played alongside
  homeTeamId: string;
  awayTeamId: string;
  played: boolean;
  homeGoals?: number;
  awayGoals?: number;
  stage: 'group' | 'r16' | 'qf' | 'sf' | 'final';
  group?: string;
}

export interface ContinentalStanding {
  teamId: string;
  group: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  points: number;
}

export interface ContinentalState {
  name: string;
  fixtures: ContinentalFixture[];
  standings: ContinentalStanding[];
  currentStage: 'group' | 'r16' | 'qf' | 'sf' | 'final' | 'complete';
  qualifiedTeams: string[];
}

// Generate continental fixtures interleaved with the league calendar
// Continental matches are played on specific league rounds (every 4th round)
export function generateContinentalCalendar(league: League, numTeams: number = 16): ContinentalState {
  // Qualify top teams by reputation
  const qualified = [...league.teams]
    .sort((a, b) => b.reputation - a.reputation)
    .slice(0, numTeams)
    .map((t) => t.id);

  // Create 4 groups of 4
  const groups: string[][] = [[], [], [], []];
  for (let i = 0; i < qualified.length; i++) {
    groups[i % 4].push(qualified[i]);
  }

  const fixtures: ContinentalFixture[] = [];
  const groupNames = ['A', 'B', 'C', 'D'];
  const totalLeagueRounds = Math.max(...league.fixtures.map((f) => f.round));

  // Group stage: 6 matchdays, played every 4th league round
  for (let g = 0; g < 4; g++) {
    const groupTeams = groups[g];
    if (groupTeams.length < 4) continue;

    // Round-robin within group (home and away = 6 matchdays)
    let matchday = 0;
    for (let i = 0; i < groupTeams.length; i++) {
      for (let j = i + 1; j < groupTeams.length; j++) {
        // Home match
        const leagueRound1 = Math.min(totalLeagueRounds, (matchday + 1) * 4);
        fixtures.push({
          id: `cl_${groupNames[g]}_${i}_${j}_h`,
          round: matchday + 1,
          matchday: leagueRound1,
          homeTeamId: groupTeams[i],
          awayTeamId: groupTeams[j],
          played: false,
          stage: 'group',
          group: groupNames[g],
        });
        // Away match
        const leagueRound2 = Math.min(totalLeagueRounds, (matchday + 4) * 4);
        fixtures.push({
          id: `cl_${groupNames[g]}_${i}_${j}_a`,
          round: matchday + 4,
          matchday: leagueRound2,
          homeTeamId: groupTeams[j],
          awayTeamId: groupTeams[i],
          played: false,
          stage: 'group',
          group: groupNames[g],
        });
        matchday++;
      }
    }
  }

  // Initialize standings
  const standings: ContinentalStanding[] = qualified.map((teamId) => ({
    teamId,
    group: groupNames[qualified.indexOf(teamId) % 4],
    played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0,
  }));

  return {
    name: 'Indie Champions League',
    fixtures,
    standings,
    currentStage: 'group',
    qualifiedTeams: qualified,
  };
}

// Check if a continental match should be played on this league round
export function getContinentalMatchesForRound(state: ContinentalState, leagueRound: number): ContinentalFixture[] {
  return state.fixtures.filter((f) => f.matchday === leagueRound && !f.played);
}

// Simulate a continental match
export function simulateContinentalMatch(
  _fixture: ContinentalFixture,
  homeStrength: number,
  awayStrength: number,
): { homeGoals: number; awayGoals: number } {
  const homeXG = 1.3 * (homeStrength / (homeStrength + awayStrength)) * 2.2;
  const awayXG = 1.0 * (awayStrength / (homeStrength + awayStrength)) * 2.2;

  const poisson = (lambda: number) => {
    const L = Math.exp(-lambda);
    let k = 0, p = 1;
    do { k++; p *= Math.random(); } while (p > L);
    return k - 1;
  };

  return { homeGoals: poisson(homeXG), awayGoals: poisson(awayXG) };
}

// Update standings after a continental match
export function updateContinentalStandings(
  standings: ContinentalStanding[],
  fixture: ContinentalFixture,
  homeGoals: number,
  awayGoals: number,
): ContinentalStanding[] {
  return standings.map((s) => {
    if (s.teamId === fixture.homeTeamId) {
      const ns = { ...s, played: s.played + 1, gf: s.gf + homeGoals, ga: s.ga + awayGoals };
      if (homeGoals > awayGoals) { ns.won++; ns.points += 3; }
      else if (homeGoals === awayGoals) { ns.drawn++; ns.points += 1; }
      else ns.lost++;
      return ns;
    }
    if (s.teamId === fixture.awayTeamId) {
      const ns = { ...s, played: s.played + 1, gf: s.gf + awayGoals, ga: s.ga + homeGoals };
      if (awayGoals > homeGoals) { ns.won++; ns.points += 3; }
      else if (awayGoals === homeGoals) { ns.drawn++; ns.points += 1; }
      else ns.lost++;
      return ns;
    }
    return s;
  });
}

// Get qualified teams from group stage (top 2 per group)
export function getGroupStageQualifiers(standings: ContinentalStanding[]): string[] {
  const groupWinners: string[] = [];
  const groups = ['A', 'B', 'C', 'D'];
  for (const g of groups) {
    const groupStandings = standings
      .filter((s) => s.group === g)
      .sort((a, b) => b.points - a.points || (b.gf - b.ga) - (a.gf - a.ga));
    if (groupStandings.length >= 2) {
      groupWinners.push(groupStandings[0].teamId, groupStandings[1].teamId);
    }
  }
  return groupWinners;
}
