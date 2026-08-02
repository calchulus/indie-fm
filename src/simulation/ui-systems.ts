// UI/UX systems — items 41-50
// Crests everywhere, match preview, press conference, inbox notifications, tooltips, keyboard shortcuts, settings, responsive, loading states, error recovery

import { Team, Player } from '../types';

// --- Item 41: Club crests everywhere ---
export function getCrestColors(team: Team): { primary: string; secondary: string } {
  return team.colors;
}

// --- Item 42: Match preview ---
export interface MatchPreview {
  homeTeam: Team;
  awayTeam: Team;
  homeForm: string[];
  awayForm: string[];
  homeStrength: number;
  awayStrength: number;
  headToHead: { homeWins: number; draws: number; awayWins: number };
  keyPlayers: { home: Player[]; away: Player[] };
  prediction: { homeWin: number; draw: number; awayWin: number };
}

export function generateMatchPreview(homeTeam: Team, awayTeam: Team): MatchPreview {
  const homeStrength = homeTeam.players.slice(0, 11).reduce((s, p) => s + p.overall, 0) / 11;
  const awayStrength = awayTeam.players.slice(0, 11).reduce((s, p) => s + p.overall, 0) / 11;

  const total = homeStrength + awayStrength;
  const homeWin = Math.round((homeStrength / total) * 60 + 10); // Home advantage
  const awayWin = Math.round((awayStrength / total) * 60 + 5);
  const draw = Math.max(5, 100 - homeWin - awayWin);

  const homeKey = [...homeTeam.players].sort((a, b) => b.overall - a.overall).slice(0, 3);
  const awayKey = [...awayTeam.players].sort((a, b) => b.overall - a.overall).slice(0, 3);

  return {
    homeTeam,
    awayTeam,
    homeForm: homeTeam.players.slice(0, 5).map((p) => (p.form >= 7 ? 'W' : p.form >= 5 ? 'D' : 'L')),
    awayForm: awayTeam.players.slice(0, 5).map((p) => (p.form >= 7 ? 'W' : p.form >= 5 ? 'D' : 'L')),
    homeStrength: Math.round(homeStrength),
    awayStrength: Math.round(awayStrength),
    headToHead: { homeWins: 0, draws: 0, awayWins: 0 }, // Would need historical data
    keyPlayers: { home: homeKey, away: awayKey },
    prediction: { homeWin, draw, awayWin },
  };
}

// --- Item 43: Press conference ---
export interface PressQuestion {
  id: string;
  question: string;
  options: Array<{ id: string; text: string; tone: 'positive' | 'neutral' | 'negative' }>;
}

export function generatePressQuestions(context: 'pre_match' | 'post_match', result?: { homeScore: number; awayScore: number }): PressQuestion[] {
  if (context === 'pre_match') {
    return [
      {
        id: 'q1',
        question: 'How do you feel about the upcoming match?',
        options: [
          { id: 'a', text: 'We\'re confident and well-prepared.', tone: 'positive' },
          { id: 'b', text: 'It\'ll be a tough game, but we\'re ready.', tone: 'neutral' },
          { id: 'c', text: 'We\'re underdogs, but we\'ll fight.', tone: 'negative' },
        ],
      },
      {
        id: 'q2',
        question: 'Any injury concerns?',
        options: [
          { id: 'a', text: 'Everyone is fit and available.', tone: 'positive' },
          { id: 'b', text: 'A few doubts, but we\'ll manage.', tone: 'neutral' },
          { id: 'c', text: 'We have some concerns, but the squad is deep.', tone: 'negative' },
        ],
      },
    ];
  }

  const won = (result?.homeScore ?? 0) > (result?.awayScore ?? 0);
  return [
    {
      id: 'q1',
      question: won ? 'How do you feel about the win?' : 'What went wrong today?',
      options: [
        { id: 'a', text: won ? 'Delighted with the performance.' : 'Disappointing, but we\'ll bounce back.', tone: won ? 'positive' : 'negative' },
        { id: 'b', text: 'A fair result overall.', tone: 'neutral' },
        { id: 'c', text: won ? 'Could have scored more.' : 'Unacceptable performance.', tone: won ? 'neutral' : 'negative' },
      ],
    },
  ];
}

// --- Item 44: Inbox notifications ---
export interface InboxMessage {
  id: string;
  type: 'board' | 'transfer' | 'injury' | 'media' | 'scout' | 'youth' | 'contract';
  title: string;
  body: string;
  round: number;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
}

export function createInboxMessage(type: InboxMessage['type'], title: string, body: string, round: number, priority: InboxMessage['priority'] = 'medium'): InboxMessage {
  return {
    id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    type,
    title,
    body,
    round,
    read: false,
    priority,
  };
}

// --- Item 45: Tutorial tooltips ---
export interface Tooltip {
  id: string;
  target: string; // CSS selector or component id
  text: string;
  shown: boolean;
}

export function getTutorialTooltips(): Tooltip[] {
  return [
    { id: 'tt_match', target: 'match-tab', text: 'Watch your matches live with real-time simulation.', shown: false },
    { id: 'tt_tactics', target: 'tactics-tab', text: 'Set your formation and team instructions here.', shown: false },
    { id: 'tt_squad', target: 'squad-tab', text: 'View and manage your squad, check fitness and form.', shown: false },
    { id: 'tt_transfers', target: 'transfers-tab', text: 'Buy and sell players in the transfer market.', shown: false },
    { id: 'tt_table', target: 'table-tab', text: 'Check the league standings and your position.', shown: false },
  ];
}

// --- Item 46: Keyboard shortcuts ---
export const KEYBOARD_SHORTCUTS: Record<string, string> = {
  ' ': 'Play/Pause match',
  '1': 'Speed 1x',
  '2': 'Speed 2x',
  '3': 'Speed 4x',
  '4': 'Speed 8x',
  'm': 'Toggle Match tab',
  't': 'Toggle Tactics tab',
  's': 'Toggle Squad tab',
};

// --- Item 47: Settings ---
export interface GameSettings {
  soundEnabled: boolean;
  crowdNoise: boolean;
  theme: 'dark' | 'light';
  simSpeed: number;
  showFatigueBars: boolean;
  showCommentary: boolean;
  autoSave: boolean;
}

export function getDefaultSettings(): GameSettings {
  return {
    soundEnabled: true,
    crowdNoise: true,
    theme: 'dark',
    simSpeed: 1,
    showFatigueBars: true,
    showCommentary: true,
    autoSave: true,
  };
}

// --- Item 48: Responsive layout ---
export function getResponsiveBreakpoint(width: number): 'mobile' | 'tablet' | 'desktop' {
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

// --- Item 49: Loading states ---
export interface LoadingState {
  isLoading: boolean;
  progress: number; // 0-100
  message: string;
}

export function createLoadingState(message: string): LoadingState {
  return { isLoading: true, progress: 0, message };
}

// --- Item 50: Error recovery ---
export interface ErrorState {
  hasError: boolean;
  message: string;
  canRetry: boolean;
}

export function createErrorState(message: string, canRetry: boolean = true): ErrorState {
  return { hasError: true, message, canRetry };
}
