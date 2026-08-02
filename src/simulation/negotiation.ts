import { Player, Team } from '../types';

export interface NegotiationState {
  playerId: string;
  playerName: string;
  position: string;
  fromClubId: string;
  fromClubName: string;
  playerValue: number;
  playerWage: number;
  playerAge: number;
  overall: number;
  // Negotiation progress
  stage: 'initial' | 'bid_sent' | 'counter_received' | 'accepted' | 'rejected' | 'signed';
  userBid: number;
  clubAsking: number;
  counterOffer: number;
  wageOffered: number;
  wageDemanded: number;
  contractYears: number;
  rounds: number;
}

export function startNegotiation(player: Player, fromClub: Team): NegotiationState {
  const asking = Math.round(player.value * (1.1 + Math.random() * 0.3));
  const wageDemand = Math.round(player.wage * (1.2 + Math.random() * 0.4));

  return {
    playerId: player.id,
    playerName: player.name,
    position: player.position,
    fromClubId: fromClub.id,
    fromClubName: fromClub.name,
    playerValue: player.value,
    playerWage: player.wage,
    playerAge: player.age,
    overall: player.overall,
    stage: 'initial',
    userBid: 0,
    clubAsking: asking,
    counterOffer: 0,
    wageOffered: 0,
    wageDemanded: wageDemand,
    contractYears: 3,
    rounds: 0,
  };
}

export function submitBid(neg: NegotiationState, amount: number): NegotiationState {
  const ratio = amount / neg.clubAsking;

  if (ratio >= 1.0) {
    return { ...neg, stage: 'accepted', userBid: amount, rounds: neg.rounds + 1 };
  } else if (ratio >= 0.8) {
    const counter = Math.round(neg.clubAsking * (0.9 + Math.random() * 0.1));
    return { ...neg, stage: 'counter_received', userBid: amount, counterOffer: counter, rounds: neg.rounds + 1 };
  } else if (ratio >= 0.6) {
    const counter = Math.round(neg.clubAsking * (0.85 + Math.random() * 0.1));
    return { ...neg, stage: 'counter_received', userBid: amount, counterOffer: counter, rounds: neg.rounds + 1 };
  } else {
    return { ...neg, stage: 'rejected', userBid: amount, rounds: neg.rounds + 1 };
  }
}

export function respondToCounter(neg: NegotiationState, amount: number): NegotiationState {
  if (neg.rounds >= 4) {
    // After 4 rounds, club makes final decision
    const ratio = amount / neg.clubAsking;
    if (ratio >= 0.85) {
      return { ...neg, stage: 'accepted', userBid: amount, rounds: neg.rounds + 1 };
    }
    return { ...neg, stage: 'rejected', userBid: amount, rounds: neg.rounds + 1 };
  }
  return submitBid(neg, amount);
}

export function negotiateWage(neg: NegotiationState, wageOffer: number): NegotiationState {
  const ratio = wageOffer / neg.wageDemanded;
  if (ratio >= 1.0) {
    return { ...neg, wageOffered: wageOffer, stage: 'signed' };
  } else if (ratio >= 0.85) {
    // Player accepts with slight reluctance
    return { ...neg, wageOffered: wageOffer, wageDemanded: wageOffer, stage: 'signed' };
  }
  // Player rejects, demands more
  return { ...neg, wageOffered: wageOffer, wageDemanded: Math.round(neg.wageDemanded * 0.95) };
}

export function getNegotiationSummary(neg: NegotiationState): string {
  switch (neg.stage) {
    case 'initial': return `${neg.fromClubName} are asking £${(neg.clubAsking / 1_000_000).toFixed(1)}M for ${neg.playerName}.`;
    case 'bid_sent': return `Bid of £${(neg.userBid / 1_000_000).toFixed(1)}M sent. Awaiting response...`;
    case 'counter_received': return `${neg.fromClubName} countered with £${(neg.counterOffer / 1_000_000).toFixed(1)}M.`;
    case 'accepted': return `Fee agreed at £${(neg.userBid / 1_000_000).toFixed(1)}M! Now negotiate personal terms.`;
    case 'rejected': return `${neg.fromClubName} rejected your bid. Negotiation collapsed.`;
    case 'signed': return `${neg.playerName} signed! £${(neg.wageOffered / 1000).toFixed(0)}k/w for ${neg.contractYears} years.`;
  }
}
