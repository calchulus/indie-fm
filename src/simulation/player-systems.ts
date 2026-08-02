// Player systems — items 31-40
// Loyalty, contract negotiation, radar chart, trait learning, international call-ups, injury history, form persistence, morale reasons, position familiarity, captain

import { Player, Team, Position } from '../types';

// --- Item 31: Player loyalty / transfer requests ---
export function getPlayerLoyalty(player: Player): number {
  // Loyalty based on hidden attributes + time at club
  return Math.min(100, (player.hidden?.loyalty ?? 10) * 5 + player.appearances * 0.5);
}

export function shouldRequestTransfer(player: Player, isStarter: boolean, morale: number): boolean {
  const loyalty = getPlayerLoyalty(player);
  if (loyalty > 70) return false; // Loyal players don't request transfers
  if (!isStarter && morale < 4 && Math.random() < 0.1) return true;
  if (morale < 2 && Math.random() < 0.05) return true;
  return false;
}

// --- Item 32: Contract negotiation ---
export interface ContractOffer {
  playerId: string;
  wageOffered: number;
  lengthYears: number;
  releaseClause: number;
  status: 'pending' | 'accepted' | 'rejected' | 'countered';
  counterWage?: number;
}

export function generateContractOffer(player: Player): ContractOffer {
  const currentWage = player.wage;
  const wageDemand = Math.round(currentWage * (1.2 + Math.random() * 0.5));
  const length = player.age < 25 ? 4 : player.age < 30 ? 3 : 2;
  const releaseClause = Math.round(player.value * (1.5 + Math.random()));

  return {
    playerId: player.id,
    wageOffered: wageDemand,
    lengthYears: length,
    releaseClause,
    status: 'pending',
  };
}

export function negotiateContract(offer: ContractOffer, player: Player, _budget: number): ContractOffer {
  const wageRatio = offer.wageOffered / player.wage;
  if (wageRatio >= 1.3) return { ...offer, status: 'accepted' };
  if (wageRatio >= 1.1) {
    // Counter offer
    const counterWage = Math.round(player.wage * 1.25);
    return { ...offer, status: 'countered', counterWage };
  }
  return { ...offer, status: 'rejected' };
}

// --- Item 33: Radar chart data ---
export interface RadarChartData {
  labels: string[];
  values: number[]; // 0-20 scale
}

export function getPlayerRadarData(player: Player): RadarChartData {
  return {
    labels: ['PAC', 'SHO', 'PAS', 'DRI', 'DEF', 'PHY'],
    values: [
      player.attributes.pace,
      player.attributes.finishing,
      player.attributes.passing,
      player.attributes.dribbling,
      player.attributes.marking,
      player.attributes.strength,
    ],
  };
}

export function comparePlayersRadar(playerA: Player, playerB: Player): { labels: string[]; a: number[]; b: number[] } {
  const dataA = getPlayerRadarData(playerA);
  const dataB = getPlayerRadarData(playerB);
  return { labels: dataA.labels, a: dataA.values, b: dataB.values };
}

// --- Item 34: Player trait learning ---
export function canLearnTrait(player: Player): boolean {
  return player.age <= 24 && player.traits.length < 5;
}

export function learnTrait(player: Player, trait: string): Player {
  if (!canLearnTrait(player)) return player;
  if (player.traits.includes(trait)) return player;
  return { ...player, traits: [...player.traits, trait] };
}

export function getLearnableTraits(player: Player): string[] {
  const allTraits = [
    'Likes to try long range shots', 'Plays one-twos', 'Comes deep to get ball',
    'Cuts inside', 'Plays through balls', 'Dives into tackles', 'Marks opponent tightly',
    'Runs with ball often', 'Plays short corners', 'Leaders on the pitch',
  ];
  return allTraits.filter((t) => !player.traits.includes(t));
}

// --- Item 35: International call-ups ---
export function getInternationalEligibility(player: Player): string[] {
  const countries = [player.nationality];
  if (player.secondNationality) countries.push(player.secondNationality);
  return countries;
}

export function shouldGetCallUp(player: Player, nationalTeamStrength: number): boolean {
  if (player.overall < nationalTeamStrength - 10) return false;
  return Math.random() < 0.3;
}

// --- Item 36: Injury history ---
export interface InjuryRecord {
  playerId: string;
  type: string;
  roundsOut: number;
  occurredRound: number;
  severity: 'minor' | 'moderate' | 'serious';
}

export function processInjury(player: Player, round: number): InjuryRecord | null {
  const injuryChance = 0.02 + (1 - player.attributes.strength / 20) * 0.03;
  if (Math.random() > injuryChance) return null;

  const injuries = [
    { type: 'Hamstring strain', severity: 'moderate' as const, rounds: 3 + Math.floor(Math.random() * 4) },
    { type: 'Ankle sprain', severity: 'minor' as const, rounds: 1 + Math.floor(Math.random() * 3) },
    { type: 'Knee injury', severity: 'serious' as const, rounds: 6 + Math.floor(Math.random() * 8) },
    { type: 'Groin strain', severity: 'moderate' as const, rounds: 2 + Math.floor(Math.random() * 3) },
    { type: 'Concussion', severity: 'moderate' as const, rounds: 1 + Math.floor(Math.random() * 2) },
    { type: 'Calf strain', severity: 'minor' as const, rounds: 2 + Math.floor(Math.random() * 3) },
  ];

  const injury = injuries[Math.floor(Math.random() * injuries.length)];
  return {
    playerId: player.id,
    type: injury.type,
    roundsOut: injury.rounds,
    occurredRound: round,
    severity: injury.severity,
  };
}

// --- Item 37: Form persistence (rolling 5-match form) ---
export function updateForm(currentForm: number, matchRating: number): number {
  // Rolling average: new form = 70% old form + 30% latest match
  const newForm = currentForm * 0.7 + matchRating * 0.3;
  return Math.max(1, Math.min(10, Math.round(newForm * 10) / 10));
}

export function getFormLabel(form: number): { label: string; color: string } {
  if (form >= 8) return { label: 'Excellent', color: '#4ade80' };
  if (form >= 6.5) return { label: 'Good', color: '#86efac' };
  if (form >= 5) return { label: 'Average', color: '#fbbf24' };
  if (form >= 3.5) return { label: 'Poor', color: '#fb923c' };
  return { label: 'Terrible', color: '#f87171' };
}

// --- Item 38: Morale reasons visible ---
export function getMoraleReasons(player: Player, isStarter: boolean, teamWon: boolean, contractExpiring: boolean): string[] {
  const reasons: string[] = [];
  if (isStarter) reasons.push('Regular starter');
  else reasons.push('Not getting game time');
  if (teamWon) reasons.push('Team winning');
  else reasons.push('Team struggling');
  if (contractExpiring) reasons.push('Contract expiring soon');
  if (player.form >= 7) reasons.push('In great form');
  if (player.form <= 3) reasons.push('Poor form');
  return reasons;
}

// --- Item 39: Position familiarity ---
export function getPositionFamiliarity(playerPosition: Position, slotPosition: string): number {
  if (playerPosition === slotPosition) return 1.0;
  const related: Record<string, string[]> = {
    GK: ['GK'],
    CB: ['CB', 'CDM'],
    LB: ['LB', 'LWB', 'LW'],
    RB: ['RB', 'RWB', 'RW'],
    CDM: ['CDM', 'CM', 'CB'],
    CM: ['CM', 'CDM', 'CAM'],
    CAM: ['CAM', 'CM', 'LW', 'RW'],
    LW: ['LW', 'RW', 'CAM'],
    RW: ['RW', 'LW', 'CAM'],
    ST: ['ST', 'CAM'],
  };
  const group = related[slotPosition] ?? [];
  if (group.includes(playerPosition)) return 0.85;
  const playerGroup = related[playerPosition] ?? [];
  if (playerGroup.includes(slotPosition)) return 0.80;
  return 0.65;
}

// --- Item 40: Captain / leadership ---
export function selectCaptain(team: Team): Player | null {
  const candidates = team.players
    .filter((p) => p.age >= 24)
    .sort((a, b) => (b.attributes.leadership * 3 + b.age + b.appearances * 0.5) - (a.attributes.leadership * 3 + a.age + a.appearances * 0.5));
  return candidates[0] ?? null;
}

export function getCaptainBonus(captain: Player | null): number {
  if (!captain) return 1.0;
  return 1.0 + (captain.attributes.leadership / 20) * 0.05;
}
