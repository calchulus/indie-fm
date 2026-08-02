import { Player } from '../types';

export interface RenewalOffer {
  playerId: string;
  playerName: string;
  position: string;
  age: number;
  overall: number;
  currentWage: number;
  currentExpiry: number;
  demandedWage: number;
  demandedYears: number;
  willingness: number; // 0-100, how keen they are to stay
  stage: 'pending' | 'offered' | 'accepted' | 'rejected' | 'walked';
}

export function generateRenewalOffer(player: Player, currentYear: number): RenewalOffer {
  const yearsLeft = player.contractExpiry - currentYear;
  const formFactor = player.form / 10;
  const ageFactor = player.age <= 25 ? 1.3 : player.age <= 30 ? 1.1 : 0.8;
  const demandMultiplier = (1.2 + formFactor * 0.4) * ageFactor;

  const demandedWage = Math.round(player.wage * demandMultiplier);
  const demandedYears = player.age <= 27 ? 4 : player.age <= 31 ? 3 : 2;

  // Willingness based on morale, form, and contract situation
  const willingness = Math.min(100, Math.max(10,
    player.morale * 5 + player.form * 3 + (yearsLeft <= 1 ? 15 : 0) + (player.age <= 25 ? 10 : 0)
  ));

  return {
    playerId: player.id,
    playerName: player.name,
    position: player.position,
    age: player.age,
    overall: player.overall,
    currentWage: player.wage,
    currentExpiry: player.contractExpiry,
    demandedWage,
    demandedYears,
    willingness,
    stage: 'pending',
  };
}

export function makeRenewalOffer(offer: RenewalOffer, wageOffer: number, years: number): RenewalOffer {
  const wageRatio = wageOffer / offer.demandedWage;
  const acceptChance = (wageRatio * 0.6 + offer.willingness / 100 * 0.4);

  if (acceptChance >= 0.7) {
    return { ...offer, stage: 'accepted', demandedWage: wageOffer, demandedYears: years };
  } else if (acceptChance >= 0.4) {
    // Counter: reduce demand slightly
    const newDemand = Math.round(offer.demandedWage * 0.92);
    return { ...offer, stage: 'offered', demandedWage: newDemand };
  } else {
    return { ...offer, stage: 'rejected' };
  }
}

export function getRenewalSummary(offer: RenewalOffer): string {
  switch (offer.stage) {
    case 'pending': return `${offer.playerName}'s contract expires ${offer.currentExpiry}. Wants £${(offer.demandedWage / 1000).toFixed(0)}k/w for ${offer.demandedYears}yr.`;
    case 'offered': return `${offer.playerName} countered: wants £${(offer.demandedWage / 1000).toFixed(0)}k/w.`;
    case 'accepted': return `✅ ${offer.playerName} signed a new ${offer.demandedYears}yr deal at £${(offer.demandedWage / 1000).toFixed(0)}k/w!`;
    case 'rejected': return `❌ ${offer.playerName} rejected your offer. May leave on a free.`;
    case 'walked': return `${offer.playerName} has left the club.`;
  }
}
