import { League } from '../types';
import { getSortedStandings } from './season';

export interface SeasonRecord {
  season: number;
  championId: string;
  championName: string;
  runnerUpId: string;
  runnerUpName: string;
  relegatedIds: string[];
  promotedIds: string[];
  topScorerId?: string;
  topScorerName?: string;
  topScorerGoals: number;
  userTeamId: string;
  userPosition: number;
  userPoints: number;
}

export interface ClubRecords {
  biggestWin: { scoreline: string; opponent: string; season: number } | null;
  biggestLoss: { scoreline: string; opponent: string; season: number } | null;
  longestUnbeaten: number;
  mostGoalsInSeason: number;
  fewestGoalsConceded: number;
  highestPoints: number;
  titlesWon: number;
  seasonsPlayed: number;
}

export function computeSeasonRecord(league: League, userTeamId: string, season: number): SeasonRecord {
  const sorted = getSortedStandings(league.standings);
  const champion = sorted[0];
  const runnerUp = sorted[1];
  const relegated = sorted.slice(-3);

  const championTeam = league.teams.find((t) => t.id === champion.teamId);
  const runnerUpTeam = league.teams.find((t) => t.id === runnerUp.teamId);

  // Find top scorer
  let topScorer: { id: string; name: string; goals: number } | null = null;
  for (const team of league.teams) {
    for (const player of team.players) {
      if (!topScorer || player.goals > topScorer.goals) {
        topScorer = { id: player.id, name: player.name, goals: player.goals };
      }
    }
  }

  const userStanding = sorted.find((s) => s.teamId === userTeamId);
  const userPosition = userStanding ? sorted.indexOf(userStanding) + 1 : 0;

  return {
    season,
    championId: champion.teamId,
    championName: championTeam?.name ?? '?',
    runnerUpId: runnerUp.teamId,
    runnerUpName: runnerUpTeam?.name ?? '?',
    relegatedIds: relegated.map((s) => s.teamId),
    promotedIds: [],
    topScorerId: topScorer?.id,
    topScorerName: topScorer?.name,
    topScorerGoals: topScorer?.goals ?? 0,
    userTeamId,
    userPosition,
    userPoints: userStanding?.points ?? 0,
  };
}

export function createClubRecords(): ClubRecords {
  return {
    biggestWin: null,
    biggestLoss: null,
    longestUnbeaten: 0,
    mostGoalsInSeason: 0,
    fewestGoalsConceded: 999,
    highestPoints: 0,
    titlesWon: 0,
    seasonsPlayed: 0,
  };
}

export function updateClubRecords(
  records: ClubRecords,
  seasonRecord: SeasonRecord,
  league: League,
  userTeamId: string,
): ClubRecords {
  const updated = { ...records };
  updated.seasonsPlayed++;

  const userStanding = league.standings.find((s) => s.teamId === userTeamId);
  if (userStanding) {
    if (userStanding.goalsFor > updated.mostGoalsInSeason) {
      updated.mostGoalsInSeason = userStanding.goalsFor;
    }
    if (userStanding.goalsAgainst < updated.fewestGoalsConceded) {
      updated.fewestGoalsConceded = userStanding.goalsAgainst;
    }
    if (userStanding.points > updated.highestPoints) {
      updated.highestPoints = userStanding.points;
    }
  }

  if (seasonRecord.championId === userTeamId) {
    updated.titlesWon++;
  }

  // Check match results for biggest win/loss
  const userFixtures = league.fixtures.filter(
    (f) => f.played && (f.homeTeamId === userTeamId || f.awayTeamId === userTeamId)
  );
  for (const f of userFixtures) {
    const isHome = f.homeTeamId === userTeamId;
    const gf = isHome ? f.homeGoals! : f.awayGoals!;
    const ga = isHome ? f.awayGoals! : f.homeGoals!;
    const diff = gf - ga;
    const opponent = league.teams.find((t) => t.id === (isHome ? f.awayTeamId : f.homeTeamId));
    const opponentName = opponent?.name ?? '?';
    const scoreline = `${gf}-${ga}`;

    if (diff > 0 && (!updated.biggestWin || diff > parseDiff(updated.biggestWin.scoreline))) {
      updated.biggestWin = { scoreline, opponent: opponentName, season: seasonRecord.season };
    }
    if (diff < 0 && (!updated.biggestLoss || -diff > -parseDiff(updated.biggestLoss.scoreline))) {
      updated.biggestLoss = { scoreline, opponent: opponentName, season: seasonRecord.season };
    }
  }

  return updated;
}

function parseDiff(scoreline: string): number {
  const [gf, ga] = scoreline.split('-').map(Number);
  return gf - ga;
}
