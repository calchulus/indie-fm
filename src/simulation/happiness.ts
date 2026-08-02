// Contract renewal negotiations (#11) and player happiness system (#12)

import { Player, Team } from '../types';

// --- #11: Contract Renewal ---

export interface RenewalOffer {
  playerId: string;
  currentWage: number;
  offeredWage: number;
  demandedWage: number;
  currentExpiry: number;
  offeredLength: number; // years
  playerWillingness: number; // 0-1, how keen they are to stay
  status: 'pending' | 'accepted' | 'rejected' | 'countered';
}

export function getPlayersNeedingRenewal(team: Team, currentYear: number): Player[] {
  return team.players.filter((p) => p.contractExpiry <= currentYear + 1);
}

export function generateRenewalOffer(player: Player, team: Team, currentYear: number): RenewalOffer {
  const yearsRemaining = player.contractExpiry - currentYear;
  const loyalty = player.hidden?.loyalty ?? 10;
  const ambition = player.hidden?.ambition ?? 10;

  // Wage demand: based on current wage, overall, and ambition
  const wageMultiplier = 1.1 + (ambition / 20) * 0.4 + (player.overall / 100) * 0.3;
  const demandedWage = Math.round(player.wage * wageMultiplier);

  // Willingness to stay: loyalty + team reputation + playing time satisfaction
  const teamReputation = team.reputation ?? 50;
  const willingness = Math.min(1, (loyalty / 20) * 0.4 + (teamReputation / 100) * 0.3 + (player.appearances > 10 ? 0.2 : 0.05) + 0.1);

  // Club offer: slightly below demand
  const offeredWage = Math.round(demandedWage * (0.8 + Math.random() * 0.15));
  const offeredLength = yearsRemaining <= 0 ? 3 : yearsRemaining <= 1 ? 2 : 1;

  return {
    playerId: player.id,
    currentWage: player.wage,
    offeredWage,
    demandedWage,
    currentExpiry: player.contractExpiry,
    offeredLength,
    playerWillingness: willingness,
    status: 'pending',
  };
}

export function evaluateRenewalResponse(offer: RenewalOffer): 'accepted' | 'rejected' | 'countered' {
  const ratio = offer.offeredWage / offer.demandedWage;

  if (ratio >= 1.0 && offer.playerWillingness > 0.4) return 'accepted';
  if (ratio >= 0.9 && offer.playerWillingness > 0.6 && Math.random() < offer.playerWillingness) return 'accepted';
  if (ratio < 0.7 || offer.playerWillingness < 0.2) return 'rejected';
  return 'countered';
}

export function counterRenewal(offer: RenewalOffer): RenewalOffer {
  // Player counters with a wage between offered and demanded
  const newDemanded = Math.round((offer.offeredWage + offer.demandedWage) / 2);
  return { ...offer, demandedWage: newDemanded, status: 'countered' };
}

// --- #12: Player Happiness ---

export interface HappinessFactors {
  playingTime: number;    // -2 to +2
  clubAmbition: number;   // -2 to +2
  wageFairness: number;   // -2 to +2
  managerRelationship: number; // -2 to +2
  squadHarmony: number;   // -2 to +2
}

export interface PlayerHappiness {
  playerId: string;
  overall: number; // 0-100
  factors: HappinessFactors;
  riskLevel: 'low' | 'medium' | 'high';
  transferRequestChance: number; // 0-1
}

export function computePlayerHappiness(
  player: Player,
  team: Team,
  appearances: number,
  totalRounds: number,
  avgWage: number,
): PlayerHappiness {
  const factors: HappinessFactors = {
    playingTime: 0,
    clubAmbition: 0,
    wageFairness: 0,
    managerRelationship: 0,
    squadHarmony: 0,
  };

  // Playing time: expected based on overall vs squad position
  const expectedApps = totalRounds * (player.overall / 80);
  const appRatio = appearances / Math.max(1, expectedApps);
  if (appRatio >= 0.8) factors.playingTime = 2;
  else if (appRatio >= 0.5) factors.playingTime = 0;
  else if (appRatio >= 0.3) factors.playingTime = -1;
  else factors.playingTime = -2;

  // Club ambition: team reputation vs player ambition
  const ambition = player.hidden?.ambition ?? 10;
  const teamRep = team.reputation ?? 50;
  if (teamRep >= ambition * 5) factors.clubAmbition = 1;
  else if (teamRep < ambition * 3) factors.clubAmbition = -1;
  if (ambition > 14 && teamRep < 40) factors.clubAmbition = -2;

  // Wage fairness: relative to squad average and overall
  const expectedWage = avgWage * (player.overall / 65);
  const wageRatio = player.wage / Math.max(1, expectedWage);
  if (wageRatio >= 1.1) factors.wageFairness = 1;
  else if (wageRatio < 0.7) factors.wageFairness = -2;
  else if (wageRatio < 0.9) factors.wageFairness = -1;

  // Manager relationship: based on loyalty trait
  const loyalty = player.hidden?.loyalty ?? 10;
  factors.managerRelationship = loyalty >= 14 ? 1 : loyalty <= 6 ? -1 : 0;

  // Squad harmony: based on team morale average (approximated)
  factors.squadHarmony = 0; // neutral default, modified by events

  // Overall happiness: weighted sum mapped to 0-100
  const raw = factors.playingTime * 25 + factors.clubAmbition * 20 + factors.wageFairness * 20 +
    factors.managerRelationship * 15 + factors.squadHarmony * 20;
  const overall = Math.max(0, Math.min(100, 50 + raw));

  // Risk assessment
  let riskLevel: PlayerHappiness['riskLevel'] = 'low';
  if (overall < 30) riskLevel = 'high';
  else if (overall < 50) riskLevel = 'medium';

  const transferRequestChance = overall < 25 ? 0.3 : overall < 40 ? 0.1 : overall < 55 ? 0.02 : 0;

  return { playerId: player.id, overall, factors, riskLevel, transferRequestChance };
}

export function getSquadHappiness(team: Team, totalRounds: number): PlayerHappiness[] {
  const avgWage = team.players.reduce((s, p) => s + p.wage, 0) / Math.max(1, team.players.length);
  return team.players.map((p) =>
    computePlayerHappiness(p, team, p.appearances, totalRounds, avgWage)
  );
}

export function getUnhappyPlayers(team: Team, totalRounds: number): PlayerHappiness[] {
  return getSquadHappiness(team, totalRounds).filter((h) => h.riskLevel !== 'low');
}
