// Club customization (#4), skill tree development (#5), manager identity (#6)

import { Player } from '../types';

// --- #4: Club Customization ---
export interface ClubCustomization {
  primaryColor: string;
  secondaryColor: string;
  crestStyle: 'shield' | 'circle' | 'diamond' | 'stripes' | 'halves';
  stadiumName: string;
  nickname: string;
}

export const CREST_OPTIONS: Array<{ id: ClubCustomization['crestStyle']; label: string; icon: string }> = [
  { id: 'shield', label: 'Shield', icon: '🛡️' },
  { id: 'circle', label: 'Circle', icon: '⭕' },
  { id: 'diamond', label: 'Diamond', icon: '💎' },
  { id: 'stripes', label: 'Stripes', icon: '📊' },
  { id: 'halves', label: 'Halves', icon: '◐' },
];

export const COLOR_PRESETS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4',
  '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#ffffff',
  '#1e293b', '#000000',
];

export function generateCrestSVG(colors: ClubCustomization, size: number = 64): string {
  const { primaryColor, secondaryColor, crestStyle } = colors;
  switch (crestStyle) {
    case 'shield':
      return `<svg width="${size}" height="${size}" viewBox="0 0 64 64"><path d="M32 4 L56 16 V40 Q56 56 32 62 Q8 56 8 40 V16 Z" fill="${primaryColor}" stroke="${secondaryColor}" stroke-width="3"/><circle cx="32" cy="32" r="10" fill="${secondaryColor}"/></svg>`;
    case 'circle':
      return `<svg width="${size}" height="${size}" viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="${primaryColor}" stroke="${secondaryColor}" stroke-width="3"/><circle cx="32" cy="32" r="14" fill="${secondaryColor}"/></svg>`;
    case 'diamond':
      return `<svg width="${size}" height="${size}" viewBox="0 0 64 64"><rect x="12" y="12" width="40" height="40" transform="rotate(45 32 32)" fill="${primaryColor}" stroke="${secondaryColor}" stroke-width="3"/><circle cx="32" cy="32" r="8" fill="${secondaryColor}"/></svg>`;
    case 'stripes':
      return `<svg width="${size}" height="${size}" viewBox="0 0 64 64"><rect width="64" height="64" rx="8" fill="${primaryColor}"/><rect x="0" y="0" width="16" height="64" fill="${secondaryColor}"/><rect x="32" y="0" width="16" height="64" fill="${secondaryColor}"/></svg>`;
    case 'halves':
      return `<svg width="${size}" height="${size}" viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="${primaryColor}"/><path d="M32 4 A28 28 0 0 1 32 60 Z" fill="${secondaryColor}"/><circle cx="32" cy="32" r="28" fill="none" stroke="${secondaryColor}" stroke-width="2"/></svg>`;
  }
}

// --- #5: Skill Tree Development ---
export type SkillArchetype = 'pace' | 'technical' | 'physical' | 'mental';

export interface SkillNode {
  id: string;
  name: string;
  description: string;
  archetype: SkillArchetype;
  tier: number; // 1-3
  attrBoosts: Partial<Record<string, number>>;
  unlocked: boolean;
  cost: number; // development points
}

export const SKILL_TREES: Record<SkillArchetype, SkillNode[]> = {
  pace: [
    { id: 'p1', name: 'Quick Feet', description: '+2 Acceleration', archetype: 'pace', tier: 1, attrBoosts: { acceleration: 2 }, unlocked: false, cost: 1 },
    { id: 'p2', name: 'Speed Burst', description: '+2 Pace', archetype: 'pace', tier: 1, attrBoosts: { pace: 2 }, unlocked: false, cost: 1 },
    { id: 'p3', name: 'Agility Drill', description: '+2 Agility', archetype: 'pace', tier: 2, attrBoosts: { agility: 2 }, unlocked: false, cost: 2 },
    { id: 'p4', name: 'Explosive Start', description: '+1 Pace, +1 Acceleration', archetype: 'pace', tier: 2, attrBoosts: { pace: 1, acceleration: 1 }, unlocked: false, cost: 2 },
    { id: 'p5', name: 'Lightning', description: '+2 Pace, +1 Agility', archetype: 'pace', tier: 3, attrBoosts: { pace: 2, agility: 1 }, unlocked: false, cost: 3 },
  ],
  technical: [
    { id: 't1', name: 'First Touch', description: '+2 First Touch', archetype: 'technical', tier: 1, attrBoosts: { firstTouch: 2 }, unlocked: false, cost: 1 },
    { id: 't2', name: 'Passing Range', description: '+2 Passing', archetype: 'technical', tier: 1, attrBoosts: { passing: 2 }, unlocked: false, cost: 1 },
    { id: 't3', name: 'Ball Control', description: '+2 Dribbling', archetype: 'technical', tier: 2, attrBoosts: { dribbling: 2 }, unlocked: false, cost: 2 },
    { id: 't4', name: 'Crossing Drill', description: '+2 Crossing', archetype: 'technical', tier: 2, attrBoosts: { crossing: 2 }, unlocked: false, cost: 2 },
    { id: 't5', name: 'Maestro', description: '+2 Technique, +1 Vision', archetype: 'technical', tier: 3, attrBoosts: { technique: 2, vision: 1 }, unlocked: false, cost: 3 },
  ],
  physical: [
    { id: 'ph1', name: 'Core Strength', description: '+2 Strength', archetype: 'physical', tier: 1, attrBoosts: { strength: 2 }, unlocked: false, cost: 1 },
    { id: 'ph2', name: 'Endurance', description: '+2 Stamina', archetype: 'physical', tier: 1, attrBoosts: { stamina: 2 }, unlocked: false, cost: 1 },
    { id: 'ph3', name: 'Aerial Ability', description: '+2 Heading, +1 Jumping', archetype: 'physical', tier: 2, attrBoosts: { heading: 2, jumpingReach: 1 }, unlocked: false, cost: 2 },
    { id: 'ph4', name: 'Iron Body', description: '+1 Strength, +1 Stamina', archetype: 'physical', tier: 2, attrBoosts: { strength: 1, stamina: 1 }, unlocked: false, cost: 2 },
    { id: 'ph5', name: 'Beast Mode', description: '+2 Strength, +1 Stamina, +1 Aggression', archetype: 'physical', tier: 3, attrBoosts: { strength: 2, stamina: 1, aggression: 1 }, unlocked: false, cost: 3 },
  ],
  mental: [
    { id: 'm1', name: 'Focus', description: '+2 Concentration', archetype: 'mental', tier: 1, attrBoosts: { concentration: 2 }, unlocked: false, cost: 1 },
    { id: 'm2', name: 'Composure Drill', description: '+2 Composure', archetype: 'mental', tier: 1, attrBoosts: { composure: 2 }, unlocked: false, cost: 1 },
    { id: 'm3', name: 'Vision Training', description: '+2 Vision', archetype: 'mental', tier: 2, attrBoosts: { vision: 2 }, unlocked: false, cost: 2 },
    { id: 'm4', name: 'Decision Making', description: '+2 Decisions', archetype: 'mental', tier: 2, attrBoosts: { decisions: 2 }, unlocked: false, cost: 2 },
    { id: 'm5', name: 'General', description: '+1 Decisions, +1 Vision, +1 Composure', archetype: 'mental', tier: 3, attrBoosts: { decisions: 1, vision: 1, composure: 1 }, unlocked: false, cost: 3 },
  ],
};

export function getAvailableNodes(archetype: SkillArchetype, unlockedIds: Set<string>, devPoints: number): SkillNode[] {
  return SKILL_TREES[archetype].filter((node) => {
    if (unlockedIds.has(node.id)) return false;
    if (node.cost > devPoints) return false;
    // Tier 2 requires at least 1 tier 1 node unlocked
    if (node.tier === 2) {
      const tier1 = SKILL_TREES[archetype].filter((n) => n.tier === 1);
      return tier1.some((n) => unlockedIds.has(n.id));
    }
    // Tier 3 requires at least 2 tier 2 nodes
    if (node.tier === 3) {
      const tier2 = SKILL_TREES[archetype].filter((n) => n.tier === 2);
      return tier2.filter((n) => unlockedIds.has(n.id)).length >= 2;
    }
    return true;
  });
}

export function applySkillNode(player: Player, node: SkillNode): Player {
  const newAttrs = { ...player.attributes } as any;
  for (const [attr, boost] of Object.entries(node.attrBoosts)) {
    if (attr in newAttrs) {
      newAttrs[attr] = Math.min(20, newAttrs[attr] + (boost as number));
    }
  }
  const newOverall = Math.min(95, player.overall + 1);
  return { ...player, attributes: newAttrs, overall: newOverall, currentAbility: Math.min(player.potentialAbility, player.currentAbility + 1) };
}

// --- #6: Manager Identity ---
export interface ManagerProfile {
  name: string;
  nationality: string;
  age: number;
  playingBackground: 'professional' | 'semi_pro' | 'non_league' | 'none';
  managementStyle: 'tactician' | 'motivator' | 'developer' | 'businessman';
  reputation: number;
  backstory: string;
}

export const MANAGEMENT_STYLES: Array<{ id: ManagerProfile['managementStyle']; label: string; description: string; bonus: string }> = [
  { id: 'tactician', label: 'Tactician', description: 'Obsessed with formations and in-match adjustments', bonus: '+10% tactical adaptation speed' },
  { id: 'motivator', label: 'Motivator', description: 'Gets the best out of players through man-management', bonus: '+5% squad morale' },
  { id: 'developer', label: 'Developer', description: 'Focuses on youth development and training', bonus: '+15% player growth rate' },
  { id: 'businessman', label: 'Businessman', description: 'Excels in the transfer market and negotiations', bonus: '+10% transfer budget' },
];

export const PLAYING_BACKGROUNDS: Array<{ id: ManagerProfile['playingBackground']; label: string; reputation: number }> = [
  { id: 'professional', label: 'Ex-Professional', reputation: 60 },
  { id: 'semi_pro', label: 'Ex-Semi-Pro', reputation: 40 },
  { id: 'non_league', label: 'Non-League', reputation: 25 },
  { id: 'none', label: 'No Playing Career', reputation: 15 },
];

export function createManagerProfile(name: string, nationality: string, age: number, background: ManagerProfile['playingBackground'], style: ManagerProfile['managementStyle']): ManagerProfile {
  const bg = PLAYING_BACKGROUNDS.find((b) => b.id === background)!;
  const backstories: Record<string, string> = {
    tactician: `${name} spent years studying the game from the touchline, developing a reputation for tactical innovation.`,
    motivator: `${name} is known for getting the best out of every player. Dressing rooms rally around their leadership.`,
    developer: `${name} has a track record of turning raw talent into polished professionals. Youth academies thrive under their watch.`,
    businessman: `${name} navigates the transfer market with surgical precision. Every deal is a win.`,
  };

  return {
    name,
    nationality,
    age,
    playingBackground: background,
    managementStyle: style,
    reputation: bg.reputation,
    backstory: backstories[style],
  };
}

export function getStyleBonus(style: ManagerProfile['managementStyle']): { moraleBonus: number; growthBonus: number; budgetBonus: number; tacticsBonus: number } {
  switch (style) {
    case 'tactician': return { moraleBonus: 0, growthBonus: 0, budgetBonus: 0, tacticsBonus: 0.1 };
    case 'motivator': return { moraleBonus: 0.05, growthBonus: 0, budgetBonus: 0, tacticsBonus: 0 };
    case 'developer': return { moraleBonus: 0, growthBonus: 0.15, budgetBonus: 0, tacticsBonus: 0 };
    case 'businessman': return { moraleBonus: 0, growthBonus: 0, budgetBonus: 0.1, tacticsBonus: 0 };
  }
}
