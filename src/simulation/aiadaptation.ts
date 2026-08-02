import { Team, Tactics } from '../types';

export function adaptTactics(team: Team, scoreDiff: number, minute: number): Tactics {
  const tactics = { ...team.tactics };

  if (scoreDiff < 0) {
    // Losing — push forward
    if (minute > 60) {
      tactics.mentality = 'attacking';
      tactics.pressing = 'high';
      tactics.tempo = 'fast';
      tactics.defensiveLine = Math.min(75, tactics.defensiveLine + 15);
    } else if (minute > 30) {
      tactics.mentality = 'attacking';
      tactics.pressing = 'high';
    }
  } else if (scoreDiff > 0) {
    // Winning — protect lead
    if (minute > 70) {
      tactics.mentality = 'defensive';
      tactics.pressing = 'low';
      tactics.tempo = 'slow';
      tactics.defensiveLine = Math.max(25, tactics.defensiveLine - 15);
    } else if (minute > 50) {
      tactics.mentality = 'balanced';
      tactics.pressing = 'medium';
    }
  } else {
    // Drawing — maintain or slight push late
    if (minute > 75) {
      tactics.mentality = 'attacking';
      tactics.pressing = 'high';
    }
  }

  return tactics;
}

export function shouldAdapt(minute: number): boolean {
  return minute % 10 === 0 && minute > 0;
}
