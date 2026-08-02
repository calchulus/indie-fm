import { Team } from '../types';

export interface BoardExpectation {
  type: 'league_position' | 'cup_progress' | 'financial' | 'youth' | 'style';
  target: string;
  priority: 'critical' | 'important' | 'desirable';
  met: boolean;
}

export interface BoardState {
  confidence: number;
  expectations: BoardExpectation[];
  transferBudget: number;
  wageBudget: number;
  facilityLevel: { training: number; youth: number; stadium: number };
  takeoverOffer: boolean;
}

export interface FinancialRecord {
  round: number;
  income: { matchday: number; broadcast: number; commercial: number; transfers: number };
  expenditure: { wages: number; transfers: number; operations: number };
  balance: number;
}

export interface ClubFinances {
  balance: number;
  records: FinancialRecord[];
  sponsorship: { name: string; annual: number; yearsLeft: number };
  ticketPrice: number;
  averageAttendance: number;
  debt: number;
}

export function createBoardState(team: Team, _leaguePosition: number): BoardState {
  const expectations: BoardExpectation[] = [];

  if (team.reputation > 70) {
    expectations.push({ type: 'league_position', target: 'Top 4', priority: 'critical', met: false });
    expectations.push({ type: 'cup_progress', target: 'Semi-Final', priority: 'important', met: false });
  } else if (team.reputation > 50) {
    expectations.push({ type: 'league_position', target: 'Top 10', priority: 'critical', met: false });
    expectations.push({ type: 'cup_progress', target: 'Quarter-Final', priority: 'desirable', met: false });
  } else {
    expectations.push({ type: 'league_position', target: 'Avoid Relegation', priority: 'critical', met: false });
    expectations.push({ type: 'financial', target: 'Stay within budget', priority: 'important', met: false });
  }
  expectations.push({ type: 'youth', target: 'Develop 1 youth player', priority: 'desirable', met: false });

  return {
    confidence: 65,
    expectations,
    transferBudget: team.budget,
    wageBudget: Math.round(team.budget * 0.6),
    facilityLevel: { training: 3, youth: 3, stadium: 3 },
    takeoverOffer: false,
  };
}

export function updateBoardConfidence(board: BoardState, won: boolean, leaguePosition: number, totalTeams: number): BoardState {
  let confidence = board.confidence;

  if (won) confidence += 2;
  else confidence -= 3;

  const expectedPosition = Math.round(totalTeams * (1 - board.confidence / 100));
  if (leaguePosition <= expectedPosition) confidence += 1;
  else confidence -= 1;

  confidence = Math.max(0, Math.min(100, confidence));

  return { ...board, confidence };
}

export function isManagerSafe(board: BoardState): boolean {
  return board.confidence > 20;
}

export function getBoardMood(board: BoardState): string {
  if (board.confidence >= 80) return 'Delighted';
  if (board.confidence >= 60) return 'Pleased';
  if (board.confidence >= 40) return 'Neutral';
  if (board.confidence >= 20) return 'Concerned';
  return 'Furious';
}

export function createFinances(team: Team): ClubFinances {
  return {
    balance: team.budget,
    records: [],
    sponsorship: { name: 'IndieAir', annual: Math.round(team.capacity * 50), yearsLeft: 3 },
    ticketPrice: Math.round(30 + team.reputation * 0.5),
    averageAttendance: Math.round(team.capacity * (0.7 + Math.random() * 0.25)),
    debt: 0,
  };
}

export function processRoundFinances(
  finances: ClubFinances,
  team: Team,
  round: number,
  wasHome: boolean,
): ClubFinances {
  const matchday = wasHome ? finances.averageAttendance * finances.ticketPrice : 0;
  const broadcast = Math.round(2_000_000 + team.reputation * 50_000);
  const commercial = Math.round(finances.sponsorship.annual / 38);
  const wages = team.players.reduce((s, p) => s + p.wage, 0);
  const operations = Math.round(team.capacity * 5);

  const record: FinancialRecord = {
    round,
    income: { matchday, broadcast, commercial, transfers: 0 },
    expenditure: { wages, transfers: 0, operations },
    balance: matchday + broadcast + commercial - wages - operations,
  };

  return {
    ...finances,
    balance: finances.balance + record.balance,
    records: [...finances.records, record],
  };
}

export function requestBudgetIncrease(board: BoardState, amount: number): { approved: boolean; board: BoardState } {
  if (board.confidence < 50) return { approved: false, board };
  const approved = Math.random() < (board.confidence / 100) * 0.7;
  if (approved) {
    return {
      approved: true,
      board: { ...board, transferBudget: board.transferBudget + amount, confidence: board.confidence - 5 },
    };
  }
  return { approved: false, board: { ...board, confidence: board.confidence - 2 } };
}

export function requestFacilityUpgrade(board: BoardState, facility: 'training' | 'youth' | 'stadium'): { approved: boolean; board: BoardState } {
  const current = board.facilityLevel[facility];
  if (current >= 5) return { approved: false, board };
  if (board.confidence < 60) return { approved: false, board };

  const cost = current * 10_000_000;
  const approved = Math.random() < (board.confidence / 100) * 0.5;
  if (approved) {
    return {
      approved: true,
      board: {
        ...board,
        facilityLevel: { ...board.facilityLevel, [facility]: current + 1 },
        transferBudget: board.transferBudget - cost,
        confidence: board.confidence - 3,
      },
    };
  }
  return { approved: false, board };
}

export function checkExpectations(board: BoardState, leaguePosition: number, cupRound: number): BoardState {
  const updated = board.expectations.map((exp) => {
    if (exp.type === 'league_position') {
      if (exp.target === 'Top 4') return { ...exp, met: leaguePosition <= 4 };
      if (exp.target === 'Top 10') return { ...exp, met: leaguePosition <= 10 };
      if (exp.target === 'Avoid Relegation') return { ...exp, met: leaguePosition <= 17 };
    }
    if (exp.type === 'cup_progress') {
      if (exp.target === 'Semi-Final') return { ...exp, met: cupRound >= 5 };
      if (exp.target === 'Quarter-Final') return { ...exp, met: cupRound >= 4 };
    }
    return exp;
  });

  const criticalMet = updated.filter((e) => e.priority === 'critical').every((e) => e.met);
  const confidenceShift = criticalMet ? 5 : -5;

  return { ...board, expectations: updated, confidence: Math.max(0, Math.min(100, board.confidence + confidenceShift)) };
}
