// Player development arcs (#16), squad hierarchy (#17), academy scaling (#14)

import { Player, Team } from '../types';

// --- #16: Player Development Arcs ---

export interface DevelopmentArc {
  playerId: string;
  phase: 'growth' | 'peak' | 'decline';
  growthRate: number;    // attribute points per season (positive = improving)
  peakAge: number;       // when player reaches maximum
  declineRate: number;   // attribute points lost per season after peak
  potentialRemaining: number; // how much more they can grow
}

export function computeDevelopmentArc(player: Player): DevelopmentArc {
  const isGK = player.position === 'GK';
  // GKs peak later (30-32) vs outfield (27-29)
  const peakAge = isGK ? 31 : 27 + Math.floor((player.hidden?.consistency ?? 10) / 10);

  let phase: DevelopmentArc['phase'];
  let growthRate: number;

  if (player.age < peakAge - 3) {
    phase = 'growth';
    // Younger players grow faster; high potential = faster growth
    const ageFactor = Math.max(0.3, 1 - (player.age - 17) * 0.08);
    const potentialFactor = (player.potentialAbility - player.currentAbility) / 50;
    growthRate = Math.round((2 + potentialFactor * 4) * ageFactor * 10) / 10;
  } else if (player.age <= peakAge + 1) {
    phase = 'peak';
    growthRate = 0.2; // minimal maintenance growth
  } else {
    phase = 'decline';
    // Decline accelerates after 33
    const yearsPastPeak = player.age - peakAge;
    growthRate = -(0.5 + yearsPastPeak * 0.4); // negative = losing ability
  }

  const potentialRemaining = Math.max(0, player.potentialAbility - player.currentAbility);

  return {
    playerId: player.id,
    phase,
    growthRate,
    peakAge,
    declineRate: phase === 'decline' ? Math.abs(growthRate) : 0,
    potentialRemaining,
  };
}

export function applySeasonDevelopment(player: Player, arc: DevelopmentArc): Player {
  const change = Math.round(arc.growthRate);
  if (change === 0) return player;

  const newOverall = Math.max(30, Math.min(95, player.overall + change));
  const newCA = Math.max(30, Math.min(player.potentialAbility, player.currentAbility + change));

  return { ...player, overall: newOverall, currentAbility: newCA };
}

export function getSquadDevelopmentSummary(team: Team): { growing: number; peaking: number; declining: number } {
  const arcs = team.players.map((p) => computeDevelopmentArc(p));
  return {
    growing: arcs.filter((a) => a.phase === 'growth').length,
    peaking: arcs.filter((a) => a.phase === 'peak').length,
    declining: arcs.filter((a) => a.phase === 'decline').length,
  };
}

// --- #17: Squad Hierarchy / Dressing Room Politics ---

export interface SquadHierarchy {
  captain: Player | null;
  viceCaptain: Player | null;
  seniorGroup: Player[];   // 3-5 most influential players
  cliques: Array<{ leader: Player; members: Player[] }>;
  moraleInfluence: Map<string, number>; // playerId → influence on squad morale
}

export function computeSquadHierarchy(team: Team): SquadHierarchy {
  const sorted = [...team.players].sort((a, b) => {
    const aScore = a.age * 2 + a.reputation + (a.hidden?.loyalty ?? 10) * 3;
    const bScore = b.age * 2 + b.reputation + (b.hidden?.loyalty ?? 10) * 3;
    return bScore - aScore;
  });

  const captain = sorted[0] ?? null;
  const viceCaptain = sorted[1] ?? null;
  const seniorGroup = sorted.slice(0, 5);

  // Cliques form by nationality
  const byNationality = new Map<string, Player[]>();
  for (const p of team.players) {
    const group = byNationality.get(p.nationality) ?? [];
    group.push(p);
    byNationality.set(p.nationality, group);
  }
  const cliques = [...byNationality.entries()]
    .filter(([, members]) => members.length >= 3)
    .map(([, members]) => ({
      leader: members.sort((a, b) => b.age - a.age)[0],
      members,
    }));

  // Morale influence: senior players boost younger ones
  const moraleInfluence = new Map<string, number>();
  for (const senior of seniorGroup) {
    const influence = (senior.hidden?.loyalty ?? 10) / 10 + senior.reputation / 100;
    moraleInfluence.set(senior.id, influence);
  }

  return { captain, viceCaptain, seniorGroup, cliques, moraleInfluence };
}

export function computeCaptaincyImpact(hierarchy: SquadHierarchy, soldPlayerId: string): { moraleHit: number; description: string } {
  const wasCaptain = hierarchy.captain?.id === soldPlayerId;
  const wasSenior = hierarchy.seniorGroup.some((p) => p.id === soldPlayerId);
  const wasCliqueLeader = hierarchy.cliques.some((c) => c.leader.id === soldPlayerId);

  let moraleHit = 0;
  let description = '';

  if (wasCaptain) {
    moraleHit = -15;
    description = `Selling captain ${hierarchy.captain?.name} devastates the dressing room.`;
  } else if (wasCliqueLeader) {
    moraleHit = -10;
    description = `Selling a key group leader unsettles their clique.`;
  } else if (wasSenior) {
    moraleHit = -6;
    description = `Losing a senior player reduces squad experience.`;
  } else {
    moraleHit = -2;
    description = 'Minor squad disruption from the departure.';
  }

  return { moraleHit, description };
}

// --- #14: Academy Scaling ---

export interface AcademyOutput {
  prospectCount: number;
  avgPotential: number;
  maxPotential: number;
  homegrownBonus: boolean;
}

export function computeAcademyOutput(academyLevel: number, teamReputation: number): AcademyOutput {
  // Higher academy level → more prospects with better potential
  const prospectCount = 3 + academyLevel * 2;
  const basePotential = 1 + Math.floor(academyLevel * 0.8);
  const repBonus = Math.floor(teamReputation / 30);
  const avgPotential = Math.min(5, basePotential + repBonus);
  const maxPotential = Math.min(5, avgPotential + 1 + (academyLevel >= 4 ? 1 : 0));

  return {
    prospectCount,
    avgPotential,
    maxPotential,
    homegrownBonus: academyLevel >= 3,
  };
}

export function getAcademyInvestmentCost(currentLevel: number): number {
  // Cost to upgrade academy by 1 level
  const costs = [0, 2_000_000, 5_000_000, 10_000_000, 20_000_000, 40_000_000];
  return costs[Math.min(currentLevel, costs.length - 1)] ?? 50_000_000;
}
