import { Team } from '../types';
import { simulateFixture, MatchResult } from './season';

export interface CupRound {
  name: string;
  fixtures: CupFixture[];
  played: boolean;
}

export interface CupFixture {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  played: boolean;
  homeGoals?: number;
  awayGoals?: number;
  extraTime?: boolean;
  penalties?: { home: number; away: number };
  winnerId?: string;
}

export interface CupCompetition {
  id: string;
  name: string;
  teams: string[];
  rounds: CupRound[];
  currentRoundIndex: number;
  winnerId?: string;
}

export function createCup(name: string, teamIds: string[]): CupCompetition {
  const shuffled = [...teamIds].sort(() => Math.random() - 0.5);
  const firstRound = createRoundFixtures(shuffled, 'Round 1');

  return {
    id: `cup_${Date.now()}`,
    name,
    teams: teamIds,
    rounds: [firstRound],
    currentRoundIndex: 0,
  };
}

function createRoundFixtures(teamIds: string[], roundName: string): CupRound {
  const fixtures: CupFixture[] = [];
  for (let i = 0; i < teamIds.length; i += 2) {
    if (i + 1 < teamIds.length) {
      fixtures.push({
        id: `cup_fix_${roundName}_${i}`,
        homeTeamId: teamIds[i],
        awayTeamId: teamIds[i + 1],
        played: false,
      });
    } else {
      fixtures.push({
        id: `cup_fix_${roundName}_bye_${i}`,
        homeTeamId: teamIds[i],
        awayTeamId: '',
        played: true,
        homeGoals: 1,
        awayGoals: 0,
        winnerId: teamIds[i],
      });
    }
  }
  return { name: roundName, fixtures, played: false };
}

export function simulateCupRound(
  cup: CupCompetition,
  teams: Team[],
): { cup: CupCompetition; results: MatchResult[] } {
  const round = cup.rounds[cup.currentRoundIndex];
  const results: MatchResult[] = [];
  const winners: string[] = [];

  const updatedFixtures = round.fixtures.map((fixture) => {
    if (fixture.played && fixture.winnerId) {
      winners.push(fixture.winnerId);
      return fixture;
    }
    if (!fixture.awayTeamId) {
      winners.push(fixture.homeTeamId);
      return { ...fixture, played: true, winnerId: fixture.homeTeamId };
    }

    const home = teams.find((t) => t.id === fixture.homeTeamId);
    const away = teams.find((t) => t.id === fixture.awayTeamId);
    if (!home || !away) return fixture;

    const result = simulateFixture(
      { id: fixture.id, round: 0, homeTeamId: fixture.homeTeamId, awayTeamId: fixture.awayTeamId, played: false },
      home, away,
    );
    results.push(result);

    let winnerId: string;
    let extraTime = false;
    let penalties: { home: number; away: number } | undefined;

    if (result.homeGoals !== result.awayGoals) {
      winnerId = result.homeGoals > result.awayGoals ? fixture.homeTeamId : fixture.awayTeamId;
    } else {
      extraTime = true;
      const etHome = Math.random() < 0.3 ? 1 : 0;
      const etAway = Math.random() < 0.3 ? 1 : 0;
      const totalHome = result.homeGoals + etHome;
      const totalAway = result.awayGoals + etAway;

      if (totalHome !== totalAway) {
        winnerId = totalHome > totalAway ? fixture.homeTeamId : fixture.awayTeamId;
        result.homeGoals = totalHome;
        result.awayGoals = totalAway;
      } else {
        penalties = { home: 3 + Math.floor(Math.random() * 3), away: 3 + Math.floor(Math.random() * 3) };
        while (penalties.home === penalties.away) {
          penalties.home += Math.random() < 0.7 ? 1 : 0;
          penalties.away += Math.random() < 0.7 ? 1 : 0;
        }
        winnerId = penalties.home > penalties.away ? fixture.homeTeamId : fixture.awayTeamId;
      }
    }

    winners.push(winnerId);
    return {
      ...fixture,
      played: true,
      homeGoals: result.homeGoals,
      awayGoals: result.awayGoals,
      extraTime,
      penalties,
      winnerId,
    };
  });

  const updatedRounds = [...cup.rounds];
  updatedRounds[cup.currentRoundIndex] = { ...round, fixtures: updatedFixtures, played: true };

  const roundNames = ['Round 1', 'Round 2', 'Round 3', 'Quarter-Final', 'Semi-Final', 'Final'];
  const nextRoundIdx = cup.currentRoundIndex + 1;
  const isComplete = winners.length <= 1;

  if (!isComplete && winners.length > 1) {
    const nextName = roundNames[Math.min(nextRoundIdx, roundNames.length - 1)];
    updatedRounds.push(createRoundFixtures(winners, nextName));
  }

  return {
    cup: {
      ...cup,
      rounds: updatedRounds,
      currentRoundIndex: isComplete ? cup.currentRoundIndex : nextRoundIdx,
      winnerId: isComplete ? winners[0] : undefined,
    },
    results,
  };
}

export function simulateFullCup(cup: CupCompetition, teams: Team[]): CupCompetition {
  let current = cup;
  let iterations = 0;
  while (!current.winnerId && iterations < 20) {
    const { cup: updated } = simulateCupRound(current, teams);
    current = updated;
    iterations++;
  }
  return current;
}
