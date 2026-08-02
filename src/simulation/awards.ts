import { League, Player } from '../types';
import { getSortedStandings } from './season';

export interface SeasonAwards {
  playerOfTheSeason: { name: string; team: string; rating: number } | null;
  goldenBoot: { name: string; team: string; goals: number } | null;
  mostAssists: { name: string; team: string; assists: number } | null;
  teamOfTheSeason: Array<{ name: string; position: string; team: string; overall: number }>;
  youngPlayerOfTheSeason: { name: string; team: string; age: number; overall: number } | null;
  bestDefense: { team: string; conceded: number } | null;
  bestAttack: { team: string; scored: number } | null;
}

export function computeSeasonAwards(league: League): SeasonAwards {
  const allPlayers: Array<Player & { teamName: string }> = [];
  for (const team of league.teams) {
    for (const player of team.players) {
      allPlayers.push({ ...player, teamName: team.name });
    }
  }

  // Golden Boot
  const topScorer = [...allPlayers].sort((a, b) => b.goals - a.goals)[0];
  const goldenBoot = topScorer && topScorer.goals > 0
    ? { name: topScorer.name, team: topScorer.teamName, goals: topScorer.goals }
    : null;

  // Most Assists
  const topAssister = [...allPlayers].sort((a, b) => b.assists - a.assists)[0];
  const mostAssists = topAssister && topAssister.assists > 0
    ? { name: topAssister.name, team: topAssister.teamName, assists: topAssister.assists }
    : null;

  // Player of the Season (based on overall + goals + assists + appearances)
  const rated = allPlayers
    .filter((p) => p.appearances > 5)
    .map((p) => ({
      ...p,
      rating: p.overall * 2 + p.goals * 3 + p.assists * 2 + p.appearances * 0.5,
    }))
    .sort((a, b) => b.rating - a.rating);

  const playerOfTheSeason = rated[0]
    ? { name: rated[0].name, team: rated[0].teamName, rating: Math.round(rated[0].rating * 10) / 10 }
    : null;

  // Young Player of the Season (U21)
  const youngPlayers = rated.filter((p) => p.age <= 21);
  const youngPlayerOfTheSeason = youngPlayers[0]
    ? { name: youngPlayers[0].name, team: youngPlayers[0].teamName, age: youngPlayers[0].age, overall: youngPlayers[0].overall }
    : null;

  // Team of the Season (best player per position)
  const positions = ['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'ST'] as const;
  const teamOfTheSeason: SeasonAwards['teamOfTheSeason'] = [];
  for (const pos of positions) {
    const best = allPlayers
      .filter((p) => p.position === pos && p.appearances > 3)
      .sort((a, b) => b.overall - a.overall)[0];
    if (best) {
      teamOfTheSeason.push({ name: best.name, position: pos, team: best.teamName, overall: best.overall });
    }
  }

  // Best Defense / Best Attack
  const sorted = getSortedStandings(league.standings);
  const bestDefenseTeam = [...sorted].sort((a, b) => a.goalsAgainst - b.goalsAgainst)[0];
  const bestAttackTeam = [...sorted].sort((a, b) => b.goalsFor - a.goalsFor)[0];

  const bestDefense = bestDefenseTeam
    ? { team: league.teams.find((t) => t.id === bestDefenseTeam.teamId)?.name ?? '?', conceded: bestDefenseTeam.goalsAgainst }
    : null;
  const bestAttack = bestAttackTeam
    ? { team: league.teams.find((t) => t.id === bestAttackTeam.teamId)?.name ?? '?', scored: bestAttackTeam.goalsFor }
    : null;

  return {
    playerOfTheSeason,
    goldenBoot,
    mostAssists,
    teamOfTheSeason,
    youngPlayerOfTheSeason,
    bestDefense,
    bestAttack,
  };
}
