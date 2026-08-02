// Medium features: contract negotiation, advanced transfer search,
// press conference, match preview, medical center, youth intake, training schedule, cup bracket

import { Team, Player, LeagueStanding } from '../types';

// --- #M1: Full Contract Negotiation ---
export interface ContractNegotiation {
  playerId: string;
  playerName: string;
  stage: 'initial' | 'wage' | 'bonuses' | 'clauses' | 'final' | 'accepted' | 'rejected';
  rounds: number;
  wageOffered: number;
  wageDemanded: number;
  lengthOffered: number;
  lengthDemanded: number;
  signingBonus: number;
  releaseClause: boolean;
  agentFee: number;
  playerHappiness: number;
}

export function startContractNegotiation(player: Player): ContractNegotiation {
  const ambition = player.hidden?.ambition ?? 10;
  const wageMultiplier = 1.1 + (ambition / 20) * 0.5;
  return {
    playerId: player.id,
    playerName: player.name,
    stage: 'initial',
    rounds: 0,
    wageOffered: player.wage,
    wageDemanded: Math.round(player.wage * wageMultiplier),
    lengthOffered: 2,
    lengthDemanded: 3 + (ambition > 12 ? 1 : 0),
    signingBonus: 0,
    releaseClause: ambition > 14,
    agentFee: Math.round(player.wage * 2),
    playerHappiness: 50,
  };
}

export function counterNegotiation(neg: ContractNegotiation, offer: { wage?: number; length?: number; bonus?: number; releaseClause?: boolean }): ContractNegotiation {
  const rounds = neg.rounds + 1;
  const wageOffered = offer.wage ?? neg.wageOffered;
  const lengthOffered = offer.length ?? neg.lengthOffered;
  const signingBonus = offer.bonus ?? neg.signingBonus;
  const releaseClause = offer.releaseClause ?? neg.releaseClause;

  // Player response based on how close offer is to demand
  const wageRatio = wageOffered / neg.wageDemanded;
  const lengthRatio = lengthOffered / neg.lengthDemanded;
  const satisfaction = (wageRatio * 0.5 + lengthRatio * 0.3 + (releaseClause === neg.releaseClause ? 0.2 : 0));

  let stage: ContractNegotiation['stage'];
  let playerHappiness = Math.round(satisfaction * 100);

  if (satisfaction >= 0.95) stage = 'accepted';
  else if (satisfaction < 0.5 || rounds > 5) stage = 'rejected';
  else if (rounds === 1) stage = 'wage';
  else if (rounds === 2) stage = 'bonuses';
  else if (rounds === 3) stage = 'clauses';
  else stage = 'final';

  return { ...neg, rounds, wageOffered, lengthOffered, signingBonus, releaseClause, stage, playerHappiness };
}

// --- #M2: Advanced Transfer Search ---
export interface TransferFilters {
  position: string;
  minAge: number;
  maxAge: number;
  minOverall: number;
  maxOverall: number;
  maxValue: number;
  nationality: string;
  footedness: string;
  minPace: number;
  sortBy: 'overall' | 'value' | 'age' | 'pace' | 'wage';
}

export const DEFAULT_FILTERS: TransferFilters = {
  position: 'all', minAge: 17, maxAge: 35, minOverall: 40, maxOverall: 99,
  maxValue: 100_000_000, nationality: 'all', footedness: 'all', minPace: 1, sortBy: 'overall',
};

export function searchTransfers(players: Array<{ player: Player; teamId: string }>, filters: TransferFilters): Array<{ player: Player; teamId: string }> {
  let results = players.filter(({ player }) => {
    if (filters.position !== 'all' && player.position !== filters.position) return false;
    if (player.age < filters.minAge || player.age > filters.maxAge) return false;
    if (player.overall < filters.minOverall || player.overall > filters.maxOverall) return false;
    if (player.value > filters.maxValue) return false;
    if (filters.nationality !== 'all' && player.nationality !== filters.nationality) return false;
    if (filters.footedness !== 'all' && player.footedness !== filters.footedness) return false;
    if (player.attributes.pace < filters.minPace) return false;
    return true;
  });

  results.sort((a, b) => {
    switch (filters.sortBy) {
      case 'overall': return b.player.overall - a.player.overall;
      case 'value': return a.player.value - b.player.value;
      case 'age': return a.player.age - b.player.age;
      case 'pace': return b.player.attributes.pace - a.player.attributes.pace;
      case 'wage': return a.player.wage - b.player.wage;
    }
  });

  return results.slice(0, 50);
}

// --- #M3: Press Conference (interactive) ---
export interface PressAnswer {
  text: string;
  moraleEffect: number;
  boardEffect: number;
  mediaEffect: number;
}

export interface PressQuestion {
  id: string;
  question: string;
  answers: PressAnswer[];
}

export function generatePostMatchPress(homeScore: number, awayScore: number, isUserHome: boolean): PressQuestion[] {
  const won = isUserHome ? homeScore > awayScore : awayScore > homeScore;
  const drew = homeScore === awayScore;

  return [
    {
      id: 'performance',
      question: won ? 'Great result. Your reaction?' : drew ? 'A draw today. Thoughts?' : 'Disappointing result. What went wrong?',
      answers: [
        { text: won ? 'The lads were superb.' : 'We\'ll bounce back stronger.', moraleEffect: 2, boardEffect: 1, mediaEffect: 1 },
        { text: 'We need to be better. Simple as that.', moraleEffect: -1, boardEffect: 0, mediaEffect: 0 },
        { text: 'No comment.', moraleEffect: 0, boardEffect: -1, mediaEffect: -2 },
      ],
    },
    {
      id: 'transfer',
      question: 'Any transfer business planned this window?',
      answers: [
        { text: 'We\'re always looking to improve the squad.', moraleEffect: 0, boardEffect: 1, mediaEffect: 1 },
        { text: 'I\'m happy with what we have.', moraleEffect: 1, boardEffect: 0, mediaEffect: 0 },
        { text: 'That\'s between me and the board.', moraleEffect: 0, boardEffect: 0, mediaEffect: -1 },
      ],
    },
    {
      id: 'next',
      question: 'How do you prepare for the next fixture?',
      answers: [
        { text: 'One game at a time. Full focus.', moraleEffect: 1, boardEffect: 1, mediaEffect: 0 },
        { text: 'We\'ll analyze today and move on quickly.', moraleEffect: 0, boardEffect: 0, mediaEffect: 1 },
        { text: 'The lads need rest. We\'ll be ready.', moraleEffect: 1, boardEffect: 0, mediaEffect: 0 },
      ],
    },
  ];
}

// --- #M4: Match Preview ---
export interface MatchPreview {
  homeName: string;
  awayName: string;
  homeForm: string[];
  awayForm: string[];
  homePosition: number;
  awayPosition: number;
  headToHead: { homeWins: number; draws: number; awayWins: number };
  predictedHomeXI: string[];
  predictedAwayXI: string[];
  odds: { home: number; draw: number; away: number };
}

export function generateMatchPreview(
  home: Team, away: Team,
  standings: LeagueStanding[],
  recentResults: Array<{ homeTeamId: string; awayTeamId: string; homeGoals: number; awayGoals: number }>,
): MatchPreview {
  const homeStanding = standings.find((s) => s.teamId === home.id);
  const awayStanding = standings.find((s) => s.teamId === away.id);
  const homePos = standings.indexOf(homeStanding!) + 1 || 10;
  const awayPos = standings.indexOf(awayStanding!) + 1 || 10;

  // Form from recent results
  const getForm = (teamId: string) => recentResults
    .filter((r) => r.homeTeamId === teamId || r.awayTeamId === teamId)
    .slice(0, 5)
    .map((r) => {
      const isHome = r.homeTeamId === teamId;
      const gf = isHome ? r.homeGoals : r.awayGoals;
      const ga = isHome ? r.awayGoals : r.homeGoals;
      return gf > ga ? 'W' : gf === ga ? 'D' : 'L';
    });

  // Head to head
  const h2h = recentResults.filter((r) =>
    (r.homeTeamId === home.id && r.awayTeamId === away.id) ||
    (r.homeTeamId === away.id && r.awayTeamId === home.id)
  );
  const homeWins = h2h.filter((r) => (r.homeTeamId === home.id && r.homeGoals > r.awayGoals) || (r.awayTeamId === home.id && r.awayGoals > r.homeGoals)).length;
  const awayWins = h2h.filter((r) => (r.homeTeamId === away.id && r.homeGoals > r.awayGoals) || (r.awayTeamId === away.id && r.awayGoals > r.homeGoals)).length;

  // Odds based on position
  const homeStrength = 1 / homePos;
  const awayStrength = 1 / awayPos;
  const total = homeStrength + awayStrength + 0.3;
  const odds = {
    home: Math.round((total / homeStrength) * 10) / 10,
    draw: Math.round((total / 0.3) * 10) / 10,
    away: Math.round((total / awayStrength) * 10) / 10,
  };

  return {
    homeName: home.name,
    awayName: away.name,
    homeForm: getForm(home.id),
    awayForm: getForm(away.id),
    homePosition: homePos,
    awayPosition: awayPos,
    headToHead: { homeWins, draws: h2h.length - homeWins - awayWins, awayWins },
    predictedHomeXI: home.players.slice(0, 11).map((p) => p.name),
    predictedAwayXI: away.players.slice(0, 11).map((p) => p.name),
    odds,
  };
}

// --- #M5: Medical Center ---
export interface InjuryReport {
  playerId: string;
  playerName: string;
  type: string;
  roundsRemaining: number;
  fitness: number;
  returnRound: number;
}

export function getMedicalReport(team: Team, currentRound: number, injuries: Array<{ playerId: string; round: number; roundsOut: number; type: string }>): InjuryReport[] {
  return injuries
    .filter((inj) => inj.round + inj.roundsOut > currentRound)
    .map((inj) => {
      const player = team.players.find((p) => p.id === inj.playerId);
      return {
        playerId: inj.playerId,
        playerName: player?.name ?? 'Unknown',
        type: inj.type,
        roundsRemaining: inj.round + inj.roundsOut - currentRound,
        fitness: player?.fitness ?? 0,
        returnRound: inj.round + inj.roundsOut,
      };
    })
    .sort((a, b) => a.roundsRemaining - b.roundsRemaining);
}

// --- #M6: Youth Academy Intake ---
export interface YouthIntake {
  round: number;
  prospects: Array<{ name: string; position: string; age: number; potential: number }>;
}

export function generateYouthIntake(academyLevel: number, reputation: number): YouthIntake {
  const count = 2 + academyLevel;
  const positions = ['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'ST'];
  const firstNames = ['Jack', 'Oliver', 'Harry', 'Charlie', 'Leo', 'Oscar', 'Archie', 'Freddie', 'Theo', 'Luca'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Wilson', 'Moore'];

  const prospects = Array.from({ length: count }, () => {
    const potentialBase = 1 + Math.floor(academyLevel * 0.7) + Math.floor(reputation / 30);
    return {
      name: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
      position: positions[Math.floor(Math.random() * positions.length)],
      age: 15 + Math.floor(Math.random() * 3),
      potential: Math.min(5, potentialBase + Math.floor(Math.random() * 2)),
    };
  });

  return { round: 0, prospects };
}

// --- #M7: Training Weekly Schedule ---
export interface TrainingDay {
  day: string;
  focus: 'fitness' | 'technical' | 'tactical' | 'mental' | 'recovery' | 'rest';
  intensity: 'low' | 'medium' | 'high';
}

export const DEFAULT_SCHEDULE: TrainingDay[] = [
  { day: 'Mon', focus: 'recovery', intensity: 'low' },
  { day: 'Tue', focus: 'technical', intensity: 'high' },
  { day: 'Wed', focus: 'tactical', intensity: 'medium' },
  { day: 'Thu', focus: 'fitness', intensity: 'high' },
  { day: 'Fri', focus: 'mental', intensity: 'low' },
  { day: 'Sat', focus: 'rest', intensity: 'low' },
  { day: 'Sun', focus: 'rest', intensity: 'low' },
];

// --- #M8: Cup Bracket ---
export interface CupRound {
  name: string;
  matches: Array<{ homeId: string; awayId: string; homeGoals?: number; awayGoals?: number; winner?: string }>;
}

export function generateCupBracket(teams: Team[]): CupRound[] {
  const shuffled = [...teams].sort(() => Math.random() - 0.5);
  const rounds: CupRound[] = [];

  let currentTeams = shuffled.slice(0, 16); // Round of 16
  const roundNames = ['Round of 16', 'Quarter-Final', 'Semi-Final', 'Final'];

  for (let r = 0; r < 4 && currentTeams.length >= 2; r++) {
    const matches = [];
    for (let i = 0; i < currentTeams.length; i += 2) {
      matches.push({ homeId: currentTeams[i].id, awayId: currentTeams[i + 1]?.id ?? currentTeams[i].id });
    }
    rounds.push({ name: roundNames[r] ?? `Round ${r + 1}`, matches });
    // Simulate winners (random for now)
    currentTeams = matches.map((m) => Math.random() < 0.5 ? teams.find((t) => t.id === m.homeId)! : teams.find((t) => t.id === m.awayId)!).filter(Boolean);
  }

  return rounds;
}
