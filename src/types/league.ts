import { Team } from './team';

export interface LeagueStanding {
  teamId: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
}

export interface Fixture {
  id: string;
  round: number;
  homeTeamId: string;
  awayTeamId: string;
  played: boolean;
  homeGoals?: number;
  awayGoals?: number;
}

export interface League {
  id: string;
  name: string;
  country: string;
  teams: Team[];
  fixtures: Fixture[];
  standings: LeagueStanding[];
  currentRound: number;
}
