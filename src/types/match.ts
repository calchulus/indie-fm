export type MatchEventType =
  | 'kickoff'
  | 'pass'
  | 'dribble'
  | 'shot'
  | 'goal'
  | 'save'
  | 'tackle'
  | 'interception'
  | 'foul'
  | 'yellow_card'
  | 'red_card'
  | 'corner'
  | 'free_kick'
  | 'throw_in'
  | 'offside'
  | 'substitution'
  | 'half_time'
  | 'full_time'
  | 'possession';

export interface MatchEvent {
  id: string;
  tick: number;
  minute: number;
  type: MatchEventType;
  teamId: string;
  playerId?: string;
  description: string;
  x: number;
  y: number;
  outcome: 'success' | 'failure' | 'neutral';
}

export interface MatchState {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
  minute: number;
  tick: number;
  half: 1 | 2;
  status: 'pre_match' | 'first_half' | 'half_time' | 'second_half' | 'full_time' | 'extra_time' | 'penalties';
  possession: { home: number; away: number };
  shots: { home: number; away: number };
  shotsOnTarget: { home: number; away: number };
  corners: { home: number; away: number };
  fouls: { home: number; away: number };
  redCards: { home: number; away: number };
  sentOff: string[]; // player IDs sent off
  injuryTime: { firstHalf: number; secondHalf: number }; // added minutes
  stoppages: number; // count of stoppages for injury time calc
  isKnockout: boolean; // whether ET/pens apply
  events: MatchEvent[];
  playerPositions: PlayerPosition[];
  ballPosition: { x: number; y: number };
}

export interface PlayerPosition {
  playerId: string;
  teamId: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  hasBall: boolean;
}

export const PITCH_LENGTH = 105;
export const PITCH_WIDTH = 68;
export const TICKS_PER_MINUTE = 60;
export const MATCH_TICKS = 90 * TICKS_PER_MINUTE;

export interface MomentumState {
  home: number;
  away: number;
  dominant: 'home' | 'away' | 'even';
}
