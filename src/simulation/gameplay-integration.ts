// Match importance weighting (#25), injury recovery integration (#26),
// achievement toast notifications (#35)

import { Team, Player } from '../types';
import { MatchInjury } from './setpieces';

// --- #25: Match Importance Weighting ---
// Cup finals, derbies, and relegation six-pointers have amplified morale swings.

export type MatchImportance = 'friendly' | 'league' | 'derby' | 'cup_semifinal' | 'cup_final' | 'relegation_six_pointer' | 'title_decider';

export function determineMatchImportance(
  home: Team,
  away: Team,
  position: number,
  totalTeams: number,
  round: number,
  totalRounds: number,
  isCup: boolean,
  isCupFinal: boolean,
): MatchImportance {
  if (isCupFinal) return 'cup_final';
  if (isCup && round >= 4) return 'cup_semifinal';
  if (home.city === away.city) return 'derby';

  // Title decider: top 2 teams in last 5 rounds
  if (round > totalRounds - 5 && position <= 2) return 'title_decider';

  // Relegation six-pointer: bottom 4 teams playing each other
  if (position > totalTeams - 4) return 'relegation_six_pointer';

  return 'league';
}

export function getImportanceMoraleMultiplier(importance: MatchImportance): number {
  switch (importance) {
    case 'cup_final': return 2.0;
    case 'title_decider': return 1.8;
    case 'derby': return 1.5;
    case 'cup_semifinal': return 1.4;
    case 'relegation_six_pointer': return 1.3;
    case 'league': return 1.0;
    case 'friendly': return 0.5;
  }
}

// --- #26: Injury Recovery Integration ---
// Apply match injuries to player fitness so they actually miss rounds.

export function applyMatchInjuries(players: Player[], injuries: MatchInjury[]): Player[] {
  if (injuries.length === 0) return players;

  const injuryMap = new Map(injuries.map((i) => [i.playerId, i]));

  return players.map((p) => {
    const injury = injuryMap.get(p.id);
    if (!injury) return p;

    // Set fitness to 0 — player is unavailable until recovery
    // Severity determines how many rounds they're out
    return { ...p, fitness: 0 };
  });
}

export function recoverInjuredPlayers(players: Player[], round: number, injuryRoundMap: Map<string, { round: number; roundsOut: number }>): Player[] {
  return players.map((p) => {
    if (p.fitness > 0) return p;
    const injuryInfo = injuryRoundMap.get(p.id);
    if (!injuryInfo) return { ...p, fitness: 100 }; // no record = recovered

    const elapsed = round - injuryInfo.round;
    if (elapsed >= injuryInfo.roundsOut) {
      // Recovered — return at 70% fitness (match sharpness needed)
      return { ...p, fitness: 70 };
    }
    return p; // still injured
  });
}

// --- #35: Achievement Toast Notifications ---

export interface AchievementUnlock {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export function checkNewAchievements(
  prevStats: { wins: number; goals: number; cleanSheets: number; unbeatenStreak: number; seasonsPlayed: number; trophies: number; promotions: number },
  newStats: typeof prevStats,
  alreadyUnlocked: Set<string>,
): AchievementUnlock[] {
  const thresholds: Array<{ id: string; name: string; icon: string; description: string; check: (s: typeof newStats) => boolean }> = [
    { id: 'first_win', name: 'First Blood', icon: '🏆', description: 'Win your first match', check: (s) => s.wins >= 1 },
    { id: 'ten_wins', name: 'Momentum', icon: '🔥', description: 'Win 10 matches', check: (s) => s.wins >= 10 },
    { id: 'fifty_goals', name: 'Goal Machine', icon: '⚽', description: 'Score 50 goals', check: (s) => s.goals >= 50 },
    { id: 'hundred_goals', name: 'Century', icon: '💯', description: 'Score 100 goals', check: (s) => s.goals >= 100 },
    { id: 'unbeaten_5', name: 'Unstoppable', icon: '🛡️', description: 'Unbeaten in 5', check: (s) => s.unbeatenStreak >= 5 },
    { id: 'unbeaten_10', name: 'Invincible', icon: '👑', description: 'Unbeaten in 10', check: (s) => s.unbeatenStreak >= 10 },
    { id: 'first_trophy', name: 'Silverware', icon: '🥇', description: 'Win a trophy', check: (s) => s.trophies >= 1 },
    { id: 'promotion', name: 'Moving Up', icon: '📈', description: 'Earn promotion', check: (s) => s.promotions >= 1 },
  ];

  const newlyUnlocked: AchievementUnlock[] = [];
  for (const t of thresholds) {
    if (!alreadyUnlocked.has(t.id) && !t.check(prevStats) && t.check(newStats)) {
      newlyUnlocked.push({ id: t.id, name: t.name, icon: t.icon, description: t.description });
    }
  }

  return newlyUnlocked;
}
