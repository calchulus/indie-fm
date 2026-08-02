import { Team, Player, Position, DEFAULT_TACTICS } from '../types';
import { generatePlayer } from '../data/generators';

export interface StadiumConfig {
  name: string;
  capacity: number;
  expansionCost: number;
  expansionAmount: number;
  canExpand: boolean;
}

export interface FacilityState {
  training: number;
  youth: number;
  stadium: number;
  medical: number;
  scouting: number;
}

export interface ChallengeMode {
  id: string;
  name: string;
  description: string;
  constraints: ChallengeConstraint[];
  target: string;
  completed: boolean;
}

export interface ChallengeConstraint {
  type: 'budget' | 'squad_size' | 'no_signings' | 'youth_only' | 'relegation_battle' | 'unbeaten';
  value?: number;
  description: string;
}

export interface UITheme {
  id: string;
  name: string;
  colors: {
    background: string;
    surface: string;
    primary: string;
    secondary: string;
    text: string;
    textMuted: string;
    accent: string;
    success: string;
    danger: string;
  };
}

export function getStadiumUpgradeCost(currentCapacity: number): number {
  return Math.round(currentCapacity * 800);
}

export function expandStadium(team: Team, amount: number): Team {
  const cost = getStadiumUpgradeCost(team.capacity);
  if (team.budget < cost) return team;
  return {
    ...team,
    capacity: team.capacity + amount,
    budget: team.budget - cost,
  };
}

export function getFacilityUpgradeCost(level: number): number {
  return level * 5_000_000;
}

export function upgradeFacility(facilities: FacilityState, facility: keyof FacilityState, budget: number): { facilities: FacilityState; cost: number } | null {
  const current = facilities[facility];
  if (current >= 5) return null;
  const cost = getFacilityUpgradeCost(current);
  if (budget < cost) return null;
  return {
    facilities: { ...facilities, [facility]: current + 1 },
    cost,
  };
}

export function createClub(name: string, city: string, stadiumName: string, capacity: number, budget: number, colors: { primary: string; secondary: string }): Team {
  const players: Player[] = [];
  const positions: Position[] = ['GK', 'LB', 'CB', 'CB', 'RB', 'LW', 'CM', 'CM', 'RW', 'ST', 'ST', 'GK', 'CB', 'CM', 'ST', 'LW'];
  const quality = Math.round(40 + (budget / 10_000_000) * 3);

  for (const pos of positions) {
    players.push(generatePlayer(pos, quality + Math.floor(Math.random() * 10) - 5));
  }

  return {
    id: `club_${Date.now()}`,
    name,
    shortName: name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 3),
    city,
    stadium: stadiumName,
    capacity,
    budget,
    reputation: 30,
    players,
    tactics: { ...DEFAULT_TACTICS },
    colors,
  };
}

export const CHALLENGE_MODES: ChallengeMode[] = [
  {
    id: 'challenge_rags',
    name: 'Rags to Riches',
    description: 'Take the weakest team in the league to the title within 5 seasons.',
    constraints: [{ type: 'budget', value: 5_000_000, description: 'Max £5M transfer budget' }],
    target: 'Win the league',
    completed: false,
  },
  {
    id: 'challenge_youth',
    name: 'Youth Academy',
    description: 'Build a squad using only players aged 21 or under.',
    constraints: [{ type: 'youth_only', description: 'Only sign players aged 21 or under' }],
    target: 'Finish in the top half',
    completed: false,
  },
  {
    id: 'challenge_no_signings',
    name: 'No Signings',
    description: 'Survive a full season without signing any players.',
    constraints: [{ type: 'no_signings', description: 'No transfers allowed' }],
    target: 'Avoid relegation',
    completed: false,
  },
  {
    id: 'challenge_unbeaten',
    name: 'The Invincibles',
    description: 'Go an entire league season unbeaten.',
    constraints: [{ type: 'unbeaten', description: 'Must not lose a league match' }],
    target: 'Complete season unbeaten',
    completed: false,
  },
  {
    id: 'challenge_small_squad',
    name: 'Small Squad',
    description: 'Manage with a maximum of 16 players in your squad.',
    constraints: [{ type: 'squad_size', value: 16, description: 'Max 16 players in squad' }],
    target: 'Finish in the top 6',
    completed: false,
  },
];

export const UI_THEMES: UITheme[] = [
  {
    id: 'dark',
    name: 'Dark (Default)',
    colors: { background: '#1a1a2e', surface: '#16213e', primary: '#4ade80', secondary: '#60a5fa', text: '#e0e0e0', textMuted: '#888888', accent: '#fbbf24', success: '#4ade80', danger: '#f87171' },
  },
  {
    id: 'light',
    name: 'Light',
    colors: { background: '#f5f5f5', surface: '#ffffff', primary: '#16a34a', secondary: '#2563eb', text: '#1a1a1a', textMuted: '#666666', accent: '#d97706', success: '#16a34a', danger: '#dc2626' },
  },
  {
    id: 'midnight',
    name: 'Midnight Blue',
    colors: { background: '#0f172a', surface: '#1e293b', primary: '#38bdf8', secondary: '#a78bfa', text: '#e2e8f0', textMuted: '#94a3b8', accent: '#fbbf24', success: '#34d399', danger: '#fb7185' },
  },
  {
    id: 'forest',
    name: 'Forest Green',
    colors: { background: '#1a2e1a', surface: '#2d3e2d', primary: '#86efac', secondary: '#fde047', text: '#e0e0e0', textMuted: '#8fbc8f', accent: '#fbbf24', success: '#4ade80', danger: '#f87171' },
  },
];

export function getTheme(id: string): UITheme {
  return UI_THEMES.find((t) => t.id === id) ?? UI_THEMES[0];
}
