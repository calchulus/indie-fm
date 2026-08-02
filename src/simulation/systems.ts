// Systems — items 61-70
// Scouting network, scout reports, deadline day, sacking screen, job offers, career history, rivalry, fan happiness, media, FFP

import { Team, Player, League } from '../types';

// --- Item 61: Scouting network with regions ---
export interface ScoutRegion {
  id: string;
  name: string;
  countries: string[];
  assignedScoutId?: string;
  knowledgeLevel: number; // 0-100
}

export const DEFAULT_REGIONS: ScoutRegion[] = [
  { id: 'r1', name: 'Domestic', countries: ['England'], knowledgeLevel: 80 },
  { id: 'r2', name: 'Western Europe', countries: ['France', 'Germany', 'Spain', 'Portugal'], knowledgeLevel: 40 },
  { id: 'r3', name: 'Southern Europe', countries: ['Italy', 'Portugal', 'Spain'], knowledgeLevel: 30 },
  { id: 'r4', name: 'South America', countries: ['Brazil', 'Argentina', 'Colombia'], knowledgeLevel: 20 },
  { id: 'r5', name: 'Africa', countries: ['Nigeria', 'Senegal', 'Morocco', 'Egypt'], knowledgeLevel: 15 },
  { id: 'r6', name: 'Asia', countries: ['Japan', 'South Korea', 'Australia'], knowledgeLevel: 10 },
];

export function assignScoutToRegion(regions: ScoutRegion[], regionId: string, scoutId: string): ScoutRegion[] {
  return regions.map((r) => r.id === regionId ? { ...r, assignedScoutId: scoutId } : r);
}

export function advanceScoutKnowledge(regions: ScoutRegion[]): ScoutRegion[] {
  return regions.map((r) => {
    if (!r.assignedScoutId) return r;
    const gain = Math.min(100 - r.knowledgeLevel, 5 + Math.floor(Math.random() * 5));
    return { ...r, knowledgeLevel: r.knowledgeLevel + gain };
  });
}

// --- Item 62: Scout reports with star ratings ---
export interface ScoutReport {
  playerId: string;
  scoutId: string;
  currentAbilityStars: number; // 1-5
  potentialAbilityStars: number; // 1-5
  recommendation: string;
  strengths: string[];
  weaknesses: string[];
  knowledgeLevel: number;
}

export function generateScoutReport(player: Player, knowledgeLevel: number): ScoutReport {
  const accuracy = knowledgeLevel / 100;
  const noise = (1 - accuracy) * 2;

  const caStars = Math.max(1, Math.min(5, Math.round(player.overall / 20 + (Math.random() - 0.5) * noise)));
  const paStars = Math.max(1, Math.min(5, Math.round((player.potentialAbility ?? player.overall * 1.2) / 20 + (Math.random() - 0.5) * noise)));

  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const attrs = player.attributes;
  if (attrs.pace >= 15) strengths.push('Pace');
  if (attrs.finishing >= 15) strengths.push('Shooting');
  if (attrs.passing >= 15) strengths.push('Passing');
  if (attrs.marking >= 15) strengths.push('Defending');
  if (attrs.strength >= 15) strengths.push('Physical');
  if (attrs.pace <= 8) weaknesses.push('Pace');
  if (attrs.finishing <= 8) weaknesses.push('Shooting');
  if (attrs.passing <= 8) weaknesses.push('Passing');
  if (attrs.marking <= 8) weaknesses.push('Defending');

  const recommendation = caStars >= 4 ? 'Sign immediately' : caStars >= 3 ? 'Good squad addition' : caStars >= 2 ? 'Backup option' : 'Not recommended';

  return {
    playerId: player.id,
    scoutId: '',
    currentAbilityStars: caStars,
    potentialAbilityStars: paStars,
    recommendation,
    strengths,
    weaknesses,
    knowledgeLevel,
  };
}

// --- Item 63: Deadline day drama ---
export function isDeadlineDay(round: number, totalRounds: number): boolean {
  return round === 4 || round === Math.floor(totalRounds / 2) + 2;
}

export function generateDeadlineDayDeals(teams: Team[], count: number): Array<{ playerName: string; fromClub: string; toClub: string; fee: number }> {
  const deals: Array<{ playerName: string; fromClub: string; toClub: string; fee: number }> = [];
  for (let i = 0; i < count; i++) {
    const fromTeam = teams[Math.floor(Math.random() * teams.length)];
    const toTeam = teams[Math.floor(Math.random() * teams.length)];
    if (fromTeam.id === toTeam.id) continue;
    const player = fromTeam.players[Math.floor(Math.random() * fromTeam.players.length)];
    deals.push({
      playerName: player.name,
      fromClub: fromTeam.name,
      toClub: toTeam.name,
      fee: Math.round(player.value * (0.8 + Math.random() * 0.5)),
    });
  }
  return deals;
}

// --- Item 64: Sacking screen ---
export interface SackingInfo {
  reason: string;
  finalPosition: number;
  record: { w: number; d: number; l: number };
  gamesInCharge: number;
}

export function shouldSackManager(boardConfidence: number, position: number, totalTeams: number): boolean {
  if (boardConfidence <= 5) return true;
  if (position >= totalTeams - 2 && boardConfidence < 20) return true;
  return false;
}

// --- Item 65: Job offers from other clubs ---
export interface JobOffer {
  clubId: string;
  clubName: string;
  reputation: number;
  wageOffered: number;
  reason: string;
}

export function generateJobOffers(league: League, userTeamId: string, userPosition: number, _seasonNumber: number): JobOffer[] {
  const offers: JobOffer[] = [];
  const userTeam = league.teams.find((t) => t.id === userTeamId);
  if (!userTeam) return offers;

  // Clubs with lower reputation than user's current club may offer jobs
  const interestedClubs = league.teams
    .filter((t) => t.id !== userTeamId && t.reputation < userTeam.reputation + 10)
    .sort(() => Math.random() - 0.5)
    .slice(0, 2);

  for (const club of interestedClubs) {
    if (Math.random() < 0.2) {
      offers.push({
        clubId: club.id,
        clubName: club.name,
        reputation: club.reputation,
        wageOffered: Math.round(club.budget * 0.01),
        reason: userPosition <= 5 ? 'Impressed by your results' : 'Looking for a new direction',
      });
    }
  }

  return offers;
}

// --- Item 66: Manager career history ---
export interface CareerRecord {
  clubName: string;
  seasons: number;
  trophies: number;
  winRate: number;
  bestPosition: number;
}

export function createCareerRecord(clubName: string): CareerRecord {
  return { clubName, seasons: 0, trophies: 0, winRate: 0, bestPosition: 20 };
}

// --- Item 67: Rivalry system ---
export interface Rivalry {
  teamAId: string;
  teamBId: string;
  intensity: number; // 1-10
  reason: string;
}

export function generateRivalries(league: League): Rivalry[] {
  const rivalries: Rivalry[] = [];
  const teams = league.teams;

  // Geographic rivalries (same city)
  const cityGroups: Record<string, Team[]> = {};
  for (const t of teams) {
    if (!cityGroups[t.city]) cityGroups[t.city] = [];
    cityGroups[t.city].push(t);
  }
  for (const [, cityTeams] of Object.entries(cityGroups)) {
    if (cityTeams.length >= 2) {
      for (let i = 0; i < cityTeams.length - 1; i++) {
        rivalries.push({
          teamAId: cityTeams[i].id,
          teamBId: cityTeams[i + 1].id,
          intensity: 8 + Math.floor(Math.random() * 3),
          reason: `${cityTeams[i].city} Derby`,
        });
      }
    }
  }

  // Top-of-the-table rivalries
  const sorted = [...teams].sort((a, b) => b.reputation - a.reputation);
  if (sorted.length >= 4) {
    rivalries.push({
      teamAId: sorted[0].id,
      teamBId: sorted[1].id,
      intensity: 9,
      reason: 'Title rivals',
    });
  }

  return rivalries;
}

export function isDerby(teamAId: string, teamBId: string, rivalries: Rivalry[]): Rivalry | null {
  return rivalries.find((r) =>
    (r.teamAId === teamAId && r.teamBId === teamBId) ||
    (r.teamAId === teamBId && r.teamBId === teamAId)
  ) ?? null;
}

// --- Item 68: Fan happiness ---
export function calculateFanHappiness(position: number, totalTeams: number, recentForm: string[], transferActivity: number): number {
  const positionFactor = Math.max(0, (1 - position / totalTeams) * 50);
  const formFactor = recentForm.filter((f) => f === 'W').length * 5 - recentForm.filter((f) => f === 'L').length * 5;
  const transferFactor = transferActivity * 2;
  return Math.max(0, Math.min(100, 40 + positionFactor + formFactor + transferFactor));
}

// --- Item 69: Media system ---
export interface MediaStory {
  id: string;
  headline: string;
  source: string;
  type: 'transfer' | 'match' | 'manager' | 'club';
  round: number;
}

export function generateMediaStory(type: MediaStory['type'], context: string, round: number): MediaStory {
  const sources = ['Indie FM News', 'The Football Times', 'Sport Daily', 'The Guardian'];
  const headlines: Record<string, string[]> = {
    transfer: [`${context} — Transfer talks underway`, `${context} — Deal close to completion`, `${context} — Rival club enters race`],
    match: [`${context} — Match preview`, `${context} — Tactical analysis`, `${context} — Key battles`],
    manager: [`${context} — Manager under pressure`, `${context} — Manager praised for results`, `${context} — Manager discusses future`],
    club: [`${context} — Club statement`, `${context} — Board meeting outcomes`, `${context} — Fan reaction`],
  };

  return {
    id: `media_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    headline: headlines[type][Math.floor(Math.random() * headlines[type].length)],
    source: sources[Math.floor(Math.random() * sources.length)],
    type,
    round,
  };
}

// --- Item 70: Financial Fair Play ---
export interface FFPStatus {
  netSpend: number;
  wageToRevenueRatio: number;
  isCompliant: boolean;
  warning: string | null;
}

export function checkFFP(netSpend: number, revenue: number, totalWages: number): FFPStatus {
  const wageToRevenueRatio = revenue > 0 ? totalWages / revenue : 1;
  const isCompliant = netSpend < 100_000_000 && wageToRevenueRatio < 0.7;

  let warning: string | null = null;
  if (netSpend > 80_000_000) warning = 'Approaching FFP net spend limit (£100M over 3 years).';
  if (wageToRevenueRatio > 0.65) warning = 'Wage-to-revenue ratio approaching 70% threshold.';

  return { netSpend, wageToRevenueRatio, isCompliant, warning };
}
