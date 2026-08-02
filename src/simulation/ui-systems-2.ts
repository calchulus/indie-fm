// UI/UX systems cont — items 51-60
// Theme toggle, speed indicator, formation visual, drag-drop, highlights replay, crowd toggle, commentary feed, player avatar, stadium info, attendance

import { Team } from '../types';

// --- Item 51: Theme toggle ---
export interface ThemeConfig {
  id: 'dark' | 'light';
  name: string;
  colors: {
    background: string;
    surface: string;
    text: string;
    textMuted: string;
    primary: string;
    accent: string;
    border: string;
  };
}

export const THEMES: Record<string, ThemeConfig> = {
  dark: {
    id: 'dark',
    name: 'Dark',
    colors: {
      background: '#1a1a2e',
      surface: '#16213e',
      text: '#e0e0e0',
      textMuted: '#888888',
      primary: '#4ade80',
      accent: '#60a5fa',
      border: 'rgba(255,255,255,0.1)',
    },
  },
  light: {
    id: 'light',
    name: 'Light',
    colors: {
      background: '#f5f5f5',
      surface: '#ffffff',
      text: '#1a1a1a',
      textMuted: '#666666',
      primary: '#16a34a',
      accent: '#2563eb',
      border: 'rgba(0,0,0,0.1)',
    },
  },
};

export function applyTheme(themeId: string): void {
  const theme = THEMES[themeId] ?? THEMES.dark;
  const root = document.documentElement;
  root.style.setProperty('--bg', theme.colors.background);
  root.style.setProperty('--surface', theme.colors.surface);
  root.style.setProperty('--text', theme.colors.text);
  root.style.setProperty('--text-muted', theme.colors.textMuted);
  root.style.setProperty('--primary', theme.colors.primary);
  root.style.setProperty('--accent', theme.colors.accent);
  root.style.setProperty('--border', theme.colors.border);
  document.body.style.background = theme.colors.background;
  document.body.style.color = theme.colors.text;
}

// --- Item 52: Speed indicator ---
export function getSpeedLabel(speed: number): string {
  return `${speed}x`;
}

// --- Item 53: Formation visual ---
export interface FormationVisualSlot {
  position: string;
  x: number; // 0-100
  y: number; // 0-100
  playerId?: string;
  playerName?: string;
}

export function getFormationVisual(formation: string): FormationVisualSlot[] {
  const formations: Record<string, Array<{ position: string; x: number; y: number }>> = {
    '4-4-2': [
      { position: 'GK', x: 50, y: 90 },
      { position: 'LB', x: 15, y: 70 }, { position: 'CB', x: 38, y: 75 }, { position: 'CB', x: 62, y: 75 }, { position: 'RB', x: 85, y: 70 },
      { position: 'LW', x: 15, y: 45 }, { position: 'CM', x: 38, y: 50 }, { position: 'CM', x: 62, y: 50 }, { position: 'RW', x: 85, y: 45 },
      { position: 'ST', x: 38, y: 20 }, { position: 'ST', x: 62, y: 20 },
    ],
    '4-3-3': [
      { position: 'GK', x: 50, y: 90 },
      { position: 'LB', x: 15, y: 70 }, { position: 'CB', x: 38, y: 75 }, { position: 'CB', x: 62, y: 75 }, { position: 'RB', x: 85, y: 70 },
      { position: 'CM', x: 30, y: 50 }, { position: 'CM', x: 50, y: 45 }, { position: 'CM', x: 70, y: 50 },
      { position: 'LW', x: 20, y: 20 }, { position: 'ST', x: 50, y: 15 }, { position: 'RW', x: 80, y: 20 },
    ],
    '3-5-2': [
      { position: 'GK', x: 50, y: 90 },
      { position: 'CB', x: 30, y: 75 }, { position: 'CB', x: 50, y: 78 }, { position: 'CB', x: 70, y: 75 },
      { position: 'LB', x: 10, y: 50 }, { position: 'CM', x: 35, y: 50 }, { position: 'CDM', x: 50, y: 55 }, { position: 'CM', x: 65, y: 50 }, { position: 'RB', x: 90, y: 50 },
      { position: 'ST', x: 38, y: 20 }, { position: 'ST', x: 62, y: 20 },
    ],
  };

  return formations[formation] ?? formations['4-4-2'];
}

// --- Item 54: Drag-drop formation ---
export function movePlayerInFormation(slots: FormationVisualSlot[], fromIndex: number, toIndex: number): FormationVisualSlot[] {
  const newSlots = [...slots];
  const temp = newSlots[fromIndex];
  newSlots[fromIndex] = newSlots[toIndex];
  newSlots[toIndex] = temp;
  return newSlots;
}

// --- Item 55: Highlights replay ---
export interface HighlightClip {
  minute: number;
  type: string;
  description: string;
  teamId: string;
  playerId?: string;
}

export function extractHighlights(events: Array<{ minute: number; type: string; description: string; teamId: string; playerId?: string }>): HighlightClip[] {
  return events
    .filter((e) => ['goal', 'save', 'red_card', 'corner'].includes(e.type))
    .map((e) => ({
      minute: e.minute,
      type: e.type,
      description: e.description,
      teamId: e.teamId,
      playerId: e.playerId,
    }));
}

// --- Item 56: Crowd toggle ---
export function getCrowdIntensity(minute: number, scoreDiff: number, isDerby: boolean): number {
  let intensity = 0.3;
  if (minute > 75) intensity += 0.3;
  else if (minute > 60) intensity += 0.15;
  if (Math.abs(scoreDiff) <= 1) intensity += 0.2;
  if (isDerby) intensity += 0.15;
  return Math.min(1, intensity);
}

// --- Item 57: Commentary feed ---
export interface CommentaryEntry {
  minute: number;
  text: string;
  type: string;
  teamId?: string;
}

export function generateCommentary(events: Array<{ minute: number; type: string; description: string; teamId: string }>): CommentaryEntry[] {
  return events.map((e) => ({
    minute: e.minute,
    text: e.description,
    type: e.type,
    teamId: e.teamId,
  }));
}

// --- Item 58: Player avatar ---
export function getPlayerAvatarColor(position: string): string {
  const colors: Record<string, string> = {
    GK: '#f4c542',
    CB: '#4a90d9', LB: '#4a90d9', RB: '#4a90d9',
    CDM: '#3aa655', CM: '#3aa655', CAM: '#3aa655',
    LW: '#e05a5a', RW: '#e05a5a', ST: '#e05a5a',
  };
  return colors[position] ?? '#888888';
}

// --- Item 59: Stadium info ---
export function getStadiumInfo(team: Team): { name: string; capacity: number; attendance: number; fillRate: number } {
  const attendance = Math.round(team.capacity * (0.7 + Math.random() * 0.25));
  return {
    name: team.stadium,
    capacity: team.capacity,
    attendance,
    fillRate: Math.round((attendance / team.capacity) * 100),
  };
}

// --- Item 60: Attendance calculation ---
export function calculateAttendance(team: Team, opponentStrength: number, isDerby: boolean, teamForm: number): number {
  const baseRate = 0.65 + (team.reputation / 100) * 0.2;
  const formBonus = (teamForm - 5) * 0.02;
  const derbyBonus = isDerby ? 0.1 : 0;
  const opponentBonus = (opponentStrength / 100) * 0.05;
  const fillRate = Math.min(1, baseRate + formBonus + derbyBonus + opponentBonus);
  return Math.round(team.capacity * fillRate);
}
