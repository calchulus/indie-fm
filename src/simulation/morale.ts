import { Player } from '../types';

export interface MoraleReason {
  factor: string;
  impact: number;
  description: string;
}

export function computeMoraleReasons(player: Player, context: {
  isStarter: boolean;
  recentResults: Array<'W' | 'D' | 'L'>;
  contractYearsLeft: number;
  teamPosition: number;
  totalTeams: number;
}): MoraleReason[] {
  const reasons: MoraleReason[] = [];

  // Playing time
  if (context.isStarter) {
    reasons.push({ factor: 'Playing Time', impact: 2, description: 'Regular starter — happy with game time' });
  } else {
    reasons.push({ factor: 'Playing Time', impact: -2, description: 'Not getting enough minutes on the pitch' });
  }

  // Recent results
  const recentForm = context.recentResults.slice(-5);
  const wins = recentForm.filter((r) => r === 'W').length;
  const losses = recentForm.filter((r) => r === 'L').length;
  if (wins >= 3) {
    reasons.push({ factor: 'Results', impact: 2, description: 'Team is on a winning streak' });
  } else if (losses >= 3) {
    reasons.push({ factor: 'Results', impact: -2, description: 'Poor run of form is affecting morale' });
  } else if (wins >= 2) {
    reasons.push({ factor: 'Results', impact: 1, description: 'Decent run of results recently' });
  }

  // Contract situation
  if (context.contractYearsLeft <= 0) {
    reasons.push({ factor: 'Contract', impact: -3, description: 'Contract expired — uncertain future' });
  } else if (context.contractYearsLeft === 1) {
    reasons.push({ factor: 'Contract', impact: -1, description: 'Entering final year of contract' });
  } else if (context.contractYearsLeft >= 3) {
    reasons.push({ factor: 'Contract', impact: 1, description: 'Long-term deal provides security' });
  }

  // Team position
  if (context.teamPosition <= 4) {
    reasons.push({ factor: 'Ambition', impact: 2, description: 'Challenging for the title / top 4' });
  } else if (context.teamPosition >= context.totalTeams - 2) {
    reasons.push({ factor: 'Ambition', impact: -2, description: 'Relegation battle is weighing on the squad' });
  }

  // Age and development
  if (player.age <= 21 && player.potentialAbility > player.currentAbility + 30) {
    reasons.push({ factor: 'Development', impact: 1, description: 'Excited about development trajectory' });
  }
  if (player.age >= 33) {
    reasons.push({ factor: 'Career Stage', impact: -1, description: 'Aware that career is winding down' });
  }

  // Form
  if (player.form >= 8) {
    reasons.push({ factor: 'Form', impact: 2, description: 'In excellent form — confidence is high' });
  } else if (player.form <= 3) {
    reasons.push({ factor: 'Form', impact: -2, description: 'Struggling for form — confidence is low' });
  }

  // Fitness
  if (player.fitness < 60) {
    reasons.push({ factor: 'Fitness', impact: -1, description: 'Niggling fitness concerns' });
  }

  return reasons.sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));
}

export function getMoraleLabel(morale: number): { label: string; color: string } {
  if (morale >= 9) return { label: 'Ecstatic', color: '#4ade80' };
  if (morale >= 7) return { label: 'Happy', color: '#a3e635' };
  if (morale >= 5) return { label: 'Content', color: '#fbbf24' };
  if (morale >= 3) return { label: 'Unhappy', color: '#fb923c' };
  return { label: 'Miserable', color: '#f87171' };
}
