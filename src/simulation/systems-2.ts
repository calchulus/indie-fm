// Systems cont — items 71-80
// Sponsorship, ticket pricing, stadium expansion, staff hiring, staff quality, board expectations, pre-season, international breaks, winter window, loans

import { Team, Player } from '../types';

// --- Item 71: Sponsorship deals ---
export interface SponsorshipDeal {
  id: string;
  sponsorName: string;
  annualRevenue: number;
  yearsRemaining: number;
  type: 'shirt' | 'stadium' | 'training';
}

export function generateSponsorshipOffer(teamReputation: number): SponsorshipDeal {
  const sponsors = ['IndieAir', 'TechCorp', 'GlobalBank', 'SportMax', 'EnergyPlus', 'AutoDrive'];
  const baseRevenue = teamReputation * 500_000;
  return {
    id: `sponsor_${Date.now()}`,
    sponsorName: sponsors[Math.floor(Math.random() * sponsors.length)],
    annualRevenue: baseRevenue + Math.floor(Math.random() * baseRevenue * 0.5),
    yearsRemaining: 2 + Math.floor(Math.random() * 3),
    type: 'shirt',
  };
}

export function negotiateSponsorship(offer: SponsorshipDeal, teamReputation: number): SponsorshipDeal {
  const bonus = Math.round(offer.annualRevenue * (teamReputation / 100) * 0.2);
  return { ...offer, annualRevenue: offer.annualRevenue + bonus };
}

// --- Item 72: Ticket pricing ---
export interface TicketPricing {
  standard: number;
  premium: number;
  vip: number;
  seasonTicket: number;
}

export function getDefaultTicketPricing(teamReputation: number): TicketPricing {
  const base = 20 + teamReputation * 0.5;
  return {
    standard: Math.round(base),
    premium: Math.round(base * 2),
    vip: Math.round(base * 4),
    seasonTicket: Math.round(base * 15),
  };
}

export function calculateMatchdayRevenue(pricing: TicketPricing, attendance: number, capacity: number): number {
  const standardSeats = Math.round(capacity * 0.7);
  const premiumSeats = Math.round(capacity * 0.2);
  const vipSeats = Math.round(capacity * 0.1);
  const fillRate = attendance / capacity;
  return Math.round(
    standardSeats * fillRate * pricing.standard +
    premiumSeats * fillRate * pricing.premium +
    vipSeats * fillRate * pricing.vip
  );
}

// --- Item 73: Stadium expansion ---
export interface StadiumExpansion {
  currentCapacity: number;
  proposedCapacity: number;
  cost: number;
  constructionTime: number; // rounds
  revenueIncrease: number;
}

export function proposeStadiumExpansion(currentCapacity: number): StadiumExpansion {
  const proposedCapacity = currentCapacity + Math.round(currentCapacity * 0.25);
  const cost = (proposedCapacity - currentCapacity) * 2000;
  return {
    currentCapacity,
    proposedCapacity,
    cost,
    constructionTime: 12 + Math.floor(Math.random() * 12),
    revenueIncrease: Math.round((proposedCapacity - currentCapacity) * 30),
  };
}

// --- Item 74: Staff hiring ---
export interface StaffCandidate {
  id: string;
  name: string;
  role: string;
  rating: number;
  wage: number;
  specialty: string;
}

export function generateStaffCandidates(role: string, count: number): StaffCandidate[] {
  const names = ['James Wilson', 'Marco Rossi', 'Carlos Mendez', 'Hans Mueller', 'Pierre Dubois', 'Kenji Tanaka', 'Omar Hassan', 'Lars Eriksson'];
  const specialties: Record<string, string[]> = {
    'Coach': ['Attacking', 'Defending', 'Fitness', 'Goalkeeping', 'Tactics'],
    'Scout': ['Domestic', 'European', 'South American', 'Youth'],
    'Physio': ['Recovery', 'Prevention', 'Fitness'],
  };

  const candidates: StaffCandidate[] = [];
  for (let i = 0; i < count; i++) {
    const rating = 50 + Math.floor(Math.random() * 40);
    candidates.push({
      id: `staff_${Date.now()}_${i}`,
      name: names[Math.floor(Math.random() * names.length)],
      role,
      rating,
      wage: rating * 100,
      specialty: (specialties[role] ?? ['General'])[Math.floor(Math.random() * (specialties[role]?.length ?? 1))],
    });
  }
  return candidates;
}

// --- Item 75: Staff quality affects training ---
export function getTrainingQualityBonus(staffRating: number): number {
  // Staff rating 50-90 maps to 0-20% training bonus
  return Math.max(0, (staffRating - 50) / 40) * 0.2;
}

// --- Item 76: Board expectations ---
export interface BoardExpectation {
  type: 'league_position' | 'cup_progress' | 'financial' | 'youth_development';
  target: string;
  priority: 'critical' | 'important' | 'desirable';
  met: boolean;
}

export function generateBoardExpectations(teamReputation: number): BoardExpectation[] {
  const expectations: BoardExpectation[] = [];

  if (teamReputation >= 70) {
    expectations.push({ type: 'league_position', target: 'Top 4', priority: 'critical', met: false });
    expectations.push({ type: 'cup_progress', target: 'Semi-Final', priority: 'important', met: false });
  } else if (teamReputation >= 50) {
    expectations.push({ type: 'league_position', target: 'Top 10', priority: 'critical', met: false });
    expectations.push({ type: 'cup_progress', target: 'Quarter-Final', priority: 'desirable', met: false });
  } else {
    expectations.push({ type: 'league_position', target: 'Avoid Relegation', priority: 'critical', met: false });
    expectations.push({ type: 'financial', target: 'Stay within budget', priority: 'important', met: false });
  }

  expectations.push({ type: 'youth_development', target: 'Promote 1 youth player', priority: 'desirable', met: false });

  return expectations;
}

export function checkExpectationsMet(expectations: BoardExpectation[], position: number, totalTeams: number): BoardExpectation[] {
  return expectations.map((e) => {
    if (e.type === 'league_position') {
      if (e.target === 'Top 4') return { ...e, met: position <= 4 };
      if (e.target === 'Top 10') return { ...e, met: position <= 10 };
      if (e.target === 'Avoid Relegation') return { ...e, met: position < totalTeams - 2 };
    }
    return e;
  });
}

// --- Item 77: Pre-season ---
export function generatePreSeasonFixtures(_team: Team, opponents: Team[]): Array<{ opponentId: string; opponentName: string; round: number }> {
  const shuffled = [...opponents].sort(() => Math.random() - 0.5).slice(0, 4);
  return shuffled.map((opp, i) => ({
    opponentId: opp.id,
    opponentName: opp.name,
    round: i + 1,
  }));
}

// --- Item 78: International breaks ---
export function isInternationalBreak(round: number): boolean {
  // International breaks at rounds 8, 16, 24, 32
  return [8, 16, 24, 32].includes(round);
}

export function getInternationalCallUps(team: Team): Player[] {
  // Players with high overall get called up
  return team.players.filter((p) => p.overall >= 70 && Math.random() < 0.4);
}

// --- Item 79: Winter transfer window ---
export function isWinterWindow(round: number, totalRounds: number): boolean {
  const midSeason = Math.floor(totalRounds / 2);
  return round >= midSeason - 2 && round <= midSeason + 2;
}

// --- Item 80: Loan system ---
export interface LoanOffer {
  playerId: string;
  fromClubId: string;
  toClubId: string;
  duration: number; // rounds
  wageContribution: number; // percentage paid by parent club
  optionToBuy: boolean;
  buyPrice?: number;
}

export function generateLoanOffer(player: Player, fromClub: Team, toClub: Team): LoanOffer {
  const duration = 10 + Math.floor(Math.random() * 20);
  const wageContribution = 50 + Math.floor(Math.random() * 50);
  const optionToBuy = Math.random() < 0.3;

  return {
    playerId: player.id,
    fromClubId: fromClub.id,
    toClubId: toClub.id,
    duration,
    wageContribution,
    optionToBuy,
    buyPrice: optionToBuy ? Math.round(player.value * 0.8) : undefined,
  };
}

export function canLoanPlayer(team: Team, player: Player): boolean {
  // Can only loan players not in starting XI
  const starters = team.players.slice(0, 11);
  return !starters.some((p) => p.id === player.id);
}