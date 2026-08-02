import { Team } from '../types';
import { generateWeather, WeatherState } from './advanced';

export interface MatchPreview {
  weather: WeatherState;
  referee: RefereeInfo;
  homeTeamNews: TeamNews;
  awayTeamNews: TeamNews;
  headToHead: HeadToHeadRecord;
}

export interface RefereeInfo {
  name: string;
  nationality: string;
  strictness: number;
  avgCardsPerMatch: number;
  avgFoulsPerMatch: number;
}

export interface TeamNews {
  teamId: string;
  injuries: string[];
  suspensions: string[];
  formLast5: string[];
  predictedXI: string[];
  keyPlayerId?: string;
  keyPlayerName?: string;
}

export interface HeadToHeadRecord {
  meetings: number;
  homeWins: number;
  draws: number;
  awayWins: number;
  lastResult?: string;
}

const REFEREE_NAMES = [
  'Michael Oliver', 'Anthony Taylor', 'Martin Atkinson', 'Craig Pawson',
  'Andre Marriner', 'Stuart Attwell', 'David Coote', 'Paul Tierney',
  'Simon Hooper', 'John Brooks', 'Darren England', 'Robert Jones',
];

const REFEREE_NATIONALITIES = ['England', 'England', 'England', 'England', 'Scotland', 'Wales'];

export function generateMatchPreview(home: Team, away: Team): MatchPreview {
  const weather = generateWeather();
  const referee = generateReferee();
  const homeTeamNews = generateTeamNews(home);
  const awayTeamNews = generateTeamNews(away);
  const headToHead = generateHeadToHead();

  return { weather, referee, homeTeamNews, awayTeamNews, headToHead };
}

function generateReferee(): RefereeInfo {
  const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
  const strictness = rand(3, 9);
  return {
    name: REFEREE_NAMES[Math.floor(Math.random() * REFEREE_NAMES.length)],
    nationality: REFEREE_NATIONALITIES[Math.floor(Math.random() * REFEREE_NATIONALITIES.length)],
    strictness,
    avgCardsPerMatch: Math.round((strictness * 0.5 + Math.random() * 2) * 10) / 10,
    avgFoulsPerMatch: rand(18, 30),
  };
}

function generateTeamNews(team: Team): TeamNews {
  const starters = team.players.slice(0, 11);
  const injured = starters.filter((p) => p.fitness < 60).map((p) => p.name);
  const suspended = starters.filter((p) => p.redCards > 0).map((p) => p.name);
  const keyPlayer = [...starters].sort((a, b) => b.overall - a.overall)[0];

  return {
    teamId: team.id,
    injuries: injured.slice(0, 3),
    suspensions: suspended.slice(0, 2),
    formLast5: [],
    predictedXI: starters.map((p) => p.name),
    keyPlayerId: keyPlayer?.id,
    keyPlayerName: keyPlayer?.name,
  };
}

function generateHeadToHead(): HeadToHeadRecord {
  const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
  const meetings = rand(5, 30);
  const homeWins = rand(1, Math.floor(meetings * 0.5));
  const awayWins = rand(1, Math.floor(meetings * 0.4));
  const draws = meetings - homeWins - awayWins;

  return {
    meetings,
    homeWins,
    draws: Math.max(0, draws),
    awayWins,
    lastResult: Math.random() > 0.5 ? 'Home win' : Math.random() > 0.5 ? 'Draw' : 'Away win',
  };
}

export function getWeatherDescription(weather: WeatherState): string {
  const temp = `${weather.temperature}°C`;
  switch (weather.condition) {
    case 'clear': return `☀️ Clear skies, ${temp}`;
    case 'cloudy': return `⛅ Overcast, ${temp}`;
    case 'rain': return `🌧️ Light rain, ${temp}`;
    case 'heavy_rain': return `⛈️ Heavy rain, ${temp}`;
    case 'snow': return `🌨️ Snow, ${temp}`;
    case 'wind': return `💨 Strong winds (${Math.round(weather.windSpeed)}km/h), ${temp}`;
  }
}
