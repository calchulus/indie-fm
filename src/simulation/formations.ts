import { Position } from '../types';

export interface FormationSlot {
  position: Position;
  x: number; // 0-100 (left to right)
  y: number; // 0-100 (bottom to top, 0 = own goal, 100 = opponent goal)
  role: string;
}

export interface FormationDefinition {
  id: string;
  name: string;
  shortName: string;
  category: 'defensive' | 'balanced' | 'attacking' | 'custom';
  slots: FormationSlot[];
  description: string;
}

// Full formation list — 18 formations across all categories
export const FORMATIONS: FormationDefinition[] = [
  // Defensive
  {
    id: '5-4-1', name: '5-4-1', shortName: '541', category: 'defensive',
    description: 'Ultra-defensive. Five at the back, four across midfield, lone striker.',
    slots: [
      { position: 'GK', x: 50, y: 5, role: 'goalkeeper' },
      { position: 'LB', x: 15, y: 22, role: 'wing_back' },
      { position: 'CB', x: 35, y: 18, role: 'central_defender' },
      { position: 'CB', x: 50, y: 16, role: 'central_defender' },
      { position: 'CB', x: 65, y: 18, role: 'central_defender' },
      { position: 'RB', x: 85, y: 22, role: 'wing_back' },
      { position: 'LW', x: 20, y: 45, role: 'winger' },
      { position: 'CM', x: 40, y: 42, role: 'central_midfielder' },
      { position: 'CM', x: 60, y: 42, role: 'central_midfielder' },
      { position: 'RW', x: 80, y: 45, role: 'winger' },
      { position: 'ST', x: 50, y: 72, role: 'target_man' },
    ],
  },
  {
    id: '5-3-2', name: '5-3-2', shortName: '532', category: 'defensive',
    description: 'Solid defensive base with wing-backs providing width. Two strikers for counter-attacks.',
    slots: [
      { position: 'GK', x: 50, y: 5, role: 'goalkeeper' },
      { position: 'LB', x: 12, y: 25, role: 'wing_back' },
      { position: 'CB', x: 33, y: 18, role: 'central_defender' },
      { position: 'CB', x: 50, y: 16, role: 'central_defender' },
      { position: 'CB', x: 67, y: 18, role: 'central_defender' },
      { position: 'RB', x: 88, y: 25, role: 'wing_back' },
      { position: 'CM', x: 35, y: 45, role: 'central_midfielder' },
      { position: 'CDM', x: 50, y: 40, role: 'defensive_midfielder' },
      { position: 'CM', x: 65, y: 45, role: 'central_midfielder' },
      { position: 'ST', x: 40, y: 72, role: 'striker' },
      { position: 'ST', x: 60, y: 72, role: 'striker' },
    ],
  },
  {
    id: '4-5-1', name: '4-5-1', shortName: '451', category: 'defensive',
    description: 'Crowds midfield to suffocate opponents. Lone striker holds up play.',
    slots: [
      { position: 'GK', x: 50, y: 5, role: 'goalkeeper' },
      { position: 'LB', x: 18, y: 22, role: 'full_back' },
      { position: 'CB', x: 38, y: 18, role: 'central_defender' },
      { position: 'CB', x: 62, y: 18, role: 'central_defender' },
      { position: 'RB', x: 82, y: 22, role: 'full_back' },
      { position: 'LW', x: 15, y: 48, role: 'winger' },
      { position: 'CM', x: 35, y: 45, role: 'central_midfielder' },
      { position: 'CDM', x: 50, y: 38, role: 'defensive_midfielder' },
      { position: 'CM', x: 65, y: 45, role: 'central_midfielder' },
      { position: 'RW', x: 85, y: 48, role: 'winger' },
      { position: 'ST', x: 50, y: 72, role: 'target_man' },
    ],
  },
  // Balanced
  {
    id: '4-4-2', name: '4-4-2', shortName: '442', category: 'balanced',
    description: 'Classic balanced formation. Two banks of four, two strikers. Solid in all phases.',
    slots: [
      { position: 'GK', x: 50, y: 5, role: 'goalkeeper' },
      { position: 'LB', x: 18, y: 22, role: 'full_back' },
      { position: 'CB', x: 38, y: 18, role: 'central_defender' },
      { position: 'CB', x: 62, y: 18, role: 'central_defender' },
      { position: 'RB', x: 82, y: 22, role: 'full_back' },
      { position: 'LW', x: 15, y: 50, role: 'winger' },
      { position: 'CM', x: 38, y: 45, role: 'central_midfielder' },
      { position: 'CM', x: 62, y: 45, role: 'central_midfielder' },
      { position: 'RW', x: 85, y: 50, role: 'winger' },
      { position: 'ST', x: 40, y: 75, role: 'striker' },
      { position: 'ST', x: 60, y: 75, role: 'striker' },
    ],
  },
  {
    id: '4-4-1-1', name: '4-4-1-1', shortName: '4411', category: 'balanced',
    description: 'Four at the back, four across midfield, a hole player, and a lone striker.',
    slots: [
      { position: 'GK', x: 50, y: 5, role: 'goalkeeper' },
      { position: 'LB', x: 18, y: 22, role: 'full_back' },
      { position: 'CB', x: 38, y: 18, role: 'central_defender' },
      { position: 'CB', x: 62, y: 18, role: 'central_defender' },
      { position: 'RB', x: 82, y: 22, role: 'full_back' },
      { position: 'LW', x: 15, y: 48, role: 'winger' },
      { position: 'CM', x: 38, y: 42, role: 'central_midfielder' },
      { position: 'CM', x: 62, y: 42, role: 'central_midfielder' },
      { position: 'RW', x: 85, y: 48, role: 'winger' },
      { position: 'CAM', x: 50, y: 62, role: 'attacking_midfielder' },
      { position: 'ST', x: 50, y: 78, role: 'striker' },
    ],
  },
  {
    id: '4-3-3', name: '4-3-3', shortName: '433', category: 'balanced',
    description: 'Fluid attacking formation. Three midfielders control the center, three forwards press high.',
    slots: [
      { position: 'GK', x: 50, y: 5, role: 'goalkeeper' },
      { position: 'LB', x: 18, y: 22, role: 'full_back' },
      { position: 'CB', x: 38, y: 18, role: 'central_defender' },
      { position: 'CB', x: 62, y: 18, role: 'central_defender' },
      { position: 'RB', x: 82, y: 22, role: 'full_back' },
      { position: 'CM', x: 35, y: 42, role: 'central_midfielder' },
      { position: 'CDM', x: 50, y: 38, role: 'defensive_midfielder' },
      { position: 'CM', x: 65, y: 42, role: 'central_midfielder' },
      { position: 'LW', x: 20, y: 70, role: 'winger' },
      { position: 'ST', x: 50, y: 78, role: 'striker' },
      { position: 'RW', x: 80, y: 70, role: 'winger' },
    ],
  },
  {
    id: '4-2-3-1', name: '4-2-3-1', shortName: '4231', category: 'balanced',
    description: 'Modern meta. Double pivot shields the back four, three attacking mids support a lone striker.',
    slots: [
      { position: 'GK', x: 50, y: 5, role: 'goalkeeper' },
      { position: 'LB', x: 18, y: 22, role: 'full_back' },
      { position: 'CB', x: 38, y: 18, role: 'central_defender' },
      { position: 'CB', x: 62, y: 18, role: 'central_defender' },
      { position: 'RB', x: 82, y: 22, role: 'full_back' },
      { position: 'CDM', x: 40, y: 38, role: 'defensive_midfielder' },
      { position: 'CDM', x: 60, y: 38, role: 'defensive_midfielder' },
      { position: 'LW', x: 20, y: 58, role: 'winger' },
      { position: 'CAM', x: 50, y: 58, role: 'attacking_midfielder' },
      { position: 'RW', x: 80, y: 58, role: 'winger' },
      { position: 'ST', x: 50, y: 78, role: 'striker' },
    ],
  },
  {
    id: '3-5-2', name: '3-5-2', shortName: '352', category: 'balanced',
    description: 'Three CBs with wing-backs providing width. Five in midfield dominates possession.',
    slots: [
      { position: 'GK', x: 50, y: 5, role: 'goalkeeper' },
      { position: 'CB', x: 30, y: 18, role: 'central_defender' },
      { position: 'CB', x: 50, y: 16, role: 'central_defender' },
      { position: 'CB', x: 70, y: 18, role: 'central_defender' },
      { position: 'LB', x: 10, y: 42, role: 'wing_back' },
      { position: 'CM', x: 35, y: 42, role: 'central_midfielder' },
      { position: 'CDM', x: 50, y: 36, role: 'defensive_midfielder' },
      { position: 'CM', x: 65, y: 42, role: 'central_midfielder' },
      { position: 'RB', x: 90, y: 42, role: 'wing_back' },
      { position: 'ST', x: 40, y: 72, role: 'striker' },
      { position: 'ST', x: 60, y: 72, role: 'striker' },
    ],
  },
  {
    id: '3-4-3', name: '3-4-3', shortName: '343', category: 'balanced',
    description: 'Attacking three at the back with wing-backs. Three forwards press aggressively.',
    slots: [
      { position: 'GK', x: 50, y: 5, role: 'goalkeeper' },
      { position: 'CB', x: 30, y: 18, role: 'central_defender' },
      { position: 'CB', x: 50, y: 16, role: 'central_defender' },
      { position: 'CB', x: 70, y: 18, role: 'central_defender' },
      { position: 'LB', x: 12, y: 45, role: 'wing_back' },
      { position: 'CM', x: 40, y: 42, role: 'central_midfielder' },
      { position: 'CM', x: 60, y: 42, role: 'central_midfielder' },
      { position: 'RB', x: 88, y: 45, role: 'wing_back' },
      { position: 'LW', x: 22, y: 70, role: 'winger' },
      { position: 'ST', x: 50, y: 76, role: 'striker' },
      { position: 'RW', x: 78, y: 70, role: 'winger' },
    ],
  },
  // Attacking
  {
    id: '4-3-3-att', name: '4-3-3 (Attacking)', shortName: '433A', category: 'attacking',
    description: 'High-pressing 4-3-3 with advanced wingers and a false nine. Total football.',
    slots: [
      { position: 'GK', x: 50, y: 8, role: 'sweeper_keeper' },
      { position: 'LB', x: 18, y: 28, role: 'wing_back' },
      { position: 'CB', x: 38, y: 22, role: 'ball_playing_defender' },
      { position: 'CB', x: 62, y: 22, role: 'ball_playing_defender' },
      { position: 'RB', x: 82, y: 28, role: 'wing_back' },
      { position: 'CM', x: 35, y: 48, role: 'box_to_box' },
      { position: 'CDM', x: 50, y: 42, role: 'deep_lying_playmaker' },
      { position: 'CM', x: 65, y: 48, role: 'box_to_box' },
      { position: 'LW', x: 18, y: 75, role: 'inverted_winger' },
      { position: 'ST', x: 50, y: 72, role: 'false_nine' },
      { position: 'RW', x: 82, y: 75, role: 'inverted_winger' },
    ],
  },
  {
    id: '4-2-4', name: '4-2-4', shortName: '424', category: 'attacking',
    description: 'Ultra-attacking. Four forwards overwhelm defenses. Two mids must cover everything.',
    slots: [
      { position: 'GK', x: 50, y: 5, role: 'goalkeeper' },
      { position: 'LB', x: 18, y: 22, role: 'full_back' },
      { position: 'CB', x: 38, y: 18, role: 'central_defender' },
      { position: 'CB', x: 62, y: 18, role: 'central_defender' },
      { position: 'RB', x: 82, y: 22, role: 'full_back' },
      { position: 'CM', x: 40, y: 42, role: 'central_midfielder' },
      { position: 'CM', x: 60, y: 42, role: 'central_midfielder' },
      { position: 'LW', x: 15, y: 68, role: 'winger' },
      { position: 'ST', x: 38, y: 78, role: 'striker' },
      { position: 'ST', x: 62, y: 78, role: 'striker' },
      { position: 'RW', x: 85, y: 68, role: 'winger' },
    ],
  },
  {
    id: '3-4-1-2', name: '3-4-1-2', shortName: '3412', category: 'attacking',
    description: 'Three at the back, four in midfield, a number 10, and two strikers. Attacking overload.',
    slots: [
      { position: 'GK', x: 50, y: 5, role: 'goalkeeper' },
      { position: 'CB', x: 30, y: 18, role: 'central_defender' },
      { position: 'CB', x: 50, y: 16, role: 'central_defender' },
      { position: 'CB', x: 70, y: 18, role: 'central_defender' },
      { position: 'LB', x: 12, y: 42, role: 'wing_back' },
      { position: 'CM', x: 38, y: 42, role: 'central_midfielder' },
      { position: 'CM', x: 62, y: 42, role: 'central_midfielder' },
      { position: 'RB', x: 88, y: 42, role: 'wing_back' },
      { position: 'CAM', x: 50, y: 60, role: 'attacking_midfielder' },
      { position: 'ST', x: 38, y: 78, role: 'striker' },
      { position: 'ST', x: 62, y: 78, role: 'striker' },
    ],
  },
  {
    id: '4-1-4-1', name: '4-1-4-1', shortName: '4141', category: 'attacking',
    description: 'Single pivot with four advanced mids and a lone striker. Possession-dominant.',
    slots: [
      { position: 'GK', x: 50, y: 5, role: 'sweeper_keeper' },
      { position: 'LB', x: 18, y: 22, role: 'full_back' },
      { position: 'CB', x: 38, y: 18, role: 'ball_playing_defender' },
      { position: 'CB', x: 62, y: 18, role: 'ball_playing_defender' },
      { position: 'RB', x: 82, y: 22, role: 'full_back' },
      { position: 'CDM', x: 50, y: 35, role: 'regista' },
      { position: 'LW', x: 15, y: 55, role: 'inverted_winger' },
      { position: 'CM', x: 38, y: 52, role: 'box_to_box' },
      { position: 'CM', x: 62, y: 52, role: 'box_to_box' },
      { position: 'RW', x: 85, y: 55, role: 'inverted_winger' },
      { position: 'ST', x: 50, y: 78, role: 'advanced_forward' },
    ],
  },
  {
    id: '4-2-2-2', name: '4-2-2-2', shortName: '4222', category: 'attacking',
    description: 'Narrow attacking shape. Two pivots, two wide mids, two strikers. Overloads central areas.',
    slots: [
      { position: 'GK', x: 50, y: 5, role: 'goalkeeper' },
      { position: 'LB', x: 18, y: 22, role: 'full_back' },
      { position: 'CB', x: 38, y: 18, role: 'central_defender' },
      { position: 'CB', x: 62, y: 18, role: 'central_defender' },
      { position: 'RB', x: 82, y: 22, role: 'full_back' },
      { position: 'CDM', x: 40, y: 38, role: 'defensive_midfielder' },
      { position: 'CDM', x: 60, y: 38, role: 'defensive_midfielder' },
      { position: 'CAM', x: 35, y: 58, role: 'attacking_midfielder' },
      { position: 'CAM', x: 65, y: 58, role: 'attacking_midfielder' },
      { position: 'ST', x: 40, y: 78, role: 'striker' },
      { position: 'ST', x: 60, y: 78, role: 'striker' },
    ],
  },
  {
    id: '3-3-4', name: '3-3-4', shortName: '334', category: 'attacking',
    description: 'All-out attack. Three at the back, three in midfield, four forwards. Desperation or dominance.',
    slots: [
      { position: 'GK', x: 50, y: 5, role: 'goalkeeper' },
      { position: 'CB', x: 30, y: 18, role: 'central_defender' },
      { position: 'CB', x: 50, y: 16, role: 'central_defender' },
      { position: 'CB', x: 70, y: 18, role: 'central_defender' },
      { position: 'CM', x: 35, y: 42, role: 'central_midfielder' },
      { position: 'CM', x: 50, y: 40, role: 'central_midfielder' },
      { position: 'CM', x: 65, y: 42, role: 'central_midfielder' },
      { position: 'LW', x: 15, y: 70, role: 'winger' },
      { position: 'ST', x: 38, y: 78, role: 'striker' },
      { position: 'ST', x: 62, y: 78, role: 'striker' },
      { position: 'RW', x: 85, y: 70, role: 'winger' },
    ],
  },
  // Additional balanced/defensive
  {
    id: '4-1-2-1-2', name: '4-1-2-1-2 (Diamond)', shortName: '41212', category: 'balanced',
    description: 'Diamond midfield. Narrow shape dominates central areas. Full-backs provide width.',
    slots: [
      { position: 'GK', x: 50, y: 5, role: 'goalkeeper' },
      { position: 'LB', x: 18, y: 22, role: 'full_back' },
      { position: 'CB', x: 38, y: 18, role: 'central_defender' },
      { position: 'CB', x: 62, y: 18, role: 'central_defender' },
      { position: 'RB', x: 82, y: 22, role: 'full_back' },
      { position: 'CDM', x: 50, y: 35, role: 'defensive_midfielder' },
      { position: 'CM', x: 35, y: 48, role: 'central_midfielder' },
      { position: 'CM', x: 65, y: 48, role: 'central_midfielder' },
      { position: 'CAM', x: 50, y: 60, role: 'attacking_midfielder' },
      { position: 'ST', x: 40, y: 78, role: 'striker' },
      { position: 'ST', x: 60, y: 78, role: 'striker' },
    ],
  },
  {
    id: '5-2-3', name: '5-2-3', shortName: '523', category: 'balanced',
    description: 'Five at the back with wing-backs, two central mids, and three forwards. Counter-attacking threat.',
    slots: [
      { position: 'GK', x: 50, y: 5, role: 'goalkeeper' },
      { position: 'LB', x: 10, y: 25, role: 'wing_back' },
      { position: 'CB', x: 32, y: 18, role: 'central_defender' },
      { position: 'CB', x: 50, y: 16, role: 'central_defender' },
      { position: 'CB', x: 68, y: 18, role: 'central_defender' },
      { position: 'RB', x: 90, y: 25, role: 'wing_back' },
      { position: 'CM', x: 40, y: 42, role: 'central_midfielder' },
      { position: 'CM', x: 60, y: 42, role: 'central_midfielder' },
      { position: 'LW', x: 22, y: 70, role: 'winger' },
      { position: 'ST', x: 50, y: 76, role: 'striker' },
      { position: 'RW', x: 78, y: 70, role: 'winger' },
    ],
  },
  {
    id: '4-6-0', name: '4-6-0 (False Nine)', shortName: '460', category: 'balanced',
    description: 'No fixed striker. Six midfielders rotate into attacking positions. Positional play extreme.',
    slots: [
      { position: 'GK', x: 50, y: 5, role: 'sweeper_keeper' },
      { position: 'LB', x: 18, y: 25, role: 'inverted_wing_back' },
      { position: 'CB', x: 38, y: 20, role: 'ball_playing_defender' },
      { position: 'CB', x: 62, y: 20, role: 'ball_playing_defender' },
      { position: 'RB', x: 82, y: 25, role: 'inverted_wing_back' },
      { position: 'CDM', x: 50, y: 38, role: 'regista' },
      { position: 'CM', x: 30, y: 50, role: 'box_to_box' },
      { position: 'CM', x: 50, y: 52, role: 'roaming_playmaker' },
      { position: 'CM', x: 70, y: 50, role: 'box_to_box' },
      { position: 'CAM', x: 38, y: 68, role: 'false_nine' },
      { position: 'CAM', x: 62, y: 68, role: 'shadow_striker' },
    ],
  },
];

export function getFormationById(id: string): FormationDefinition | undefined {
  return FORMATIONS.find((f) => f.id === id);
}

export function getFormationsByCategory(category: string): FormationDefinition[] {
  return FORMATIONS.filter((f) => f.category === category);
}

// Custom formation designer
export interface CustomFormation {
  id: string;
  name: string;
  slots: FormationSlot[];
}

export function createCustomFormation(name: string, slots: FormationSlot[]): CustomFormation {
  return {
    id: `custom_${Date.now()}`,
    name,
    slots,
  };
}

export function validateFormation(slots: FormationSlot[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (slots.length !== 11) errors.push(`Must have exactly 11 players (has ${slots.length})`);

  const gkCount = slots.filter((s) => s.position === 'GK').length;
  if (gkCount !== 1) errors.push(`Must have exactly 1 goalkeeper (has ${gkCount})`);

  const outfield = slots.filter((s) => s.position !== 'GK');
  if (outfield.length !== 10) errors.push(`Must have exactly 10 outfield players (has ${outfield.length})`);

  // Check for overlapping positions (within 5 units)
  for (let i = 0; i < slots.length; i++) {
    for (let j = i + 1; j < slots.length; j++) {
      const dx = Math.abs(slots[i].x - slots[j].x);
      const dy = Math.abs(slots[i].y - slots[j].y);
      if (dx < 5 && dy < 5) {
        errors.push(`Players at positions ${i + 1} and ${j + 1} are too close together`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}
