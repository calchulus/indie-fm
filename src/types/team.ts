import { Player } from './player';

export type Formation = '4-4-2' | '4-3-3' | '3-5-2' | '4-2-3-1' | '5-3-2' | '4-1-4-1' | '3-4-3' | '4-4-1-1' | '4-5-1' | '5-4-1' | '4-3-3-att' | '4-2-4' | '3-4-1-2' | '4-1-2-1-2' | '5-2-3' | '4-6-0' | '4-2-2-2' | '3-3-4';

export type TeamMentality = 'defensive' | 'balanced' | 'attacking';
export type PressingIntensity = 'low' | 'medium' | 'high';
export type TempoSetting = 'slow' | 'normal' | 'fast';
export type WidthSetting = 'narrow' | 'normal' | 'wide';

export interface Tactics {
  formation: Formation;
  mentality: TeamMentality;
  pressing: PressingIntensity;
  tempo: TempoSetting;
  width: WidthSetting;
  defensiveLine: number;
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  city: string;
  stadium: string;
  capacity: number;
  budget: number;
  reputation: number;
  players: Player[];
  tactics: Tactics;
  colors: { primary: string; secondary: string };
}

export const DEFAULT_TACTICS: Tactics = {
  formation: '4-4-2',
  mentality: 'balanced',
  pressing: 'medium',
  tempo: 'normal',
  width: 'normal',
  defensiveLine: 50,
};
