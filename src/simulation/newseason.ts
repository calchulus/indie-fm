import { League } from '../types';
import { generateFixtures, generateTeam } from '../data/generators';
import { processAging } from './development';
import { generatePlayer } from '../data/generators';
import { generateYouthIntake as generateAcademyIntake, YouthAcademyConfig } from './youth-academy';

export interface NewSeasonResult {
  league: League;
  youthIntake: Array<{ teamId: string; playerName: string; position: string; overall: number }>;
  retiredPlayers: Array<{ teamId: string; playerName: string; age: number }>;
  relegated: Array<{ teamId: string; teamName: string }>;
  promoted: Array<{ teamId: string; teamName: string }>;
}

export function startNewSeason(league: League): NewSeasonResult {
  const youthIntake: NewSeasonResult['youthIntake'] = [];
  const retiredPlayers: NewSeasonResult['retiredPlayers'] = [];

  // 1. Age all players and apply development/decline
  const agedTeams = league.teams.map((team) => ({
    ...team,
    players: processAging(team.players),
  }));

  // 2. Retire players aged 36+ (with some randomness)
  const teamsAfterRetirement = agedTeams.map((team) => {
    const remaining = team.players.filter((p) => {
      if (p.age >= 36 && Math.random() < 0.7) {
        retiredPlayers.push({ teamId: team.id, playerName: p.name, age: p.age });
        return false;
      }
      if (p.age >= 38) {
        retiredPlayers.push({ teamId: team.id, playerName: p.name, age: p.age });
        return false;
      }
      return true;
    });
    return { ...team, players: remaining };
  });

  // 3. Youth intake — quality scales with academy facility level
  const teamsWithYouth = teamsAfterRetirement.map((team) => {
    const academyConfig: YouthAcademyConfig = {
      facilityLevel: Math.min(5, Math.max(1, Math.round(team.reputation / 20))),
      coachingLevel: Math.min(5, Math.max(1, Math.round(team.reputation / 25))),
      investmentPerYear: Math.round(team.budget * 0.05),
    };
    const intake = generateAcademyIntake(academyConfig);
    for (const player of intake.players) {
      youthIntake.push({ teamId: team.id, playerName: player.name, position: player.position, overall: player.overall });
    }
    return { ...team, players: [...team.players, ...intake.players] };
  });

  // 4. Ensure minimum squad size (14 players)
  const fillerPositions = ['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'ST'] as const;
  const finalTeams = teamsWithYouth.map((team) => {
    if (team.players.length >= 14) return team;
    const needed = 14 - team.players.length;
    const fillers = [];
    for (let i = 0; i < needed; i++) {
      const pos = fillerPositions[Math.floor(Math.random() * fillerPositions.length)];
      fillers.push(generatePlayer(pos, 40 + Math.floor(Math.random() * 15)));
    }
    return { ...team, players: [...team.players, ...fillers] };
  });

  // 5. Promotion/Relegation — bottom 3 relegated, replaced by 3 promoted teams
  const sortedStandings = [...league.standings].sort((a, b) => b.points - a.points || (b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst));
  const relegatedTeams = sortedStandings.slice(-3);
  const relegated: NewSeasonResult['relegated'] = relegatedTeams.map((s) => {
    const team = finalTeams.find((t) => t.id === s.teamId);
    return { teamId: s.teamId, teamName: team?.name ?? 'Unknown' };
  });

  // Generate 3 promoted teams (from "lower division")
  const promoted: NewSeasonResult['promoted'] = [];
  const promotedTeams = [];
  for (let i = 0; i < 3; i++) {
    const newTeam = generateTeam(100 + i, 35 + Math.floor(Math.random() * 15));
    promotedTeams.push(newTeam);
    promoted.push({ teamId: newTeam.id, teamName: newTeam.name });
  }

  // Replace relegated teams with promoted teams
  const relegatedIds = new Set(relegatedTeams.map((s) => s.teamId));
  const teamsAfterPromotion = finalTeams.filter((t) => !relegatedIds.has(t.id));
  teamsAfterPromotion.push(...promotedTeams);

  // 6. Reset fixtures for new season
  const newFixtures = generateFixtures(teamsAfterPromotion);

  // 7. Reset standings
  const newStandings = teamsAfterPromotion.map((t) => ({
    teamId: t.id, played: 0, won: 0, drawn: 0, lost: 0,
    goalsFor: 0, goalsAgainst: 0, points: 0,
  }));

  // 8. Reset player season stats
  const resetTeams = teamsAfterPromotion.map((team) => ({
    ...team,
    players: team.players.map((p) => ({
      ...p,
      goals: 0,
      assists: 0,
      appearances: 0,
      yellowCards: 0,
      redCards: 0,
      fitness: 100,
      form: 6,
    })),
  }));

  return {
    league: {
      ...league,
      teams: resetTeams,
      fixtures: newFixtures,
      standings: newStandings,
      currentRound: 1,
    },
    youthIntake,
    retiredPlayers,
    relegated,
    promoted,
  };
}
