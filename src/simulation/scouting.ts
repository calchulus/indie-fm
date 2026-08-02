import { Player, Team } from '../types';

export interface Scout {
  id: string;
  name: string;
  nationality: string;
  judgingAbility: number;
  judgingPotential: number;
  adaptability: number;
  determination: number;
  regions: string[];
  wage: number;
}

export interface ScoutAssignment {
  scoutId: string;
  type: 'region' | 'nation' | 'club' | 'player';
  target: string;
  progress: number;
}

export interface ScoutReport {
  playerId: string;
  scoutId: string;
  knowledge: number;
  currentAbilityStars: number;
  potentialAbilityStars: number;
  recommended: boolean;
  summary: string;
  generatedRound: number;
}

export function generateScout(nationality: string): Scout {
  const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
  const names = ['James Whitfield', 'Carlos Mendes', 'Hans Müller', 'Pierre Dubois', 'Marco Rossi', 'Erik Larsson', 'Tomasz Kowalski', 'Kenji Watanabe'];
  return {
    id: `scout_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    name: names[Math.floor(Math.random() * names.length)],
    nationality,
    judgingAbility: rand(8, 18),
    judgingPotential: rand(8, 18),
    adaptability: rand(5, 16),
    determination: rand(8, 18),
    regions: [nationality],
    wage: rand(2000, 8000),
  };
}

export function computeKnowledge(assignment: ScoutAssignment, scout: Scout): number {
  const baseRate = 0.05 + (scout.adaptability / 20) * 0.05;
  const regionBonus = scout.regions.includes(assignment.target) ? 0.03 : 0;
  return Math.min(100, assignment.progress + (baseRate + regionBonus) * 100);
}

export function generateReport(
  player: Player,
  scout: Scout,
  knowledge: number,
  round: number,
): ScoutReport {
  const accuracy = knowledge / 100;
  const noise = (1 - accuracy) * 3;
  const rand = () => (Math.random() - 0.5) * noise;

  const perceivedCA = Math.max(1, Math.min(5, Math.round((player.currentAbility / 40) + rand())));
  const perceivedPA = Math.max(1, Math.min(5, Math.round((player.potentialAbility / 40) + rand())));

  const recommended = perceivedCA >= 3 || perceivedPA >= 4;

  let summary = '';
  if (knowledge < 30) summary = 'Limited knowledge. Needs more scouting.';
  else if (perceivedPA >= 4) summary = 'High potential. Worth monitoring closely.';
  else if (perceivedCA >= 4) summary = 'Quality player. Could improve the squad.';
  else if (perceivedCA >= 3) summary = 'Decent player. Squad depth option.';
  else summary = 'Below the required standard.';

  return {
    playerId: player.id,
    scoutId: scout.id,
    knowledge: Math.round(knowledge),
    currentAbilityStars: perceivedCA,
    potentialAbilityStars: perceivedPA,
    recommended,
    summary,
    generatedRound: round,
  };
}

export function getStarDisplay(stars: number): string {
  return '★'.repeat(stars) + '☆'.repeat(5 - stars);
}

export function estimateValue(player: Player, knowledge: number): { min: number; max: number } {
  const spread = (1 - knowledge / 100) * 0.5;
  return {
    min: Math.round(player.value * (1 - spread)),
    max: Math.round(player.value * (1 + spread)),
  };
}

export function scoutPlayerPool(teams: Team[], userTeamId: string, region?: string): Player[] {
  const pool: Player[] = [];
  for (const team of teams) {
    if (team.id === userTeamId) continue;
    for (const player of team.players) {
      if (region && player.nationality !== region) continue;
      pool.push(player);
    }
  }
  return pool;
}
