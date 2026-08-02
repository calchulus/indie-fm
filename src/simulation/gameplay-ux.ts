// Ease-of-play utilities (#13-20)
// Auto-advance, quick-match, persist UI state, ETA calculation, undo transfer

// --- #14: Auto-advance after match ---
export function shouldAutoAdvance(matchStatus: string, secondsSinceFT: number): boolean {
  return matchStatus === 'full_time' && secondsSinceFT > 5;
}

// --- #15: Quick-match (instant sim) ---
export interface QuickMatchResult {
  homeName: string;
  awayName: string;
  homeGoals: number;
  awayGoals: number;
  scorers: string[];
}

// --- #16: Persist UI state ---
const UI_STATE_KEY = 'indie-fm-ui-state';

export interface PersistedUIState {
  section: string;
  subTab: string;
}

export function saveUIState(state: PersistedUIState): void {
  try { localStorage.setItem(UI_STATE_KEY, JSON.stringify(state)); } catch { /* ignore */ }
}

export function loadUIState(): PersistedUIState | null {
  try {
    const raw = localStorage.getItem(UI_STATE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

// --- #18: Undo last transfer ---
export interface TransferSnapshot {
  playerId: string;
  playerName: string;
  fromTeamId: string;
  toTeamId: string;
  fee: number;
  timestamp: number;
}

let lastTransfer: TransferSnapshot | null = null;

export function recordTransfer(snapshot: TransferSnapshot): void {
  lastTransfer = snapshot;
}

export function canUndoTransfer(): boolean {
  return lastTransfer !== null && Date.now() - lastTransfer.timestamp < 30_000; // 30s window
}

export function getLastTransfer(): TransferSnapshot | null {
  return canUndoTransfer() ? lastTransfer : null;
}

export function clearUndoTransfer(): void {
  lastTransfer = null;
}

// --- #19: Speed indicator + ETA ---
export function computeSimETA(currentRound: number, totalRounds: number, msPerRound: number): string {
  const remaining = totalRounds - currentRound;
  if (remaining <= 0) return 'Season complete';
  const totalMs = remaining * msPerRound;
  if (totalMs < 1000) return '< 1s remaining';
  if (totalMs < 60_000) return `~${Math.ceil(totalMs / 1000)}s remaining`;
  return `~${Math.ceil(totalMs / 60_000)}m remaining`;
}

// --- #17: Attribute tooltips ---
export const ATTRIBUTE_DESCRIPTIONS: Record<string, string> = {
  pace: 'Speed over distance — how fast the player runs',
  acceleration: 'How quickly the player reaches top speed',
  stamina: 'Resistance to fatigue — maintains performance longer',
  strength: 'Physical power — wins duels and shields the ball',
  agility: 'Quick changes of direction and balance',
  jumpingReach: 'Effective height in aerial duels',
  passing: 'Accuracy and weight of passes',
  crossing: 'Quality of deliveries from wide areas',
  dribbling: 'Close control while running with the ball',
  technique: 'Quality of first touch and ball control',
  finishing: 'Composure and accuracy in front of goal',
  longShots: 'Ability to score from distance',
  heading: 'Accuracy of headers from crosses and set pieces',
  vision: 'Seeing and executing passes others miss',
  composure: 'Calmness under pressure — avoids rash decisions',
  decisions: 'Choosing the right option at the right time',
  anticipation: 'Reading the game — reacts before others',
  concentration: 'Maintaining focus throughout the match',
  workRate: 'Willingness to track back and press',
  offTheBall: 'Movement without the ball — finding space',
  positioning: 'Defensive awareness — being in the right place',
  tackling: 'Winning the ball cleanly in challenges',
  marking: 'Staying tight to the assigned opponent',
  aggression: 'Intensity in challenges — more tackles, more cards',
  bravery: 'Willingness to put body on the line',
  flair: 'Unpredictable creative play',
  reflexes: 'GK reaction speed to shots',
  handling: 'GK ability to hold onto the ball',
  oneOnOnes: 'GK in 1v1 situations',
  aerialReach: 'GK reach for crosses and high balls',
  commandOfArea: 'GK authority in the penalty area',
  penaltyTaking: 'Composure and accuracy from the spot',
  freeKickTaking: 'Quality of dead-ball delivery',
};

export function getAttributeTooltip(attr: string): string {
  return ATTRIBUTE_DESCRIPTIONS[attr] ?? attr;
}
