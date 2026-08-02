// Systems cont — items 81-90
// Youth scouting, sell-on clauses, release clauses, contract termination, wage negotiation, agent fees, installments, swap deals, free agents, trials

import { Team, Player, PlayerAttributes } from '../types';

function generateFullAttributes(overall: number): PlayerAttributes {
  const attr = () => Math.max(1, Math.min(20, overall + Math.floor(Math.random() * 10) - 5));
  return {
    pace: attr(), finishing: attr(), passing: attr(), dribbling: attr(), marking: attr(),
    strength: attr(), stamina: attr(), aggression: attr(), vision: attr(), composure: attr(),
    crossing: attr(), firstTouch: attr(), freeKickTaking: attr(), heading: attr(),
    longShots: attr(), longThrows: attr(), penaltyTaking: attr(), tackling: attr(),
    technique: attr(), anticipation: attr(), bravery: attr(), concentration: attr(),
    decisions: attr(), determination: attr(), flair: attr(), leadership: attr(),
    offTheBall: attr(), positioning: attr(), teamwork: attr(), workRate: attr(),
    acceleration: attr(), agility: attr(), balance: attr(), jumpingReach: attr(),
    naturalFitness: attr(), reflexes: attr(), handling: attr(), oneOnOnes: attr(),
    aerialReach: attr(), commandOfArea: attr(), communication: attr(), eccentricity: attr(),
    kicking: attr(), rushingOut: attr(), throwing: attr(),
  };
}

// --- Item 81: Youth scouting ---
export interface YouthProspect {
  id: string;
  name: string;
  age: number;
  position: string;
  potentialRating: number; // 1-5 stars
  nationality: string;
  cost: number;
}

export function generateYouthProspects(count: number): YouthProspect[] {
  const positions = ['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'ST'];
  const nationalities = ['England', 'France', 'Brazil', 'Spain', 'Germany', 'Argentina', 'Portugal', 'Netherlands'];
  const firstNames = ['James', 'Marco', 'Carlos', 'Hans', 'Pierre', 'Kenji', 'Omar', 'Lars', 'Diego', 'Luca'];
  const lastNames = ['Wilson', 'Rossi', 'Mendez', 'Mueller', 'Dubois', 'Tanaka', 'Hassan', 'Eriksson', 'Silva', 'Costa'];

  const prospects: YouthProspect[] = [];
  for (let i = 0; i < count; i++) {
    const potential = 1 + Math.floor(Math.random() * 5);
    prospects.push({
      id: `youth_${Date.now()}_${i}`,
      name: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
      age: 15 + Math.floor(Math.random() * 4),
      position: positions[Math.floor(Math.random() * positions.length)],
      potentialRating: potential,
      nationality: nationalities[Math.floor(Math.random() * nationalities.length)],
      cost: potential * 500_000 + Math.floor(Math.random() * 1_000_000),
    });
  }
  return prospects;
}

// --- Item 82: Sell-on clauses ---
export interface SellOnClause {
  playerId: string;
  sellingClubId: string;
  percentage: number; // 10-30%
}

export function createSellOnClause(playerId: string, sellingClubId: string, percentage: number): SellOnClause {
  return { playerId, sellingClubId, percentage: Math.min(30, Math.max(10, percentage)) };
}

export function calculateSellOnFee(clause: SellOnClause, salePrice: number): number {
  return Math.round(salePrice * (clause.percentage / 100));
}

// --- Item 83: Release clauses ---
export interface ReleaseClause {
  playerId: string;
  amount: number;
  active: boolean;
}

export function createReleaseClause(player: Player): ReleaseClause {
  return {
    playerId: player.id,
    amount: Math.round(player.value * (1.5 + Math.random())),
    active: true,
  };
}

export function canTriggerReleaseClause(clause: ReleaseClause, buyerBudget: number): boolean {
  return clause.active && buyerBudget >= clause.amount;
}

// --- Item 84: Contract termination ---
export function calculateTerminationCost(player: Player, yearsRemaining: number): number {
  return Math.round(player.wage * 52 * yearsRemaining * 0.5);
}

export function canTerminateContract(_player: Player, yearsRemaining: number): boolean {
  // Can terminate if contract is expiring soon or mutual agreement
  return yearsRemaining <= 1;
}

// --- Item 85: Wage negotiation ---
export interface WageNegotiation {
  playerId: string;
  currentWage: number;
  offeredWage: number;
  demandedWage: number;
  status: 'pending' | 'accepted' | 'rejected' | 'countered';
}

export function startWageNegotiation(player: Player): WageNegotiation {
  const demandedWage = Math.round(player.wage * (1.2 + Math.random() * 0.5));
  return {
    playerId: player.id,
    currentWage: player.wage,
    offeredWage: Math.round(player.wage * 1.1),
    demandedWage,
    status: 'pending',
  };
}

export function negotiateWage(negotiation: WageNegotiation, offer: number): WageNegotiation {
  const ratio = offer / negotiation.demandedWage;
  if (ratio >= 1.0) return { ...negotiation, offeredWage: offer, status: 'accepted' };
  if (ratio >= 0.85) return { ...negotiation, offeredWage: offer, status: 'countered', demandedWage: Math.round(negotiation.demandedWage * 0.95) };
  return { ...negotiation, offeredWage: offer, status: 'rejected' };
}

// --- Item 86: Agent fees ---
export function calculateAgentFee(transferFee: number): number {
  return Math.round(transferFee * 0.1); // 10% agent fee
}

export function calculateAgentWageCommission(wage: number): number {
  return Math.round(wage * 0.05); // 5% of wage
}

// --- Item 87: Transfer installments ---
export interface InstallmentPlan {
  totalFee: number;
  installments: Array<{ amount: number; dueRound: number }>;
  interestRate: number;
}

export function createInstallmentPlan(totalFee: number, numInstallments: number, startRound: number): InstallmentPlan {
  const interestRate = 0.05;
  const perInstallment = Math.round(totalFee / numInstallments);
  const installments = Array.from({ length: numInstallments }, (_, i) => ({
    amount: i === numInstallments - 1 ? totalFee - perInstallment * (numInstallments - 1) : perInstallment,
    dueRound: startRound + (i + 1) * 4,
  }));

  return { totalFee, installments, interestRate };
}

// --- Item 88: Swap deals ---
export interface SwapDeal {
  playerAId: string;
  playerBId: string;
  clubAId: string;
  clubBId: string;
  cashAdjustment: number; // positive = clubA pays, negative = clubB pays
}

export function proposeSwapDeal(playerA: Player, playerB: Player, clubA: Team, clubB: Team): SwapDeal {
  const valueDiff = playerA.value - playerB.value;
  return {
    playerAId: playerA.id,
    playerBId: playerB.id,
    clubAId: clubA.id,
    clubBId: clubB.id,
    cashAdjustment: valueDiff,
  };
}

export function evaluateSwapDeal(_deal: SwapDeal, playerA: Player, playerB: Player): boolean {
  // AI accepts if value difference is within 20%
  const valueDiff = Math.abs(playerA.value - playerB.value);
  const maxValue = Math.max(playerA.value, playerB.value);
  return valueDiff / maxValue < 0.2;
}

// --- Item 89: Free agents ---
export function generateFreeAgents(count: number): Player[] {
  const positions = ['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'ST'];
  const firstNames = ['James', 'Marco', 'Carlos', 'Hans', 'Pierre', 'Kenji', 'Omar', 'Lars', 'Diego', 'Luca'];
  const lastNames = ['Wilson', 'Rossi', 'Mendez', 'Mueller', 'Dubois', 'Tanaka', 'Hassan', 'Eriksson', 'Silva', 'Costa'];

  const agents: Player[] = [];
  for (let i = 0; i < count; i++) {
    const overall = 40 + Math.floor(Math.random() * 30);
    agents.push({
      id: `fa_${Date.now()}_${i}`,
      name: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
      age: 22 + Math.floor(Math.random() * 12),
      nationality: 'England',
      position: positions[Math.floor(Math.random() * positions.length)] as Player['position'],
      role: 'central_midfielder',
      duty: 'support',
      attributes: generateFullAttributes(overall),
      hidden: { loyalty: 10, consistency: 10, versatility: 10, adaptability: 10, ambition: 10, pressure: 10, professionalism: 10, sportsmanship: 10, temperament: 10, injuryProneness: 10, bigGames: 10 },
      personality: 'professional',
      footedness: Math.random() < 0.7 ? 'right' : 'left',
      height: 170 + Math.floor(Math.random() * 25),
      weight: 70 + Math.floor(Math.random() * 20),
      overall,
      potentialAbility: overall + Math.floor(Math.random() * 15),
      currentAbility: overall,
      value: 0,
      wage: Math.round(overall * 100),
      contractExpiry: 2026,
      form: 5,
      fitness: 100,
      morale: 5,
      reputation: overall,
      goals: 0,
      assists: 0,
      appearances: 0,
      yellowCards: 0,
      redCards: 0,
      traits: [],
    });
  }
  return agents;
}

// --- Item 90: Trial system ---
export interface TrialOffer {
  playerId: string;
  clubId: string;
  duration: number; // rounds
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  performanceRating?: number;
}

export function offerTrial(player: Player, club: Team, duration: number): TrialOffer {
  return {
    playerId: player.id,
    clubId: club.id,
    duration,
    status: 'pending',
  };
}

export function evaluateTrialPerformance(player: Player): number {
  // Performance based on overall + form + random factor
  return Math.min(10, Math.round((player.overall / 10 + player.form * 0.3 + Math.random() * 3) * 10) / 10);
}

export function shouldOfferContractAfterTrial(performanceRating: number): boolean {
  return performanceRating >= 6.5;
}
