// Player lifecycle: development, contracts, value, skills, feats, HOF, jersey numbers
// Covers ZenGM's player/ modules: developSeason, genContract, value, skills,
// checkStatisticalFeat, madeHof, genJerseyNumber, compositeRating, fuzzRating

import { Player, Team } from '../types';

// --- Seasonal Development (actually changes ratings) ---
export function developSeason(player: Player): Player {
  const age = player.age + 1;
  const isGK = player.position === 'GK';
  const peakAge = isGK ? 31 : 28;
  const attrs = { ...player.attributes } as any;

  if (age <= peakAge - 3) {
    // Growth phase: improve attributes toward potential
    const growthRate = Math.max(0.3, 1 - (age - 17) * 0.07);
    const potentialGap = player.potentialAbility - player.currentAbility;
    const boost = Math.round(growthRate * Math.min(3, potentialGap / 10));

    if (boost > 0) {
      // Improve weakest attributes first
      const attrKeys = Object.keys(attrs).filter((k) => typeof attrs[k] === 'number');
      const sorted = attrKeys.sort((a, b) => attrs[a] - attrs[b]);
      for (let i = 0; i < Math.min(boost, sorted.length); i++) {
        attrs[sorted[i]] = Math.min(20, attrs[sorted[i]] + 1);
      }
    }
  } else if (age > peakAge + 1) {
    // Decline phase: reduce physical attributes
    const yearsPastPeak = age - peakAge;
    const declineRate = Math.min(2, Math.floor(yearsPastPeak * 0.5));
    const physicalAttrs = ['pace', 'acceleration', 'stamina', 'agility', 'strength'];
    for (const attr of physicalAttrs) {
      if (attr in attrs && declineRate > 0) {
        attrs[attr] = Math.max(1, attrs[attr] - (Math.random() < 0.5 ? 1 : 0));
      }
    }
  }

  const newCA = Math.max(30, Math.min(player.potentialAbility, player.currentAbility + (age <= peakAge ? 1 : -1)));
  const newOverall = computeCompositeRating(attrs, player.position);

  return { ...player, age, attributes: attrs, currentAbility: newCA, overall: newOverall };
}

// --- Composite Rating (position-weighted OVR) ---
const POSITION_WEIGHTS: Record<string, Record<string, number>> = {
  GK: { reflexes: 3, handling: 2.5, oneOnOnes: 2, aerialReach: 1.5, positioning: 2, concentration: 1.5, communication: 1, rushingOut: 1 },
  CB: { marking: 3, tackling: 3, positioning: 2.5, heading: 2, strength: 2, concentration: 1.5, aggression: 1, pace: 1, jumpingReach: 1.5 },
  LB: { pace: 2.5, crossing: 2, tackling: 2, marking: 1.5, stamina: 2, dribbling: 1.5, passing: 1.5, acceleration: 1.5 },
  RB: { pace: 2.5, crossing: 2, tackling: 2, marking: 1.5, stamina: 2, dribbling: 1.5, passing: 1.5, acceleration: 1.5 },
  CDM: { tackling: 2.5, positioning: 2.5, passing: 2, stamina: 2, strength: 1.5, concentration: 1.5, aggression: 1, vision: 1 },
  CM: { passing: 3, vision: 2.5, technique: 2, stamina: 1.5, decisions: 2, composure: 1.5, firstTouch: 1.5, workRate: 1 },
  CAM: { vision: 3, passing: 2.5, technique: 2.5, dribbling: 2, flair: 1.5, composure: 1.5, offTheBall: 1.5, firstTouch: 1 },
  LW: { pace: 2.5, dribbling: 2.5, crossing: 2, technique: 2, acceleration: 2, agility: 1.5, finishing: 1, flair: 1 },
  RW: { pace: 2.5, dribbling: 2.5, crossing: 2, technique: 2, acceleration: 2, agility: 1.5, finishing: 1, flair: 1 },
  ST: { finishing: 3, offTheBall: 2.5, composure: 2, pace: 2, acceleration: 1.5, heading: 1.5, strength: 1, dribbling: 1 },
};

export function computeCompositeRating(attrs: any, position: string): number {
  const weights = POSITION_WEIGHTS[position] ?? POSITION_WEIGHTS['CM'];
  let total = 0;
  let weightSum = 0;
  for (const [attr, weight] of Object.entries(weights)) {
    if (attr in attrs) {
      total += attrs[attr] * weight;
      weightSum += weight;
    }
  }
  return weightSum > 0 ? Math.round(total / weightSum) : 50;
}

// --- Trade Value ---
export function computePlayerValue(player: Player): number {
  const ageFactor = player.age <= 23 ? 1.5 : player.age <= 27 ? 1.2 : player.age <= 30 ? 0.9 : player.age <= 33 ? 0.5 : 0.2;
  const potentialBonus = Math.max(0, player.potentialAbility - player.currentAbility) * 50_000;
  const baseValue = player.overall * player.overall * 10_000;
  const contractFactor = player.contractExpiry >= 2028 ? 1.1 : player.contractExpiry <= 2026 ? 0.6 : 1.0;
  return Math.round((baseValue * ageFactor + potentialBonus) * contractFactor);
}

// --- Contract Generation ---
export function generateContract(player: Player): { wage: number; length: number; signingBonus: number } {
  const baseWage = player.overall * player.overall * 2; // quadratic scaling
  const ageModifier = player.age <= 24 ? 0.8 : player.age <= 28 ? 1.0 : 0.7;
  const wage = Math.round(baseWage * ageModifier / 100) * 100;
  const length = player.age <= 24 ? 5 : player.age <= 28 ? 4 : player.age <= 31 ? 3 : 2;
  const signingBonus = Math.round(wage * (player.overall > 75 ? 10 : 4));
  return { wage, length, signingBonus };
}

// --- Rookie Wage Scale (draft picks) ---
export function getRookieWage(pickNumber: number): number {
  // Pick 1 gets highest wage, decreasing by pick
  const base = 5000;
  const wage = Math.max(500, Math.round(base * (1 - (pickNumber - 1) * 0.04)));
  return wage;
}

// --- Player Skills/Labels ---
export function computeSkillLabels(player: Player): string[] {
  const labels: string[] = [];
  const a = player.attributes;

  if (a.pace >= 16 && a.acceleration >= 16) labels.push('⚡ Speedster');
  if (a.finishing >= 16 && a.composure >= 14) labels.push('🎯 Clinical Finisher');
  if (a.passing >= 16 && a.vision >= 16) labels.push('🎨 Playmaker');
  if (a.tackling >= 16 && a.marking >= 15) labels.push('🧱 Ball Winner');
  if (a.dribbling >= 16 && a.agility >= 15) labels.push('✨ Trickster');
  if (a.heading >= 16 && a.jumpingReach >= 15) labels.push('🏔️ Aerial Threat');
  if (a.stamina >= 17 && a.workRate >= 16) labels.push('🔋 Engine');
  if (a.strength >= 16 && a.aggression >= 14) labels.push('💪 Enforcer');
  if (a.vision >= 16 && a.technique >= 15 && a.flair >= 14) labels.push('🌟 Maestro');
  if ((a as any).reflexes >= 16 && (a as any).oneOnOnes >= 15) labels.push('🧤 Shot Stopper');
  if (a.composure >= 17 && a.decisions >= 16) labels.push('🧠 Ice Cold');
  if (a.crossing >= 16 && a.pace >= 14) labels.push('📐 Delivery Specialist');

  return labels.slice(0, 3); // Max 3 labels
}

// --- Scouting Fuzz (uncertainty) ---
export function fuzzRating(actual: number, scoutLevel: number): { display: string; confidence: number } {
  const confidence = Math.min(1, scoutLevel * 0.25);
  const noise = Math.round((1 - confidence) * 5);
  if (noise === 0) return { display: `${actual}`, confidence };
  const low = Math.max(1, actual - noise);
  const high = Math.min(20, actual + noise);
  return { display: `${low}-${high}`, confidence };
}

// --- Statistical Feats ---
export interface StatFeat {
  type: string;
  message: string;
  playerId: string;
  playerName: string;
}

export function checkMatchFeats(playerId: string, playerName: string, stats: { goals: number; assists: number; saves: number; tackles: number; rating: number }): StatFeat[] {
  const feats: StatFeat[] = [];
  if (stats.goals >= 3) feats.push({ type: 'hat_trick', message: `🎩 Hat trick! ${playerName} scores ${stats.goals}!`, playerId, playerName });
  if (stats.goals >= 2 && stats.assists >= 2) feats.push({ type: 'double_double', message: `⭐ ${playerName}: ${stats.goals} goals + ${stats.assists} assists!`, playerId, playerName });
  if (stats.saves >= 8) feats.push({ type: 'wall', message: `🧱 ${playerName} makes ${stats.saves} saves!`, playerId, playerName });
  if (stats.rating >= 9.5) feats.push({ type: 'masterclass', message: `👑 Masterclass from ${playerName} (${stats.rating.toFixed(1)} rating)`, playerId, playerName });
  if (stats.tackles >= 10) feats.push({ type: 'destroyer', message: `💪 ${playerName} wins ${stats.tackles} tackles!`, playerId, playerName });
  return feats;
}

export function checkCareerMilestones(player: Player): StatFeat[] {
  const feats: StatFeat[] = [];
  if (player.goals === 100) feats.push({ type: 'century', message: `💯 ${player.name} scores their 100th career goal!`, playerId: player.id, playerName: player.name });
  if (player.appearances === 200) feats.push({ type: '200_apps', message: `🏟️ ${player.name} makes their 200th appearance!`, playerId: player.id, playerName: player.name });
  if (player.appearances === 500) feats.push({ type: '500_apps', message: `🏛️ ${player.name} — 500 appearances! A true legend.`, playerId: player.id, playerName: player.name });
  return feats;
}

// --- Hall of Fame ---
export function madeHallOfFame(player: Player): boolean {
  return player.appearances >= 300 && player.goals >= 100 ||
    player.appearances >= 500 ||
    player.goals >= 200;
}

// --- Jersey Numbers ---
export function assignJerseyNumbers(players: Player[]): Map<string, number> {
  const numbers = new Map<string, number>();
  const used = new Set<number>();
  const posPreferences: Record<string, number[]> = {
    GK: [1, 13, 25], CB: [4, 5, 6, 15], LB: [3, 12], RB: [2, 14],
    CDM: [4, 6, 8], CM: [8, 10, 14, 16], CAM: [10, 7, 11],
    LW: [11, 7], RW: [7, 11], ST: [9, 19, 20],
  };

  for (const p of players) {
    const prefs = posPreferences[p.position] ?? [];
    let num = prefs.find((n) => !used.has(n));
    if (!num) {
      for (let i = 1; i <= 40; i++) { if (!used.has(i)) { num = i; break; } }
    }
    used.add(num ?? 99);
    numbers.set(p.id, num ?? 99);
  }
  return numbers;
}

// --- Per-Season Stats History ---
export interface SeasonStatsRow {
  season: number;
  teamId: string;
  appearances: number;
  goals: number;
  assists: number;
  avgRating: number;
  yellowCards: number;
  redCards: number;
}

export function createSeasonStatsRow(player: Player, season: number, teamId: string, matchStats: Array<{ rating: number; goals: number; assists: number }>): SeasonStatsRow {
  const apps = matchStats.length;
  const goals = matchStats.reduce((s, m) => s + m.goals, 0);
  const assists = matchStats.reduce((s, m) => s + m.assists, 0);
  const avgRating = apps > 0 ? Math.round((matchStats.reduce((s, m) => s + m.rating, 0) / apps) * 10) / 10 : 0;

  return { season, teamId, appearances: apps, goals, assists, avgRating, yellowCards: player.yellowCards, redCards: player.redCards };
}

// --- Free Agent Demand Decay ---
export function decayFreeAgentDemands(listings: Array<{ askingWage: number; daysAvailable: number }>): typeof listings {
  return listings.map((l) => ({
    ...l,
    daysAvailable: l.daysAvailable + 1,
    askingWage: l.daysAvailable > 3 ? Math.round(l.askingWage * 0.9) : l.askingWage, // 10% reduction after 3 days
  }));
}

// --- Minimum Roster Enforcement ---
export function ensureMinimumRoster(team: Team, minSize: number = 14): { needsPlayers: boolean; shortage: number } {
  const shortage = Math.max(0, minSize - team.players.length);
  return { needsPlayers: shortage > 0, shortage };
}
