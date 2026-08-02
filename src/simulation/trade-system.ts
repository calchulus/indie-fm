// Trade system: AI-to-AI trades, trade value balancing, propose/counter/accept
// Covers ZenGM's trade/ modules: betweenAiTeams, makeItWork, propose, processTrade

import { Team, Player } from '../types';
import { computePlayerValue } from './player-lifecycle';

// --- Trade Proposal ---
export interface TradeProposal {
  id: string;
  fromTeamId: string;
  toTeamId: string;
  fromPlayers: string[]; // player IDs offered
  toPlayers: string[];   // player IDs requested
  fromCash: number;
  toCash: number;
  status: 'proposed' | 'countered' | 'accepted' | 'rejected';
  round: number;
}

export function createTradeProposal(fromTeamId: string, toTeamId: string, fromPlayers: string[], toPlayers: string[], round: number): TradeProposal {
  return { id: `trade_${Date.now()}`, fromTeamId, toTeamId, fromPlayers, toPlayers, fromCash: 0, toCash: 0, status: 'proposed', round };
}

// --- Trade Value Evaluation ---
export function evaluateTradeValue(proposal: TradeProposal, teams: Team[]): { fromValue: number; toValue: number; balanced: boolean } {
  const fromTeam = teams.find((t) => t.id === proposal.fromTeamId);
  const toTeam = teams.find((t) => t.id === proposal.toTeamId);
  if (!fromTeam || !toTeam) return { fromValue: 0, toValue: 0, balanced: false };

  const fromValue = proposal.fromPlayers.reduce((sum, pid) => {
    const p = fromTeam.players.find((pl) => pl.id === pid);
    return sum + (p ? computePlayerValue(p) : 0);
  }, 0) + proposal.fromCash;

  const toValue = proposal.toPlayers.reduce((sum, pid) => {
    const p = toTeam.players.find((pl) => pl.id === pid);
    return sum + (p ? computePlayerValue(p) : 0);
  }, 0) + proposal.toCash;

  // Balanced if within 20% of each other
  const ratio = fromValue / Math.max(1, toValue);
  const balanced = ratio >= 0.8 && ratio <= 1.2;

  return { fromValue, toValue, balanced };
}

// --- AI Trade Decision ---
export function shouldAcceptTrade(proposal: TradeProposal, teams: Team[]): boolean {
  const { fromValue, toValue, balanced } = evaluateTradeValue(proposal, teams);
  const toTeam = teams.find((t) => t.id === proposal.toTeamId);
  if (!toTeam) return false;

  // Accept if balanced and receiving team gets slightly more value
  if (!balanced) return false;

  // AI accepts if they get >= 95% of what they give
  return toValue >= fromValue * 0.95;
}

// --- AI Counter-Offer (make it work) ---
export function generateCounterOffer(proposal: TradeProposal, teams: Team[]): TradeProposal | null {
  const { fromValue, toValue } = evaluateTradeValue(proposal, teams);
  const toTeam = teams.find((t) => t.id === proposal.toTeamId);
  if (!toTeam) return null;

  // If trade is unbalanced, try adding cash to balance
  const deficit = fromValue - toValue;
  if (deficit > 0 && deficit < fromValue * 0.5) {
    // Request cash to balance
    return { ...proposal, toCash: Math.round(deficit * 0.8), status: 'countered' };
  }

  // If too unbalanced, reject
  if (Math.abs(deficit) > fromValue * 0.5) return null;

  return { ...proposal, status: 'countered' };
}

// --- Process Trade (execute) ---
export function executeTrade(proposal: TradeProposal, teams: Team[]): Team[] {
  const fromTeam = teams.find((t) => t.id === proposal.fromTeamId);
  const toTeam = teams.find((t) => t.id === proposal.toTeamId);
  if (!fromTeam || !toTeam) return teams;

  const fromPlayers = fromTeam.players.filter((p) => proposal.fromPlayers.includes(p.id));
  const toPlayers = toTeam.players.filter((p) => proposal.toPlayers.includes(p.id));

  return teams.map((t) => {
    if (t.id === proposal.fromTeamId) {
      const remaining = t.players.filter((p) => !proposal.fromPlayers.includes(p.id));
      return { ...t, players: [...remaining, ...toPlayers], budget: t.budget - proposal.fromCash + proposal.toCash };
    }
    if (t.id === proposal.toTeamId) {
      const remaining = t.players.filter((p) => !proposal.toPlayers.includes(p.id));
      return { ...t, players: [...remaining, ...fromPlayers], budget: t.budget - proposal.toCash + proposal.fromCash };
    }
    return t;
  });
}

// --- AI-to-AI Trades (background) ---
export function simulateAITrades(teams: Team[], userTeamId: string, round: number): { teams: Team[]; trades: Array<{ from: string; to: string; player: string }> } {
  const aiTeams = teams.filter((t) => t.id !== userTeamId);
  const trades: Array<{ from: string; to: string; player: string }> = [];
  let updatedTeams = [...teams];

  // 10% chance per round of an AI trade happening
  if (Math.random() > 0.1) return { teams: updatedTeams, trades };

  // Pick two random AI teams
  const teamA = aiTeams[Math.floor(Math.random() * aiTeams.length)];
  const teamB = aiTeams[Math.floor(Math.random() * aiTeams.length)];
  if (teamA.id === teamB.id) return { teams: updatedTeams, trades };

  // Team A offers their worst player for Team B's worst player
  const playerA = [...teamA.players].sort((a, b) => a.overall - b.overall)[0];
  const playerB = [...teamB.players].sort((a, b) => a.overall - b.overall)[0];
  if (!playerA || !playerB) return { teams: updatedTeams, trades };

  // Only trade if values are close
  const valueA = computePlayerValue(playerA);
  const valueB = computePlayerValue(playerB);
  if (Math.abs(valueA - valueB) > Math.max(valueA, valueB) * 0.3) return { teams: updatedTeams, trades };

  const proposal = createTradeProposal(teamA.id, teamB.id, [playerA.id], [playerB.id], round);
  updatedTeams = executeTrade(proposal, updatedTeams);
  trades.push({ from: teamA.name, to: teamB.name, player: playerA.name });
  trades.push({ from: teamB.name, to: teamA.name, player: playerB.name });

  return { teams: updatedTeams, trades };
}

// --- Trade Deadline Check ---
export function isTradeDeadlinePassed(round: number, totalRounds: number): boolean {
  return round > Math.floor(totalRounds * 0.74);
}

// --- Untradable Check ---
export function isUntradable(player: Player, currentRound: number): { tradable: boolean; reason: string } {
  // Recently signed (within 3 rounds) can't be traded
  if (player.appearances <= 3 && currentRound <= 5) {
    return { tradable: false, reason: 'Recently signed — cannot trade yet' };
  }
  // Very old players with long contracts are hard to move
  if (player.age >= 35 && player.contractExpiry >= 2028) {
    return { tradable: false, reason: 'Long contract for aging player — no interest' };
  }
  return { tradable: true, reason: '' };
}
