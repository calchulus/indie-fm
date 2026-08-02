import { Player, Position } from '../types';
import { generatePlayer } from '../data/generators';

export interface YouthAcademyConfig {
  facilityLevel: number;
  coachingLevel: number;
  investmentPerYear: number;
}

export interface YouthIntakeResult {
  players: Player[];
  quality: string;
  averagePotential: number;
}

export function generateYouthIntake(config: YouthAcademyConfig): YouthIntakeResult {
  const { facilityLevel, coachingLevel } = config;

  // Quality scales with facility + coaching level (1-5 each)
  const baseQuality = 30 + (facilityLevel * 5) + (coachingLevel * 4) + Math.floor(Math.random() * 10);
  const count = 2 + Math.floor(Math.random() * 2) + (facilityLevel >= 4 ? 1 : 0);

  const positions: Position[] = ['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'ST'];
  const players: Player[] = [];

  for (let i = 0; i < count; i++) {
    const pos = positions[Math.floor(Math.random() * positions.length)];
    const quality = baseQuality + Math.floor(Math.random() * 15) - 5;
    const player = generatePlayer(pos, Math.min(80, quality));

    // Youth players are 15-18
    player.age = 15 + Math.floor(Math.random() * 4);

    // High potential for good academy
    const potentialBonus = facilityLevel * 8 + coachingLevel * 6;
    player.potentialAbility = Math.min(200, player.currentAbility + 30 + potentialBonus + Math.floor(Math.random() * 20));

    // Low value and wage for youth
    player.value = Math.round(player.overall * player.overall * 100);
    player.wage = Math.round(player.overall * 20);
    player.contractExpiry = 2026 + 3;

    players.push(player);
  }

  const avgPotential = Math.round(players.reduce((s, p) => s + p.potentialAbility, 0) / players.length);
  const qualityLabel = avgPotential >= 150 ? 'Exceptional' : avgPotential >= 120 ? 'Very Good' : avgPotential >= 100 ? 'Good' : avgPotential >= 80 ? 'Decent' : 'Average';

  return { players, quality: qualityLabel, averagePotential: avgPotential };
}

export function getAcademyRating(config: YouthAcademyConfig): number {
  return Math.round((config.facilityLevel + config.coachingLevel) / 2 * 20);
}

export function getAcademyDescription(level: number): string {
  switch (level) {
    case 5: return 'World-class facilities producing elite talent';
    case 4: return 'Excellent academy with strong coaching staff';
    case 3: return 'Good facilities developing promising players';
    case 2: return 'Basic setup with room for improvement';
    case 1: return 'Minimal facilities — youth development is limited';
    default: return 'No academy facilities';
  }
}
