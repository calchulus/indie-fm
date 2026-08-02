import { Team, Tactics } from '../types';

export interface OnlineLeagueConfig {
  id: string;
  name: string;
  maxTeams: number;
  seasonLength: number;
  transferWindowRounds: [number, number];
  rules: {
    squadSize: number;
    budgetCap: number;
    loanLimit: number;
  };
}

export interface OnlineParticipant {
  userId: string;
  username: string;
  teamId: string;
  joinedAt: number;
  isActive: boolean;
}

export interface HeadToHeadSubmission {
  userId: string;
  teamId: string;
  fixtureId: string;
  tactics: Tactics;
  lineup: string[];
  submittedAt: number;
}

export interface AsyncMatchResult {
  fixtureId: string;
  homeUserId: string;
  awayUserId: string;
  homeGoals: number;
  awayGoals: number;
  resolvedAt: number;
}

export interface OnlineLeagueState {
  config: OnlineLeagueConfig;
  participants: OnlineParticipant[];
  submissions: HeadToHeadSubmission[];
  results: AsyncMatchResult[];
  currentRound: number;
  deadlineTimestamp: number | null;
}

export function createOnlineLeague(name: string, maxTeams: number = 20): OnlineLeagueConfig {
  return {
    id: `online_${Date.now()}`,
    name,
    maxTeams,
    seasonLength: (maxTeams - 1) * 2,
    transferWindowRounds: [1, 4],
    rules: {
      squadSize: 25,
      budgetCap: 100_000_000,
      loanLimit: 3,
    },
  };
}

export function validateSubmission(
  submission: HeadToHeadSubmission,
  team: Team,
  _config: OnlineLeagueConfig,
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (submission.lineup.length !== 11) {
    errors.push(`Lineup must have exactly 11 players (has ${submission.lineup.length})`);
  }

  for (const playerId of submission.lineup) {
    if (!team.players.some((p) => p.id === playerId)) {
      errors.push(`Player ${playerId} not in squad`);
    }
  }

  const gkCount = submission.lineup.filter((id) => {
    const p = team.players.find((pl) => pl.id === id);
    return p?.position === 'GK';
  }).length;
  if (gkCount !== 1) {
    errors.push(`Must have exactly 1 goalkeeper (has ${gkCount})`);
  }

  return { valid: errors.length === 0, errors };
}

export function resolveHeadToHead(
  homeSubmission: HeadToHeadSubmission,
  awaySubmission: HeadToHeadSubmission,
  homeTeam: Team,
  awayTeam: Team,
): AsyncMatchResult {
  const homeStrength = computeSubmissionStrength(homeSubmission, homeTeam);
  const awayStrength = computeSubmissionStrength(awaySubmission, awayTeam);

  const homeExpected = 1.3 * (homeStrength / (homeStrength + awayStrength)) * 2.5;
  const awayExpected = 1.0 * (awayStrength / (homeStrength + awayStrength)) * 2.5;

  const homeGoals = poissonSample(homeExpected);
  const awayGoals = poissonSample(awayExpected);

  return {
    fixtureId: homeSubmission.fixtureId,
    homeUserId: homeSubmission.userId,
    awayUserId: awaySubmission.userId,
    homeGoals,
    awayGoals,
    resolvedAt: Date.now(),
  };
}

function computeSubmissionStrength(submission: HeadToHeadSubmission, team: Team): number {
  const lineupPlayers = submission.lineup
    .map((id) => team.players.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => p != null);

  if (lineupPlayers.length === 0) return 50;

  const avgOverall = lineupPlayers.reduce((s, p) => s + p.overall, 0) / lineupPlayers.length;

  let tacticsBonus = 0;
  if (submission.tactics.mentality === 'attacking') tacticsBonus += 3;
  if (submission.tactics.pressing === 'high') tacticsBonus += 2;
  if (submission.tactics.tempo === 'fast') tacticsBonus += 1;

  return avgOverall + tacticsBonus;
}

function poissonSample(lambda: number): number {
  const L = Math.exp(-lambda);
  let k = 0;
  let p = 1;
  do {
    k++;
    p *= Math.random();
  } while (p > L);
  return k - 1;
}

export function generateOnlineFixtures(participants: OnlineParticipant[]): Array<{ round: number; homeUserId: string; awayUserId: string }> {
  const ids = participants.map((p) => p.userId);
  const n = ids.length;
  const fixtures: Array<{ round: number; homeUserId: string; awayUserId: string }> = [];

  for (let round = 0; round < n - 1; round++) {
    for (let i = 0; i < n / 2; i++) {
      const home = (round + i) % (n - 1);
      const away = (n - 1 - i + round) % (n - 1);
      fixtures.push({ round: round + 1, homeUserId: ids[home], awayUserId: ids[away] });
      fixtures.push({ round: round + n, homeUserId: ids[away], awayUserId: ids[home] });
    }
  }

  return fixtures;
}
