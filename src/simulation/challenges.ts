import { League } from '../types';
import { createClub } from './club';

export function insertCustomClub(
  league: League,
  clubName: string,
  city: string,
  stadiumName: string,
  capacity: number,
  budget: number,
  colors: { primary: string; secondary: string },
  replaceIndex: number = -1,
): { league: League; newTeamId: string } {
  const newClub = createClub(clubName, city, stadiumName, capacity, budget, colors);

  const teams = [...league.teams];
  if (replaceIndex >= 0 && replaceIndex < teams.length) {
    teams[replaceIndex] = newClub;
  } else {
    // Replace the weakest team
    const weakestIdx = teams.reduce((minIdx, t, i, arr) =>
      t.reputation < arr[minIdx].reputation ? i : minIdx, 0);
    teams[weakestIdx] = newClub;
  }

  // Rebuild fixtures with the new team
  const updatedFixtures = league.fixtures.map((f) => {
    const oldTeamId = replaceIndex >= 0 ? league.teams[replaceIndex].id : league.teams[0].id;
    return {
      ...f,
      homeTeamId: f.homeTeamId === oldTeamId ? newClub.id : f.homeTeamId,
      awayTeamId: f.awayTeamId === oldTeamId ? newClub.id : f.awayTeamId,
    };
  });

  const updatedStandings = league.standings.map((s) => {
    const oldTeamId = replaceIndex >= 0 ? league.teams[replaceIndex].id : league.teams[0].id;
    return s.teamId === oldTeamId ? { ...s, teamId: newClub.id } : s;
  });

  return {
    league: { ...league, teams, fixtures: updatedFixtures, standings: updatedStandings },
    newTeamId: newClub.id,
  };
}

export interface ChallengeConstraints {
  maxBudget?: number;
  noSignings?: boolean;
  youthOnly?: boolean;
  maxSquadSize?: number;
  unbeaten?: boolean;
}

export function validateChallengeAction(
  constraints: ChallengeConstraints,
  action: 'transfer' | 'squad_add',
  context?: { playerAge?: number; squadSize?: number; budget?: number },
): { allowed: boolean; reason?: string } {
  if (action === 'transfer') {
    if (constraints.noSignings) {
      return { allowed: false, reason: 'Challenge: No signings allowed' };
    }
    if (constraints.maxBudget && context?.budget && context.budget > constraints.maxBudget) {
      return { allowed: false, reason: `Challenge: Budget capped at £${(constraints.maxBudget / 1_000_000).toFixed(1)}M` };
    }
    if (constraints.youthOnly && context?.playerAge && context.playerAge > 21) {
      return { allowed: false, reason: 'Challenge: Only players aged 21 or under' };
    }
  }

  if (action === 'squad_add') {
    if (constraints.maxSquadSize && context?.squadSize && context.squadSize >= constraints.maxSquadSize) {
      return { allowed: false, reason: `Challenge: Squad capped at ${constraints.maxSquadSize} players` };
    }
  }

  return { allowed: true };
}

export function checkUnbeatenConstraint(league: League, userTeamId: string): boolean {
  const userFixtures = league.fixtures.filter(
    (f) => f.played && (f.homeTeamId === userTeamId || f.awayTeamId === userTeamId)
  );
  return userFixtures.every((f) => {
    const isHome = f.homeTeamId === userTeamId;
    const gf = isHome ? f.homeGoals! : f.awayGoals!;
    const ga = isHome ? f.awayGoals! : f.homeGoals!;
    return gf >= ga;
  });
}
