import { Tactics, Formation } from '../types';

export interface FormationSlot {
  role: string;
  baseX: number;
  baseY: number;
}

// All coordinates in pitch space: X = 0-105 (length), Y = 0-68 (width)
const FORMATION_SLOTS: Record<Formation, FormationSlot[]> = {
  '4-4-2': [
    { role: 'GK', baseX: 5, baseY: 34 },
    { role: 'LB', baseX: 20, baseY: 10 },
    { role: 'CB', baseX: 18, baseY: 26 },
    { role: 'CB', baseX: 18, baseY: 42 },
    { role: 'RB', baseX: 20, baseY: 58 },
    { role: 'LW', baseX: 45, baseY: 8 },
    { role: 'CM', baseX: 42, baseY: 26 },
    { role: 'CM', baseX: 42, baseY: 42 },
    { role: 'RW', baseX: 45, baseY: 60 },
    { role: 'ST', baseX: 65, baseY: 26 },
    { role: 'ST', baseX: 65, baseY: 42 },
  ],
  '4-3-3': [
    { role: 'GK', baseX: 5, baseY: 34 },
    { role: 'LB', baseX: 20, baseY: 10 },
    { role: 'CB', baseX: 18, baseY: 26 },
    { role: 'CB', baseX: 18, baseY: 42 },
    { role: 'RB', baseX: 20, baseY: 58 },
    { role: 'CM', baseX: 40, baseY: 17 },
    { role: 'CM', baseX: 38, baseY: 34 },
    { role: 'CM', baseX: 40, baseY: 51 },
    { role: 'LW', baseX: 62, baseY: 10 },
    { role: 'RW', baseX: 62, baseY: 58 },
    { role: 'ST', baseX: 68, baseY: 34 },
  ],
  '3-5-2': [
    { role: 'GK', baseX: 5, baseY: 34 },
    { role: 'CB', baseX: 18, baseY: 17 },
    { role: 'CB', baseX: 16, baseY: 34 },
    { role: 'CB', baseX: 18, baseY: 51 },
    { role: 'LB', baseX: 35, baseY: 7 },
    { role: 'CM', baseX: 40, baseY: 20 },
    { role: 'CDM', baseX: 35, baseY: 34 },
    { role: 'CM', baseX: 40, baseY: 48 },
    { role: 'RB', baseX: 35, baseY: 61 },
    { role: 'ST', baseX: 65, baseY: 26 },
    { role: 'ST', baseX: 65, baseY: 42 },
  ],
  '4-2-3-1': [
    { role: 'GK', baseX: 5, baseY: 34 },
    { role: 'LB', baseX: 20, baseY: 10 },
    { role: 'CB', baseX: 18, baseY: 26 },
    { role: 'CB', baseX: 18, baseY: 42 },
    { role: 'RB', baseX: 20, baseY: 58 },
    { role: 'CDM', baseX: 35, baseY: 26 },
    { role: 'CDM', baseX: 35, baseY: 42 },
    { role: 'LW', baseX: 55, baseY: 10 },
    { role: 'CAM', baseX: 55, baseY: 34 },
    { role: 'RW', baseX: 55, baseY: 58 },
    { role: 'ST', baseX: 70, baseY: 34 },
  ],
  '5-3-2': [
    { role: 'GK', baseX: 5, baseY: 34 },
    { role: 'LB', baseX: 22, baseY: 7 },
    { role: 'CB', baseX: 16, baseY: 20 },
    { role: 'CB', baseX: 15, baseY: 34 },
    { role: 'CB', baseX: 16, baseY: 48 },
    { role: 'RB', baseX: 22, baseY: 61 },
    { role: 'CM', baseX: 42, baseY: 20 },
    { role: 'CM', baseX: 40, baseY: 34 },
    { role: 'CAM', baseX: 45, baseY: 48 },
    { role: 'ST', baseX: 65, baseY: 26 },
    { role: 'ST', baseX: 65, baseY: 42 },
  ],
  '4-1-4-1': [
    { role: 'GK', baseX: 5, baseY: 34 },
    { role: 'LB', baseX: 20, baseY: 10 },
    { role: 'CB', baseX: 18, baseY: 26 },
    { role: 'CB', baseX: 18, baseY: 42 },
    { role: 'RB', baseX: 20, baseY: 58 },
    { role: 'CDM', baseX: 32, baseY: 34 },
    { role: 'LW', baseX: 48, baseY: 8 },
    { role: 'CM', baseX: 46, baseY: 24 },
    { role: 'CM', baseX: 46, baseY: 44 },
    { role: 'RW', baseX: 48, baseY: 60 },
    { role: 'ST', baseX: 68, baseY: 34 },
  ],
  '3-4-3': [
    { role: 'GK', baseX: 5, baseY: 34 },
    { role: 'CB', baseX: 17, baseY: 17 },
    { role: 'CB', baseX: 15, baseY: 34 },
    { role: 'CB', baseX: 17, baseY: 51 },
    { role: 'LB', baseX: 35, baseY: 7 },
    { role: 'CM', baseX: 38, baseY: 26 },
    { role: 'CM', baseX: 38, baseY: 42 },
    { role: 'RB', baseX: 35, baseY: 61 },
    { role: 'LW', baseX: 62, baseY: 12 },
    { role: 'ST', baseX: 66, baseY: 34 },
    { role: 'RW', baseX: 62, baseY: 56 },
  ],
  '4-4-1-1': [
    { role: 'GK', baseX: 5, baseY: 34 },
    { role: 'LB', baseX: 20, baseY: 10 },
    { role: 'CB', baseX: 18, baseY: 26 },
    { role: 'CB', baseX: 18, baseY: 42 },
    { role: 'RB', baseX: 20, baseY: 58 },
    { role: 'LW', baseX: 44, baseY: 8 },
    { role: 'CM', baseX: 42, baseY: 26 },
    { role: 'CM', baseX: 42, baseY: 42 },
    { role: 'RW', baseX: 44, baseY: 60 },
    { role: 'CAM', baseX: 56, baseY: 34 },
    { role: 'ST', baseX: 70, baseY: 34 },
  ],
  '4-5-1': [
    { role: 'GK', baseX: 5, baseY: 34 },
    { role: 'LB', baseX: 20, baseY: 10 },
    { role: 'CB', baseX: 18, baseY: 26 },
    { role: 'CB', baseX: 18, baseY: 42 },
    { role: 'RB', baseX: 20, baseY: 58 },
    { role: 'LW', baseX: 44, baseY: 8 },
    { role: 'CM', baseX: 40, baseY: 22 },
    { role: 'CDM', baseX: 38, baseY: 34 },
    { role: 'CM', baseX: 40, baseY: 46 },
    { role: 'RW', baseX: 44, baseY: 60 },
    { role: 'ST', baseX: 66, baseY: 34 },
  ],
  '5-4-1': [
    { role: 'GK', baseX: 5, baseY: 34 },
    { role: 'LB', baseX: 22, baseY: 7 },
    { role: 'CB', baseX: 16, baseY: 20 },
    { role: 'CB', baseX: 15, baseY: 34 },
    { role: 'CB', baseX: 16, baseY: 48 },
    { role: 'RB', baseX: 22, baseY: 61 },
    { role: 'LW', baseX: 42, baseY: 10 },
    { role: 'CM', baseX: 40, baseY: 28 },
    { role: 'CM', baseX: 40, baseY: 40 },
    { role: 'RW', baseX: 42, baseY: 58 },
    { role: 'ST', baseX: 64, baseY: 34 },
  ],
  '4-3-3-att': [
    { role: 'GK', baseX: 5, baseY: 34 },
    { role: 'LB', baseX: 20, baseY: 10 },
    { role: 'CB', baseX: 18, baseY: 26 },
    { role: 'CB', baseX: 18, baseY: 42 },
    { role: 'RB', baseX: 20, baseY: 58 },
    { role: 'CM', baseX: 38, baseY: 22 },
    { role: 'CDM', baseX: 35, baseY: 34 },
    { role: 'CM', baseX: 38, baseY: 46 },
    { role: 'LW', baseX: 65, baseY: 10 },
    { role: 'ST', baseX: 70, baseY: 34 },
    { role: 'RW', baseX: 65, baseY: 58 },
  ],
  '4-2-4': [
    { role: 'GK', baseX: 5, baseY: 34 },
    { role: 'LB', baseX: 20, baseY: 10 },
    { role: 'CB', baseX: 18, baseY: 26 },
    { role: 'CB', baseX: 18, baseY: 42 },
    { role: 'RB', baseX: 20, baseY: 58 },
    { role: 'CM', baseX: 38, baseY: 28 },
    { role: 'CM', baseX: 38, baseY: 42 },
    { role: 'LW', baseX: 62, baseY: 10 },
    { role: 'ST', baseX: 68, baseY: 28 },
    { role: 'ST', baseX: 68, baseY: 42 },
    { role: 'RW', baseX: 62, baseY: 58 },
  ],
  '3-4-1-2': [
    { role: 'GK', baseX: 5, baseY: 34 },
    { role: 'CB', baseX: 17, baseY: 17 },
    { role: 'CB', baseX: 15, baseY: 34 },
    { role: 'CB', baseX: 17, baseY: 51 },
    { role: 'LB', baseX: 35, baseY: 7 },
    { role: 'CM', baseX: 38, baseY: 26 },
    { role: 'CM', baseX: 38, baseY: 42 },
    { role: 'RB', baseX: 35, baseY: 61 },
    { role: 'CAM', baseX: 55, baseY: 34 },
    { role: 'ST', baseX: 68, baseY: 26 },
    { role: 'ST', baseX: 68, baseY: 42 },
  ],
  '4-1-2-1-2': [
    { role: 'GK', baseX: 5, baseY: 34 },
    { role: 'LB', baseX: 20, baseY: 10 },
    { role: 'CB', baseX: 18, baseY: 26 },
    { role: 'CB', baseX: 18, baseY: 42 },
    { role: 'RB', baseX: 20, baseY: 58 },
    { role: 'CDM', baseX: 32, baseY: 34 },
    { role: 'CM', baseX: 42, baseY: 22 },
    { role: 'CM', baseX: 42, baseY: 46 },
    { role: 'CAM', baseX: 55, baseY: 34 },
    { role: 'ST', baseX: 68, baseY: 26 },
    { role: 'ST', baseX: 68, baseY: 42 },
  ],
  '5-2-3': [
    { role: 'GK', baseX: 5, baseY: 34 },
    { role: 'LB', baseX: 22, baseY: 7 },
    { role: 'CB', baseX: 16, baseY: 20 },
    { role: 'CB', baseX: 15, baseY: 34 },
    { role: 'CB', baseX: 16, baseY: 48 },
    { role: 'RB', baseX: 22, baseY: 61 },
    { role: 'CM', baseX: 38, baseY: 28 },
    { role: 'CM', baseX: 38, baseY: 42 },
    { role: 'LW', baseX: 62, baseY: 12 },
    { role: 'ST', baseX: 68, baseY: 34 },
    { role: 'RW', baseX: 62, baseY: 56 },
  ],
  '4-6-0': [
    { role: 'GK', baseX: 5, baseY: 34 },
    { role: 'LB', baseX: 20, baseY: 10 },
    { role: 'CB', baseX: 18, baseY: 26 },
    { role: 'CB', baseX: 18, baseY: 42 },
    { role: 'RB', baseX: 20, baseY: 58 },
    { role: 'CDM', baseX: 32, baseY: 34 },
    { role: 'CM', baseX: 40, baseY: 20 },
    { role: 'CM', baseX: 42, baseY: 34 },
    { role: 'CM', baseX: 40, baseY: 48 },
    { role: 'CAM', baseX: 58, baseY: 26 },
    { role: 'CAM', baseX: 58, baseY: 42 },
  ],
  '4-2-2-2': [
    { role: 'GK', baseX: 5, baseY: 34 },
    { role: 'LB', baseX: 20, baseY: 10 },
    { role: 'CB', baseX: 18, baseY: 26 },
    { role: 'CB', baseX: 18, baseY: 42 },
    { role: 'RB', baseX: 20, baseY: 58 },
    { role: 'CDM', baseX: 34, baseY: 28 },
    { role: 'CDM', baseX: 34, baseY: 42 },
    { role: 'CAM', baseX: 52, baseY: 24 },
    { role: 'CAM', baseX: 52, baseY: 46 },
    { role: 'ST', baseX: 68, baseY: 28 },
    { role: 'ST', baseX: 68, baseY: 42 },
  ],
  '3-3-4': [
    { role: 'GK', baseX: 5, baseY: 34 },
    { role: 'CB', baseX: 17, baseY: 17 },
    { role: 'CB', baseX: 15, baseY: 34 },
    { role: 'CB', baseX: 17, baseY: 51 },
    { role: 'CM', baseX: 38, baseY: 20 },
    { role: 'CM', baseX: 36, baseY: 34 },
    { role: 'CM', baseX: 38, baseY: 48 },
    { role: 'LW', baseX: 62, baseY: 10 },
    { role: 'ST', baseX: 68, baseY: 26 },
    { role: 'ST', baseX: 68, baseY: 42 },
    { role: 'RW', baseX: 62, baseY: 58 },
  ],
};

export function getFormationSlots(formation: Formation): FormationSlot[] {
  return FORMATION_SLOTS[formation];
}

export function getMentalityModifier(tactics: Tactics): { attack: number; defend: number } {
  switch (tactics.mentality) {
    case 'attacking': return { attack: 1.2, defend: 0.8 };
    case 'defensive': return { attack: 0.8, defend: 1.2 };
    default: return { attack: 1.0, defend: 1.0 };
  }
}

export function getPressingModifier(tactics: Tactics): number {
  switch (tactics.pressing) {
    case 'high': return 1.3;
    case 'low': return 0.7;
    default: return 1.0;
  }
}

export function getTempoModifier(tactics: Tactics): number {
  switch (tactics.tempo) {
    case 'fast': return 1.25;
    case 'slow': return 0.75;
    default: return 1.0;
  }
}
