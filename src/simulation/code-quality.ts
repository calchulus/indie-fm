// Code quality — items 91-100
// State persistence, undo/redo, speed persistence, error handling, input validation, virtualization, ARIA, keyboard nav, i18n, analytics

// --- Item 91: State persistence ---
export interface PersistedState {
  version: number;
  savedAt: number;
  data: unknown;
}

export function serializeState(data: unknown): string {
  const persisted: PersistedState = {
    version: 1,
    savedAt: Date.now(),
    data,
  };
  return JSON.stringify(persisted);
}

export function deserializeState<T>(json: string): T | null {
  try {
    const persisted: PersistedState = JSON.parse(json);
    if (persisted.version !== 1) return null;
    return persisted.data as T;
  } catch {
    return null;
  }
}

export function saveToLocalStorage(key: string, data: unknown): void {
  try {
    localStorage.setItem(key, serializeState(data));
  } catch {
    // Storage full or unavailable
  }
}

export function loadFromLocalStorage<T>(key: string): T | null {
  try {
    const json = localStorage.getItem(key);
    if (!json) return null;
    return deserializeState<T>(json);
  } catch {
    return null;
  }
}

// --- Item 92: Undo/redo ---
export interface HistoryStack<T> {
  past: T[];
  present: T;
  future: T[];
}

export function createHistory<T>(initial: T): HistoryStack<T> {
  return { past: [], present: initial, future: [] };
}

export function pushHistory<T>(history: HistoryStack<T>, newState: T): HistoryStack<T> {
  return {
    past: [...history.past, history.present].slice(-50), // Keep last 50 states
    present: newState,
    future: [],
  };
}

export function undo<T>(history: HistoryStack<T>): HistoryStack<T> {
  if (history.past.length === 0) return history;
  const previous = history.past[history.past.length - 1];
  return {
    past: history.past.slice(0, -1),
    present: previous,
    future: [history.present, ...history.future],
  };
}

export function redo<T>(history: HistoryStack<T>): HistoryStack<T> {
  if (history.future.length === 0) return history;
  const next = history.future[0];
  return {
    past: [...history.past, history.present],
    present: next,
    future: history.future.slice(1),
  };
}

// --- Item 93: Speed persistence ---
export function saveSpeedPreference(speed: number): void {
  try {
    localStorage.setItem('indie-fm-speed', String(speed));
  } catch {
    // Ignore
  }
}

export function loadSpeedPreference(): number {
  try {
    const speed = localStorage.getItem('indie-fm-speed');
    return speed ? parseInt(speed, 10) : 1;
  } catch {
    return 1;
  }
}

// --- Item 94: Error handling ---
export interface AppError {
  code: string;
  message: string;
  recoverable: boolean;
  timestamp: number;
}

export function createError(code: string, message: string, recoverable: boolean = true): AppError {
  return { code, message, recoverable, timestamp: Date.now() };
}

export function handleError(error: AppError): void {
  console.error(`[${error.code}] ${error.message}`);
  // In production, would send to error tracking service
}

// --- Item 95: Input validation ---
export function validateTeamName(name: string): { valid: boolean; error?: string } {
  if (!name || name.trim().length === 0) return { valid: false, error: 'Team name is required' };
  if (name.length > 50) return { valid: false, error: 'Team name too long (max 50 chars)' };
  if (!/^[a-zA-Z0-9\s'-]+$/.test(name)) return { valid: false, error: 'Invalid characters in team name' };
  return { valid: true };
}

export function validateBudget(amount: number): { valid: boolean; error?: string } {
  if (amount < 0) return { valid: false, error: 'Budget cannot be negative' };
  if (amount > 1_000_000_000) return { valid: false, error: 'Budget exceeds maximum (£1B)' };
  return { valid: true };
}

export function validateSquadSize(size: number): { valid: boolean; error?: string } {
  if (size < 11) return { valid: false, error: 'Squad must have at least 11 players' };
  if (size > 30) return { valid: false, error: 'Squad exceeds maximum size (30)' };
  return { valid: true };
}

// --- Item 96: Virtualization ---
export interface VirtualWindow {
  startIndex: number;
  endIndex: number;
  visibleCount: number;
  totalHeight: number;
  offsetY: number;
}

export function calculateVirtualWindow(scrollTop: number, containerHeight: number, itemHeight: number, totalItems: number, overscan: number = 5): VirtualWindow {
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(totalItems, startIndex + visibleCount + overscan * 2);

  return {
    startIndex,
    endIndex,
    visibleCount,
    totalHeight: totalItems * itemHeight,
    offsetY: startIndex * itemHeight,
  };
}

// --- Item 97: ARIA labels ---
export function getAriaLabel(component: string, context?: string): string {
  const labels: Record<string, string> = {
    'match-tab': 'Match simulation tab',
    'tactics-tab': 'Tactics and formation tab',
    'squad-tab': 'Squad management tab',
    'transfers-tab': 'Transfer market tab',
    'table-tab': 'League table tab',
    'play-button': 'Play or pause match simulation',
    'speed-button': 'Change simulation speed',
    'sub-button': 'Make a substitution',
    'shout-button': 'Give a touchline shout',
  };
  return context ? `${labels[component] ?? component} — ${context}` : labels[component] ?? component;
}

// --- Item 98: Keyboard navigation ---
export const KEYBOARD_NAV: Record<string, { action: string; description: string }> = {
  ' ': { action: 'toggle_play', description: 'Play/Pause' },
  '1': { action: 'speed_1', description: 'Speed 1x' },
  '2': { action: 'speed_2', description: 'Speed 2x' },
  '3': { action: 'speed_4', description: 'Speed 4x' },
  '4': { action: 'speed_8', description: 'Speed 8x' },
  'ArrowLeft': { action: 'prev_tab', description: 'Previous tab' },
  'ArrowRight': { action: 'next_tab', description: 'Next tab' },
  'Escape': { action: 'close_modal', description: 'Close modal' },
};

// --- Item 99: i18n ---
export interface Translation {
  key: string;
  en: string;
  es?: string;
  fr?: string;
  de?: string;
}

export const TRANSLATIONS: Translation[] = [
  { key: 'app.title', en: 'Indie FM', es: 'Indie FM', fr: 'Indie FM', de: 'Indie FM' },
  { key: 'match.play', en: 'Play', es: 'Jugar', fr: 'Jouer', de: 'Spielen' },
  { key: 'match.pause', en: 'Pause', es: 'Pausa', fr: 'Pause', de: 'Pause' },
  { key: 'match.fullTime', en: 'Full Time', es: 'Final', fr: 'Fin du match', de: 'Abpfiff' },
  { key: 'match.halfTime', en: 'Half Time', es: 'Descanso', fr: 'Mi-temps', de: 'Halbzeit' },
  { key: 'match.goal', en: 'GOAL!', es: '¡GOL!', fr: 'BUT!', de: 'TOR!' },
  { key: 'nav.match', en: 'Match', es: 'Partido', fr: 'Match', de: 'Spiel' },
  { key: 'nav.tactics', en: 'Tactics', es: 'Tácticas', fr: 'Tactiques', de: 'Taktik' },
  { key: 'nav.squad', en: 'Squad', es: 'Plantilla', fr: 'Effectif', de: 'Kader' },
  { key: 'nav.transfers', en: 'Transfers', es: 'Fichajes', fr: 'Transferts', de: 'Transfers' },
  { key: 'nav.table', en: 'Table', es: 'Tabla', fr: 'Classement', de: 'Tabelle' },
];

export function translate(key: string, lang: string = 'en'): string {
  const translation = TRANSLATIONS.find((t) => t.key === key);
  if (!translation) return key;
  return (translation as unknown as Record<string, string>)[lang] ?? translation.en;
}

// --- Item 100: Analytics ---
export interface AnalyticsEvent {
  event: string;
  properties: Record<string, unknown>;
  timestamp: number;
}

export function trackEvent(event: string, properties: Record<string, unknown> = {}): AnalyticsEvent {
  return { event, properties, timestamp: Date.now() };
}

export function trackMatchStarted(homeTeam: string, awayTeam: string): AnalyticsEvent {
  return trackEvent('match_started', { homeTeam, awayTeam });
}

export function trackMatchCompleted(homeScore: number, awayScore: number, duration: number): AnalyticsEvent {
  return trackEvent('match_completed', { homeScore, awayScore, duration });
}

export function trackTransferCompleted(playerName: string, fee: number): AnalyticsEvent {
  return trackEvent('transfer_completed', { playerName, fee });
}

export function trackSeasonCompleted(position: number, points: number): AnalyticsEvent {
  return trackEvent('season_completed', { position, points });
}
