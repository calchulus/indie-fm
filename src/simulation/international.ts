import { Team, Player } from '../types';
import { simulateFixture } from './season';

export interface InternationalSquad {
  nationId: string;
  nationName: string;
  players: Player[];
  manager: string;
  fifaRanking: number;
}

export interface InternationalFixture {
  id: string;
  homeNationId: string;
  awayNationId: string;
  competition: 'friendly' | 'qualifier' | 'tournament';
  round: number;
  played: boolean;
  homeGoals?: number;
  awayGoals?: number;
}

export interface ContinentalCompetition {
  id: string;
  name: string;
  groupStage: ContinentalGroup[];
  knockout: KnockoutRound[];
  currentPhase: 'group' | 'knockout' | 'complete';
}

export interface ContinentalGroup {
  name: string;
  teamIds: string[];
  standings: Array<{ teamId: string; played: number; points: number; gf: number; ga: number }>;
  fixtures: Array<{ homeId: string; awayId: string; played: boolean; homeGoals?: number; awayGoals?: number }>;
}

export interface KnockoutRound {
  name: string;
  ties: Array<{ homeId: string; awayId: string; aggHome: number; aggAway: number; played: boolean; winnerId?: string }>;
}

const NATIONS = [
  'England', 'Brazil', 'Argentina', 'France', 'Germany', 'Spain', 'Italy', 'Portugal',
  'Netherlands', 'Belgium', 'Croatia', 'Japan', 'Nigeria', 'Senegal', 'Morocco', 'USA',
];

export function generateInternationalSquads(leagueTeams: Team[]): InternationalSquad[] {
  const squads: InternationalSquad[] = [];

  for (let i = 0; i < NATIONS.length; i++) {
    const nation = NATIONS[i];
    const eligiblePlayers: Player[] = [];
    for (const team of leagueTeams) {
      for (const player of team.players) {
        if (player.nationality === nation) eligiblePlayers.push(player);
      }
    }

    if (eligiblePlayers.length < 11) continue;

    squads.push({
      nationId: `nation_${i}`,
      nationName: nation,
      players: eligiblePlayers.sort((a, b) => b.overall - a.overall).slice(0, 23),
      manager: `${nation} FA Appointee`,
      fifaRanking: i + 1,
    });
  }

  return squads;
}

export function createContinentalCompetition(name: string, teamIds: string[]): ContinentalCompetition {
  const groupSize = 4;
  const numGroups = Math.floor(teamIds.length / groupSize);
  const groups: ContinentalGroup[] = [];

  const shuffled = [...teamIds].sort(() => Math.random() - 0.5);

  for (let g = 0; g < numGroups; g++) {
    const groupTeams = shuffled.slice(g * groupSize, (g + 1) * groupSize);
    const fixtures: ContinentalGroup['fixtures'] = [];
    for (let i = 0; i < groupTeams.length; i++) {
      for (let j = i + 1; j < groupTeams.length; j++) {
        fixtures.push({ homeId: groupTeams[i], awayId: groupTeams[j], played: false });
        fixtures.push({ homeId: groupTeams[j], awayId: groupTeams[i], played: false });
      }
    }

    groups.push({
      name: `Group ${String.fromCharCode(65 + g)}`,
      teamIds: groupTeams,
      standings: groupTeams.map((id) => ({ teamId: id, played: 0, points: 0, gf: 0, ga: 0 })),
      fixtures,
    });
  }

  return {
    id: `continental_${Date.now()}`,
    name,
    groupStage: groups,
    knockout: [],
    currentPhase: 'group',
  };
}

export function simulateGroupStage(competition: ContinentalCompetition, teams: Team[]): ContinentalCompetition {
  const updatedGroups = competition.groupStage.map((group) => {
    const updatedFixtures = group.fixtures.map((fixture) => {
      if (fixture.played) return fixture;
      const home = teams.find((t) => t.id === fixture.homeId);
      const away = teams.find((t) => t.id === fixture.awayId);
      if (!home || !away) return { ...fixture, played: true, homeGoals: 0, awayGoals: 0 };

      const result = simulateFixture(
        { id: `cl_${fixture.homeId}_${fixture.awayId}`, round: 0, homeTeamId: fixture.homeId, awayTeamId: fixture.awayId, played: false },
        home, away,
      );

      return { ...fixture, played: true, homeGoals: result.homeGoals, awayGoals: result.awayGoals };
    });

    const standings = group.teamIds.map((teamId) => {
      let played = 0, points = 0, gf = 0, ga = 0;
      for (const f of updatedFixtures) {
        if (f.homeId === teamId) {
          played++; gf += f.homeGoals ?? 0; ga += f.awayGoals ?? 0;
          if ((f.homeGoals ?? 0) > (f.awayGoals ?? 0)) points += 3;
          else if ((f.homeGoals ?? 0) === (f.awayGoals ?? 0)) points += 1;
        } else if (f.awayId === teamId) {
          played++; gf += f.awayGoals ?? 0; ga += f.homeGoals ?? 0;
          if ((f.awayGoals ?? 0) > (f.homeGoals ?? 0)) points += 3;
          else if ((f.awayGoals ?? 0) === (f.homeGoals ?? 0)) points += 1;
        }
      }
      return { teamId, played, points, gf, ga };
    }).sort((a, b) => b.points - a.points || (b.gf - b.ga) - (a.gf - a.ga));

    return { ...group, fixtures: updatedFixtures, standings };
  });

  return { ...competition, groupStage: updatedGroups };
}

export function advanceToKnockout(competition: ContinentalCompetition): ContinentalCompetition {
  const qualifiers: string[] = [];
  for (const group of competition.groupStage) {
    qualifiers.push(group.standings[0].teamId, group.standings[1].teamId);
  }

  const ties: KnockoutRound['ties'] = [];
  for (let i = 0; i < qualifiers.length; i += 2) {
    if (i + 1 < qualifiers.length) {
      ties.push({ homeId: qualifiers[i], awayId: qualifiers[i + 1], aggHome: 0, aggAway: 0, played: false });
    }
  }

  return {
    ...competition,
    currentPhase: 'knockout',
    knockout: [{ name: 'Round of 16', ties }],
  };
}

export function generateInternationalFixtures(squads: InternationalSquad[], type: 'friendly' | 'qualifier'): InternationalFixture[] {
  const fixtures: InternationalFixture[] = [];
  const shuffled = [...squads].sort(() => Math.random() - 0.5);

  for (let i = 0; i < shuffled.length - 1; i += 2) {
    fixtures.push({
      id: `intl_${i}`,
      homeNationId: shuffled[i].nationId,
      awayNationId: shuffled[i + 1].nationId,
      competition: type,
      round: 1,
      played: false,
    });
  }

  return fixtures;
}
