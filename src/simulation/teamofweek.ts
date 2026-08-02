import { League, Player } from '../types';
import { MatchResult } from './season';

export interface TeamOfTheWeek {
  round: number;
  players: Array<{ player: Player; teamName: string; rating: number; position: string }>;
  formation: string;
}

export function computeTeamOfTheWeek(league: League, results: MatchResult[], round: number): TeamOfTheWeek {
  const performers: Array<{ player: Player; teamName: string; score: number; position: string }> = [];

  for (const team of league.teams) {
    const teamResult = results.find((r) => r.homeTeamId === team.id || r.awayTeamId === team.id);
    if (!teamResult) continue;

    const isHome = teamResult.homeTeamId === team.id;
    const goalsScored = isHome ? teamResult.homeGoals : teamResult.awayGoals;
    const goalsConceded = isHome ? teamResult.awayGoals : teamResult.homeGoals;
    const won = goalsScored > goalsConceded;
    const cleanSheet = goalsConceded === 0;

    for (const player of team.players.slice(0, 11)) {
      let score = player.overall * 0.5;

      // Bonus for winning
      if (won) score += 5;
      else if (goalsScored === goalsConceded) score += 2;

      // Position-specific bonuses
      if (['ST', 'LW', 'RW', 'CAM'].includes(player.position)) {
        score += goalsScored * 3; // Attackers benefit from team goals
      }
      if (['CB', 'LB', 'RB', 'GK'].includes(player.position)) {
        if (cleanSheet) score += 8;
      }
      if (['CM', 'CDM'].includes(player.position)) {
        score += goalsScored * 1.5 + (cleanSheet ? 3 : 0);
      }

      // Form and fitness factor
      score += player.form * 0.5;
      score += (player.fitness / 100) * 2;

      performers.push({ player, teamName: team.name, score, position: player.position });
    }
  }

  // Pick best per position
  const positions = ['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'ST'] as const;
  const selected: TeamOfTheWeek['players'] = [];

  for (const pos of positions) {
    const candidates = performers
      .filter((p) => p.position === pos)
      .sort((a, b) => b.score - a.score);

    if (candidates.length > 0) {
      const best = candidates[0];
      selected.push({
        player: best.player,
        teamName: best.teamName,
        rating: Math.min(10, Math.round((best.score / 10) * 10) / 10),
        position: pos,
      });
    }
  }

  // Fill remaining slots with best available
  while (selected.length < 11) {
    const remaining = performers
      .filter((p) => !selected.some((s) => s.player.id === p.player.id))
      .sort((a, b) => b.score - a.score);
    if (remaining.length === 0) break;
    const best = remaining[0];
    selected.push({
      player: best.player,
      teamName: best.teamName,
      rating: Math.min(10, Math.round((best.score / 10) * 10) / 10),
      position: best.position,
    });
  }

  return {
    round,
    players: selected.sort((a, b) => b.rating - a.rating),
    formation: '4-3-3',
  };
}
