import { League, Team, LeagueStanding } from '../types';
import { generateTeam, generateFixtures } from '../data/generators';

export interface Division {
  id: string;
  name: string;
  tier: number;
  league: League;
}

export interface PyramidConfig {
  divisions: Division[];
  promotionSlots: number;
  relegationSlots: number;
  playoffSlots: number;
}

export function createPyramid(teamsPerDivision: number = 20, tiers: number = 3): PyramidConfig {
  const divisionNames = ['Indie Premier League', 'Indie Championship', 'Indie League One', 'Indie League Two'];
  const divisions: Division[] = [];

  for (let tier = 0; tier < tiers; tier++) {
    const qualityBase = 75 - tier * 12;
    const teams: Team[] = [];
    for (let i = 0; i < teamsPerDivision; i++) {
      teams.push(generateTeam(tier * teamsPerDivision + i, qualityBase + Math.floor(Math.random() * 10) - 5));
    }
    const fixtures = generateFixtures(teams);
    const standings: LeagueStanding[] = teams.map((t) => ({
      teamId: t.id, played: 0, won: 0, drawn: 0, lost: 0,
      goalsFor: 0, goalsAgainst: 0, points: 0,
    }));

    divisions.push({
      id: `div_${tier}`,
      name: divisionNames[tier] ?? `Division ${tier + 1}`,
      tier: tier + 1,
      league: {
        id: `league_${tier}`,
        name: divisionNames[tier] ?? `Division ${tier + 1}`,
        country: 'England',
        teams,
        fixtures,
        standings,
        currentRound: 1,
      },
    });
  }

  return {
    divisions,
    promotionSlots: 2,
    relegationSlots: 2,
    playoffSlots: 4,
  };
}

export function processEndOfSeason(pyramid: PyramidConfig): PyramidConfig {
  const updated = { ...pyramid, divisions: [...pyramid.divisions] };

  for (let i = 0; i < updated.divisions.length - 1; i++) {
    const upper = updated.divisions[i];
    const lower = updated.divisions[i + 1];

    const upperSorted = sortStandings(upper.league.standings);
    const lowerSorted = sortStandings(lower.league.standings);

    const relegatedIds = upperSorted.slice(-pyramid.relegationSlots).map((s) => s.teamId);
    const promotedIds = lowerSorted.slice(0, pyramid.promotionSlots).map((s) => s.teamId);

    const relegatedTeams = upper.league.teams.filter((t) => relegatedIds.includes(t.id));
    const promotedTeams = lower.league.teams.filter((t) => promotedIds.includes(t.id));

    const upperRemaining = upper.league.teams.filter((t) => !relegatedIds.includes(t.id));
    const lowerRemaining = lower.league.teams.filter((t) => !promotedIds.includes(t.id));

    updated.divisions[i] = {
      ...upper,
      league: rebuildLeague(upper.league, [...upperRemaining, ...promotedTeams]),
    };
    updated.divisions[i + 1] = {
      ...lower,
      league: rebuildLeague(lower.league, [...lowerRemaining, ...relegatedTeams]),
    };
  }

  return updated;
}

function rebuildLeague(oldLeague: League, teams: Team[]): League {
  const fixtures = generateFixtures(teams);
  const standings: LeagueStanding[] = teams.map((t) => ({
    teamId: t.id, played: 0, won: 0, drawn: 0, lost: 0,
    goalsFor: 0, goalsAgainst: 0, points: 0,
  }));
  return { ...oldLeague, teams, fixtures, standings, currentRound: 1 };
}

function sortStandings(standings: LeagueStanding[]): LeagueStanding[] {
  return [...standings].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const gdA = a.goalsFor - a.goalsAgainst;
    const gdB = b.goalsFor - b.goalsAgainst;
    return gdB - gdA;
  });
}

export function getPromotionZone(pyramid: PyramidConfig, _tier: number): number[] {
  const slots: number[] = [];
  for (let i = 0; i < pyramid.promotionSlots; i++) slots.push(i);
  return slots;
}

export function getRelegationZone(pyramid: PyramidConfig, teamCount: number): number[] {
  const slots: number[] = [];
  for (let i = teamCount - pyramid.relegationSlots; i < teamCount; i++) slots.push(i);
  return slots;
}

export function getPlayoffZone(pyramid: PyramidConfig): number[] {
  const slots: number[] = [];
  for (let i = pyramid.promotionSlots; i < pyramid.promotionSlots + pyramid.playoffSlots; i++) slots.push(i);
  return slots;
}
