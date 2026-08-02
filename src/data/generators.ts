import {
  Player, PlayerAttributes, HiddenAttributes, Position, PlayerRole, Duty,
  Personality, Footedness, computeOverall, getRolesForPosition,
  Team, Tactics, DEFAULT_TACTICS,
  League, Fixture, LeagueStanding,
} from '../types';
import {
  FIRST_NAMES, LAST_NAMES, NATIONALITIES, TEAM_NAMES, CITIES, STADIUMS, TEAM_COLORS,
} from './names';

let idCounter = 0;
function nextId(prefix: string): string {
  return `${prefix}_${++idCounter}`;
}

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const PERSONALITIES: Personality[] = ['model_citizen', 'professional', 'resolute', 'spirited', 'balanced', 'casual', 'unambitious', 'volatile'];
const FOOTEDNESS: Footedness[] = ['right', 'right', 'right', 'left', 'left', 'both'];

const TRAITS = [
  'Likes to try long range shots', 'Plays one-twos', 'Comes deep to get ball',
  'Hugs the line', 'Cuts inside', 'Plays through balls', 'Shoots from distance',
  'Dives into tackles', 'Marks opponent tightly', 'Tries to beat offside trap',
  'Runs with ball often', 'Stays back at set pieces', 'Argues with officials',
  'Leaders on the pitch', 'Plays short corners', 'Likes to switch ball',
  'Knocks ball past opponent', 'Tries to play way out of trouble', 'Possesses long flat throw',
  'Curls ball', 'Likes to lob keeper', 'Plays with back to goal', 'Gets into opposition area',
  'Likes to round keeper', 'Tries first time shots', 'Comes short to link play',
  'Winds up opponents', 'Tries overhead kicks', 'Tracks back defensively',
  'Pushes forward at every opportunity', 'Sits on shoulder of last defender',
  'Drops deep to collect ball from defence', 'Likes to try skills and tricks',
  'Tends to hold up the ball', 'Makes late runs into the box', 'Plays the final ball',
  'Likes to close down opponents', 'Retains possession rather than risk pass',
  'Tries to play the ball out from the back', 'Likes to switch play to other flank',
];

const FORMATION_LAYOUT: Record<string, Position[]> = {
  '4-4-2': ['GK', 'LB', 'CB', 'CB', 'RB', 'LW', 'CM', 'CM', 'RW', 'ST', 'ST'],
  '4-3-3': ['GK', 'LB', 'CB', 'CB', 'RB', 'CM', 'CM', 'CAM', 'LW', 'RW', 'ST'],
  '3-5-2': ['GK', 'CB', 'CB', 'CB', 'LB', 'CM', 'CDM', 'CM', 'RB', 'ST', 'ST'],
  '4-2-3-1': ['GK', 'LB', 'CB', 'CB', 'RB', 'CDM', 'CDM', 'LW', 'CAM', 'RW', 'ST'],
  '5-3-2': ['GK', 'LB', 'CB', 'CB', 'CB', 'RB', 'CM', 'CM', 'CAM', 'ST', 'ST'],
  '4-1-4-1': ['GK', 'LB', 'CB', 'CB', 'RB', 'CDM', 'LW', 'CM', 'CM', 'RW', 'ST'],
  '3-4-3': ['GK', 'CB', 'CB', 'CB', 'LB', 'CM', 'CM', 'RB', 'LW', 'ST', 'RW'],
  '4-4-1-1': ['GK', 'LB', 'CB', 'CB', 'RB', 'LW', 'CM', 'CM', 'RW', 'CAM', 'ST'],
  '4-5-1': ['GK', 'LB', 'CB', 'CB', 'RB', 'LW', 'CM', 'CDM', 'CM', 'RW', 'ST'],
  '5-4-1': ['GK', 'LB', 'CB', 'CB', 'CB', 'RB', 'LW', 'CM', 'CM', 'RW', 'ST'],
};

function generateAttributes(position: Position, quality: number): PlayerAttributes {
  const base = (mod = 0) => Math.max(1, Math.min(20, Math.round((quality + mod + rand(-4, 4)) / 5)));

  const attrs: PlayerAttributes = {
    crossing: base(), dribbling: base(), finishing: base(), firstTouch: base(),
    freeKickTaking: base(), heading: base(), longShots: base(), longThrows: base(-3),
    marking: base(), passing: base(), penaltyTaking: base(), tackling: base(), technique: base(),
    aggression: base(), anticipation: base(), bravery: base(), composure: base(),
    concentration: base(), decisions: base(), determination: base(), flair: base(),
    leadership: base(-2), offTheBall: base(), positioning: base(), teamwork: base(),
    vision: base(), workRate: base(),
    acceleration: base(), agility: base(), balance: base(), jumpingReach: base(),
    naturalFitness: base(), pace: base(), stamina: base(), strength: base(),
    aerialReach: base(-5), commandOfArea: base(-5), communication: base(-5),
    eccentricity: base(-8), handling: base(-5), kicking: base(-5),
    oneOnOnes: base(-5), reflexes: base(-5), rushingOut: base(-5), throwing: base(-5),
  };

  if (position === 'GK') {
    attrs.handling = base(8); attrs.reflexes = base(8); attrs.oneOnOnes = base(6);
    attrs.aerialReach = base(6); attrs.commandOfArea = base(5); attrs.rushingOut = base(4);
    attrs.communication = base(5); attrs.kicking = base(3); attrs.throwing = base(3);
    attrs.finishing = base(-10); attrs.dribbling = base(-8); attrs.crossing = base(-8);
  } else if (position === 'CB') {
    attrs.marking = base(6); attrs.tackling = base(6); attrs.heading = base(5);
    attrs.positioning = base(5); attrs.strength = base(4); attrs.jumpingReach = base(4);
    attrs.finishing = base(-6); attrs.dribbling = base(-4);
  } else if (position === 'LB' || position === 'RB') {
    attrs.stamina = base(4); attrs.pace = base(3); attrs.crossing = base(4);
    attrs.tackling = base(3); attrs.workRate = base(3);
  } else if (position === 'CDM') {
    attrs.tackling = base(5); attrs.positioning = base(5); attrs.passing = base(3);
    attrs.workRate = base(3); attrs.marking = base(3);
  } else if (position === 'CM') {
    attrs.passing = base(4); attrs.stamina = base(3); attrs.vision = base(3);
    attrs.workRate = base(3); attrs.firstTouch = base(3);
  } else if (position === 'CAM') {
    attrs.passing = base(4); attrs.vision = base(5); attrs.technique = base(4);
    attrs.flair = base(3); attrs.finishing = base(2);
  } else if (position === 'LW' || position === 'RW') {
    attrs.pace = base(5); attrs.dribbling = base(5); attrs.acceleration = base(4);
    attrs.crossing = base(3); attrs.flair = base(3);
  } else if (position === 'ST') {
    attrs.finishing = base(6); attrs.offTheBall = base(5); attrs.composure = base(4);
    attrs.acceleration = base(3); attrs.firstTouch = base(3);
  }

  return attrs;
}

function generateHidden(): HiddenAttributes {
  return {
    consistency: rand(5, 18), bigGames: rand(5, 18), versatility: rand(3, 16),
    adaptability: rand(5, 17), ambition: rand(5, 18), loyalty: rand(5, 18),
    pressure: rand(5, 18), professionalism: rand(5, 18), sportsmanship: rand(5, 18),
    temperament: rand(5, 18), injuryProneness: rand(2, 15),
  };
}

function pickRole(position: Position): { role: PlayerRole; duty: Duty } {
  const roles = getRolesForPosition(position);
  if (roles.length === 0) return { role: 'central_midfielder', duty: 'support' };
  const chosen = pick(roles);
  const duty = pick(chosen.duties);
  return { role: chosen.role, duty };
}

export function generatePlayer(position: Position, quality: number): Player {
  const attributes = generateAttributes(position, quality);
  const overall = computeOverall(attributes, position);
  const age = rand(18, 35);
  const { role, duty } = pickRole(position);
  const pa = Math.min(200, overall * 2 + rand(10, 50));
  const ca = Math.round(overall * 2 * (age < 24 ? 0.7 + Math.random() * 0.2 : 0.9 + Math.random() * 0.1));

  const traitCount = rand(0, 3);
  const traits: string[] = [];
  for (let i = 0; i < traitCount; i++) {
    const t = pick(TRAITS);
    if (!traits.includes(t)) traits.push(t);
  }

  return {
    id: nextId('player'),
    name: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
    age,
    nationality: pick(NATIONALITIES),
    secondNationality: Math.random() < 0.2 ? pick(NATIONALITIES) : undefined,
    position,
    role,
    duty,
    attributes,
    hidden: generateHidden(),
    personality: pick(PERSONALITIES),
    footedness: pick(FOOTEDNESS),
    height: rand(168, 196),
    weight: rand(65, 90),
    overall,
    potentialAbility: pa,
    currentAbility: ca,
    value: Math.round(overall * overall * rand(800, 1500)),
    wage: Math.round(overall * rand(200, 600)),
    contractExpiry: 2026 + rand(1, 4),
    form: rand(4, 8),
    fitness: rand(85, 100),
    morale: rand(5, 9),
    reputation: rand(20, 90),
    goals: 0,
    assists: 0,
    appearances: 0,
    yellowCards: 0,
    redCards: 0,
    traits,
  };
}

export function generateSquad(quality: number, formation: string = '4-4-2'): Player[] {
  const layout = FORMATION_LAYOUT[formation] ?? FORMATION_LAYOUT['4-4-2'];
  const squad: Player[] = layout.map((pos) => generatePlayer(pos, quality));
  const benchPositions: Position[] = ['GK', 'CB', 'CM', 'ST', 'LW'];
  for (const pos of benchPositions) {
    squad.push(generatePlayer(pos, quality - rand(3, 8)));
  }
  return squad;
}

export function generateTeam(index: number, quality: number): Team {
  const formation = pick(Object.keys(FORMATION_LAYOUT)) as Tactics['formation'];
  const tactics: Tactics = {
    ...DEFAULT_TACTICS,
    formation,
    mentality: pick(['defensive', 'balanced', 'attacking'] as const),
    pressing: pick(['low', 'medium', 'high'] as const),
    tempo: pick(['slow', 'normal', 'fast'] as const),
    width: pick(['narrow', 'normal', 'wide'] as const),
    defensiveLine: rand(30, 70),
  };

  return {
    id: nextId('team'),
    name: TEAM_NAMES[index % TEAM_NAMES.length],
    shortName: TEAM_NAMES[index % TEAM_NAMES.length].split(' ')[0].slice(0, 3).toUpperCase(),
    city: CITIES[index % CITIES.length],
    stadium: STADIUMS[index % STADIUMS.length],
    capacity: rand(15000, 65000),
    budget: rand(5_000_000, 80_000_000),
    reputation: rand(40, 90),
    players: generateSquad(quality, formation),
    tactics,
    colors: TEAM_COLORS[index % TEAM_COLORS.length],
  };
}

export function generateFixtures(teams: Team[]): Fixture[] {
  const fixtures: Fixture[] = [];
  const n = teams.length;
  const teamIds = teams.map((t) => t.id);
  const schedule: Array<[string, string]> = [];

  for (let round = 0; round < n - 1; round++) {
    for (let i = 0; i < n / 2; i++) {
      const home = (round + i) % (n - 1);
      const away = (n - 1 - i + round) % (n - 1);
      const homeIdx = i === 0 ? n - 1 : home;
      schedule.push([teamIds[homeIdx], teamIds[away]]);
    }
  }

  const firstHalf = schedule.map(([h, a], i) => ({
    id: nextId('fix'),
    round: Math.floor(i / (n / 2)) + 1,
    homeTeamId: h,
    awayTeamId: a,
    played: false,
  }));

  const secondHalf = firstHalf.map((f, i) => ({
    id: nextId('fix'),
    round: Math.floor(i / (n / 2)) + n,
    homeTeamId: f.awayTeamId,
    awayTeamId: f.homeTeamId,
    played: false,
  }));

  fixtures.push(...firstHalf, ...secondHalf);
  return fixtures;
}

export function generateLeague(teamCount: number = 20): League {
  const teams: Team[] = [];
  for (let i = 0; i < teamCount; i++) {
    teams.push(generateTeam(i, rand(50, 78)));
  }
  const fixtures = generateFixtures(teams);
  const standings: LeagueStanding[] = teams.map((t) => ({
    teamId: t.id, played: 0, won: 0, drawn: 0, lost: 0,
    goalsFor: 0, goalsAgainst: 0, points: 0,
  }));

  return {
    id: nextId('league'),
    name: 'Indie Premier League',
    country: 'England',
    teams,
    fixtures,
    standings,
    currentRound: 1,
  };
}
