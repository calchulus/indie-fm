import { Player, Team } from '../types';

export type ContractType = 'full_time' | 'part_time' | 'amateur' | 'youth';

export interface ContractClause {
  type: 'release' | 'sell_on' | 'buy_back' | 'wage_rise' | 'appearance_bonus' | 'goal_bonus' | 'loyalty_bonus';
  value: number;
  description: string;
}

export interface Contract {
  playerId: string;
  teamId: string;
  type: ContractType;
  wage: number;
  lengthYears: number;
  expiryYear: number;
  clauses: ContractClause[];
  signedRound: number;
}

export interface ContractOffer {
  playerId: string;
  fromTeamId: string;
  wage: number;
  lengthYears: number;
  clauses: ContractClause[];
  status: 'pending' | 'accepted' | 'rejected' | 'countered';
}

export interface NegotiationState {
  playerId: string;
  buyingTeamId: string;
  sellingTeamId: string;
  feeOffered: number;
  feeAsked: number;
  wageOffered: number;
  wageAsked: number;
  round: number;
  status: 'open' | 'agreed' | 'collapsed';
}

export function generateContract(player: Player, teamId: string, round: number): Contract {
  const length = player.age < 24 ? 4 : player.age < 30 ? 3 : 2;
  const clauses: ContractClause[] = [];

  if (player.overall >= 70) {
    clauses.push({ type: 'release', value: Math.round(player.value * 2), description: `Release clause: £${(player.value * 2 / 1_000_000).toFixed(1)}M` });
  }
  if (player.age < 23) {
    clauses.push({ type: 'sell_on', value: 15, description: '15% sell-on clause' });
  }

  return {
    playerId: player.id,
    teamId,
    type: player.age < 18 ? 'youth' : 'full_time',
    wage: player.wage,
    lengthYears: length,
    expiryYear: 2026 + length,
    clauses,
    signedRound: round,
  };
}

export function evaluateContractOffer(player: Player, offer: ContractOffer): boolean {
  const wageRatio = offer.wage / player.wage;
  if (wageRatio >= 1.5) return true;
  if (wageRatio >= 1.2) return Math.random() < 0.7;
  if (wageRatio >= 1.0) return Math.random() < 0.4;
  return Math.random() < 0.1;
}

export function evaluateFeeOffer(
  player: Player,
  _sellingTeam: Team,
  feeOffered: number,
): { accepted: boolean; counterOffer?: number } {
  const value = player.value;
  const ratio = feeOffered / value;

  if (ratio >= 1.5) return { accepted: true };
  if (ratio >= 1.2) return { accepted: Math.random() < 0.8 };
  if (ratio >= 1.0) return { accepted: Math.random() < 0.5, counterOffer: Math.round(value * 1.2) };
  if (ratio >= 0.8) return { accepted: false, counterOffer: Math.round(value * 1.1) };
  return { accepted: false, counterOffer: Math.round(value * 1.3) };
}

export function structureFee(totalFee: number, installments: number): Array<{ amount: number; yearOffset: number }> {
  if (installments <= 1) return [{ amount: totalFee, yearOffset: 0 }];
  const perInstallment = Math.round(totalFee / installments);
  return Array.from({ length: installments }, (_, i) => ({
    amount: i === installments - 1 ? totalFee - perInstallment * (installments - 1) : perInstallment,
    yearOffset: i,
  }));
}

export function isContractExpiring(player: Player, currentYear: number): boolean {
  return player.contractExpiry <= currentYear + 1;
}

export function canSignPreContract(player: Player, currentYear: number): boolean {
  return player.contractExpiry === currentYear + 1;
}

export function computeWageBudget(team: Team): { total: number; used: number; available: number } {
  const total = Math.round(team.budget * 0.6);
  const used = team.players.reduce((s, p) => s + p.wage, 0);
  return { total, used, available: total - used };
}

export function computeTransferBudget(team: Team): number {
  const wageBudget = computeWageBudget(team);
  return Math.max(0, team.budget - wageBudget.used);
}
