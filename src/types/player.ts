export type Position = 'GK' | 'CB' | 'LB' | 'RB' | 'CDM' | 'CM' | 'CAM' | 'LW' | 'RW' | 'ST';

export type Duty = 'defend' | 'support' | 'attack';

export type PlayerRole =
  | 'goalkeeper'
  | 'sweeper_keeper'
  | 'central_defender'
  | 'ball_playing_defender'
  | 'wide_centre_back'
  | 'libero'
  | 'full_back'
  | 'wing_back'
  | 'inverted_wing_back'
  | 'complete_wing_back'
  | 'defensive_midfielder'
  | 'anchor'
  | 'half_back'
  | 'deep_lying_playmaker'
  | 'regista'
  | 'roaming_playmaker'
  | 'segundo_volante'
  | 'central_midfielder'
  | 'box_to_box'
  | 'carrilero'
  | 'mezzala'
  | 'advanced_playmaker'
  | 'attacking_midfielder'
  | 'trequartista'
  | 'shadow_striker'
  | 'winger'
  | 'inverted_winger'
  | 'wide_playmaker'
  | 'wide_target_man'
  | 'striker'
  | 'target_man'
  | 'poacher'
  | 'advanced_forward'
  | 'complete_forward'
  | 'deep_lying_forward'
  | 'false_nine'
  | 'pressing_forward';

export interface RoleDefinition {
  role: PlayerRole;
  label: string;
  positions: Position[];
  duties: Duty[];
  keyAttributes: Array<keyof PlayerAttributes>;
  description: string;
}

export interface PlayerAttributes {
  // Technical (13)
  crossing: number;
  dribbling: number;
  finishing: number;
  firstTouch: number;
  freeKickTaking: number;
  heading: number;
  longShots: number;
  longThrows: number;
  marking: number;
  passing: number;
  penaltyTaking: number;
  tackling: number;
  technique: number;
  // Mental (14)
  aggression: number;
  anticipation: number;
  bravery: number;
  composure: number;
  concentration: number;
  decisions: number;
  determination: number;
  flair: number;
  leadership: number;
  offTheBall: number;
  positioning: number;
  teamwork: number;
  vision: number;
  workRate: number;
  // Physical (8)
  acceleration: number;
  agility: number;
  balance: number;
  jumpingReach: number;
  naturalFitness: number;
  pace: number;
  stamina: number;
  strength: number;
  // Goalkeeping (10)
  aerialReach: number;
  commandOfArea: number;
  communication: number;
  eccentricity: number;
  handling: number;
  kicking: number;
  oneOnOnes: number;
  reflexes: number;
  rushingOut: number;
  throwing: number;
}

export const ATTRIBUTE_GROUPS = {
  technical: ['crossing', 'dribbling', 'finishing', 'firstTouch', 'freeKickTaking', 'heading', 'longShots', 'longThrows', 'marking', 'passing', 'penaltyTaking', 'tackling', 'technique'] as const,
  mental: ['aggression', 'anticipation', 'bravery', 'composure', 'concentration', 'decisions', 'determination', 'flair', 'leadership', 'offTheBall', 'positioning', 'teamwork', 'vision', 'workRate'] as const,
  physical: ['acceleration', 'agility', 'balance', 'jumpingReach', 'naturalFitness', 'pace', 'stamina', 'strength'] as const,
  goalkeeping: ['aerialReach', 'commandOfArea', 'communication', 'eccentricity', 'handling', 'kicking', 'oneOnOnes', 'reflexes', 'rushingOut', 'throwing'] as const,
};

export const ROLE_DEFINITIONS: RoleDefinition[] = [
  { role: 'goalkeeper', label: 'Goalkeeper', positions: ['GK'], duties: ['defend'], keyAttributes: ['handling', 'reflexes', 'positioning', 'oneOnOnes', 'aerialReach'], description: 'Traditional shot-stopper, stays on line' },
  { role: 'sweeper_keeper', label: 'Sweeper Keeper', positions: ['GK'], duties: ['defend', 'support', 'attack'], keyAttributes: ['rushingOut', 'reflexes', 'oneOnOnes', 'passing', 'composure'], description: 'Comes off line to clear, comfortable with ball at feet' },
  { role: 'central_defender', label: 'Central Defender', positions: ['CB'], duties: ['defend'], keyAttributes: ['marking', 'tackling', 'heading', 'positioning', 'strength'], description: 'No-nonsense defender, wins the ball' },
  { role: 'ball_playing_defender', label: 'Ball-Playing Defender', positions: ['CB'], duties: ['defend', 'support'], keyAttributes: ['passing', 'tackling', 'composure', 'firstTouch', 'decisions'], description: 'Builds from the back with progressive passing' },
  { role: 'wide_centre_back', label: 'Wide Centre-Back', positions: ['CB'], duties: ['defend', 'support', 'attack'], keyAttributes: ['pace', 'tackling', 'dribbling', 'stamina', 'passing'], description: 'Covers wide areas, drives forward in possession' },
  { role: 'libero', label: 'Libero', positions: ['CB'], duties: ['support', 'attack'], keyAttributes: ['passing', 'vision', 'tackling', 'composure', 'anticipation'], description: 'Free defender who sweeps and initiates attacks' },
  { role: 'full_back', label: 'Full-Back', positions: ['LB', 'RB'], duties: ['defend', 'support', 'attack'], keyAttributes: ['tackling', 'stamina', 'crossing', 'positioning', 'workRate'], description: 'Defends wide areas, supports attacks' },
  { role: 'wing_back', label: 'Wing-Back', positions: ['LB', 'RB'], duties: ['support', 'attack'], keyAttributes: ['stamina', 'crossing', 'pace', 'dribbling', 'workRate'], description: 'Provides width, attacks relentlessly' },
  { role: 'inverted_wing_back', label: 'Inverted Wing-Back', positions: ['LB', 'RB'], duties: ['defend', 'support'], keyAttributes: ['passing', 'tackling', 'decisions', 'stamina', 'positioning'], description: 'Tucks inside to form midfield shape' },
  { role: 'complete_wing_back', label: 'Complete Wing-Back', positions: ['LB', 'RB'], duties: ['support', 'attack'], keyAttributes: ['stamina', 'crossing', 'dribbling', 'tackling', 'pace'], description: 'Elite two-way wide player' },
  { role: 'defensive_midfielder', label: 'Defensive Midfielder', positions: ['CDM'], duties: ['defend', 'support'], keyAttributes: ['tackling', 'positioning', 'marking', 'workRate', 'aggression'], description: 'Shields the back four, breaks up play' },
  { role: 'anchor', label: 'Anchor', positions: ['CDM'], duties: ['defend'], keyAttributes: ['positioning', 'tackling', 'concentration', 'marking', 'strength'], description: 'Sits deep, holds position, recycles possession' },
  { role: 'half_back', label: 'Half-Back', positions: ['CDM'], duties: ['defend'], keyAttributes: ['tackling', 'positioning', 'passing', 'concentration', 'decisions'], description: 'Drops between CBs to build, shields defence' },
  { role: 'deep_lying_playmaker', label: 'Deep-Lying Playmaker', positions: ['CDM', 'CM'], duties: ['defend', 'support'], keyAttributes: ['passing', 'vision', 'firstTouch', 'composure', 'decisions'], description: 'Dictates tempo from deep with range of passing' },
  { role: 'regista', label: 'Regista', positions: ['CDM'], duties: ['support'], keyAttributes: ['passing', 'vision', 'technique', 'flair', 'firstTouch'], description: 'Creative hub from deep, high risk/reward' },
  { role: 'roaming_playmaker', label: 'Roaming Playmaker', positions: ['CDM', 'CM'], duties: ['support'], keyAttributes: ['passing', 'vision', 'dribbling', 'offTheBall', 'stamina'], description: 'Drifts into space to create, high freedom' },
  { role: 'segundo_volante', label: 'Segundo Volante', positions: ['CDM'], duties: ['support', 'attack'], keyAttributes: ['stamina', 'passing', 'longShots', 'offTheBall', 'workRate'], description: 'Arrives late into the box from deep' },
  { role: 'central_midfielder', label: 'Central Midfielder', positions: ['CM'], duties: ['defend', 'support', 'attack'], keyAttributes: ['passing', 'tackling', 'stamina', 'workRate', 'decisions'], description: 'All-round midfielder, balanced duties' },
  { role: 'box_to_box', label: 'Box-to-Box Midfielder', positions: ['CM'], duties: ['support'], keyAttributes: ['stamina', 'workRate', 'passing', 'tackling', 'longShots'], description: 'Covers every blade of grass, contributes both ends' },
  { role: 'carrilero', label: 'Carrilero', positions: ['CM'], duties: ['support'], keyAttributes: ['stamina', 'tackling', 'workRate', 'positioning', 'passing'], description: 'Shuttles wide to cover for attacking full-backs' },
  { role: 'mezzala', label: 'Mezzala', positions: ['CM'], duties: ['support', 'attack'], keyAttributes: ['dribbling', 'passing', 'offTheBall', 'technique', 'flair'], description: 'Drifts wide into half-spaces to create' },
  { role: 'advanced_playmaker', label: 'Advanced Playmaker', positions: ['CAM', 'CM'], duties: ['support', 'attack'], keyAttributes: ['passing', 'vision', 'firstTouch', 'flair', 'composure'], description: 'Creative force in the final third' },
  { role: 'attacking_midfielder', label: 'Attacking Midfielder', positions: ['CAM'], duties: ['support', 'attack'], keyAttributes: ['passing', 'finishing', 'offTheBall', 'technique', 'vision'], description: 'Links midfield and attack, scores and creates' },
  { role: 'trequartista', label: 'Trequartista', positions: ['CAM', 'ST'], duties: ['attack'], keyAttributes: ['flair', 'technique', 'passing', 'dribbling', 'offTheBall'], description: 'Pure creator, minimal defensive work' },
  { role: 'shadow_striker', label: 'Shadow Striker', positions: ['CAM'], duties: ['attack'], keyAttributes: ['offTheBall', 'finishing', 'acceleration', 'aggression', 'composure'], description: 'Presses aggressively, arrives in the box late' },
  { role: 'winger', label: 'Winger', positions: ['LW', 'RW'], duties: ['support', 'attack'], keyAttributes: ['pace', 'dribbling', 'crossing', 'acceleration', 'flair'], description: 'Hugs the touchline, beats man, delivers crosses' },
  { role: 'inverted_winger', label: 'Inverted Winger', positions: ['LW', 'RW'], duties: ['support', 'attack'], keyAttributes: ['dribbling', 'finishing', 'technique', 'cuttingInside' as never, 'flair'], description: 'Cuts inside onto stronger foot to shoot/create' },
  { role: 'wide_playmaker', label: 'Wide Playmaker', positions: ['LW', 'RW'], duties: ['support'], keyAttributes: ['passing', 'vision', 'crossing', 'firstTouch', 'decisions'], description: 'Creates from wide areas with passing range' },
  { role: 'wide_target_man', label: 'Wide Target Man', positions: ['LW', 'RW'], duties: ['support', 'attack'], keyAttributes: ['strength', 'heading', 'crossing', 'balance', 'bravery'], description: 'Wins aerial duels wide, channels long balls' },
  { role: 'striker', label: 'Striker', positions: ['ST'], duties: ['support', 'attack'], keyAttributes: ['finishing', 'offTheBall', 'composure', 'firstTouch', 'anticipation'], description: 'Main goal threat, leads the line' },
  { role: 'target_man', label: 'Target Man', positions: ['ST'], duties: ['support', 'attack'], keyAttributes: ['strength', 'heading', 'jumpingReach', 'bravery', 'balance'], description: 'Wins aerial duels, holds up play, channels balls' },
  { role: 'poacher', label: 'Poacher', positions: ['ST'], duties: ['attack'], keyAttributes: ['finishing', 'offTheBall', 'anticipation', 'composure', 'acceleration'], description: 'Lives on the shoulder, finishes chances' },
  { role: 'advanced_forward', label: 'Advanced Forward', positions: ['ST'], duties: ['attack'], keyAttributes: ['pace', 'finishing', 'offTheBall', 'acceleration', 'composure'], description: 'Runs in behind, stretches defences' },
  { role: 'complete_forward', label: 'Complete Forward', positions: ['ST'], duties: ['support', 'attack'], keyAttributes: ['finishing', 'passing', 'dribbling', 'strength', 'offTheBall'], description: 'Does everything: scores, creates, links, presses' },
  { role: 'deep_lying_forward', label: 'Deep-Lying Forward', positions: ['ST'], duties: ['support', 'attack'], keyAttributes: ['passing', 'firstTouch', 'vision', 'strength', 'technique'], description: 'Drops deep to link play, creates for others' },
  { role: 'false_nine', label: 'False Nine', positions: ['ST'], duties: ['support'], keyAttributes: ['passing', 'dribbling', 'vision', 'firstTouch', 'offTheBall'], description: 'Drops into midfield, drags CBs out of position' },
  { role: 'pressing_forward', label: 'Pressing Forward', positions: ['ST'], duties: ['defend', 'support', 'attack'], keyAttributes: ['workRate', 'aggression', 'stamina', 'pace', 'anticipation'], description: 'First line of press, harasses defenders' },
];

export function getRolesForPosition(position: Position): RoleDefinition[] {
  return ROLE_DEFINITIONS.filter((r) => r.positions.includes(position));
}

export function computeRoleSuitability(role: PlayerRole, attrs: PlayerAttributes): number {
  const def = ROLE_DEFINITIONS.find((r) => r.role === role);
  if (!def) return 0;
  const keyVals = def.keyAttributes.map((k) => attrs[k] ?? 0);
  const avg = keyVals.reduce((s, v) => s + v, 0) / keyVals.length;
  // Convert 1-20 attribute average to 1-99 overall scale
  return Math.min(99, Math.max(1, Math.round(avg * 5)));
}

export function getDutyModifier(duty: Duty): { attack: number; defend: number; width: number } {
  switch (duty) {
    case 'attack': return { attack: 1.25, defend: 0.7, width: 1.1 };
    case 'support': return { attack: 1.0, defend: 1.0, width: 1.0 };
    case 'defend': return { attack: 0.7, defend: 1.3, width: 0.9 };
  }
}

export function computeOverall(attrs: PlayerAttributes, position: Position): number {
  const relevantRoles = getRolesForPosition(position);
  if (relevantRoles.length === 0) return 50;
  const bestRole = relevantRoles.reduce((best, r) => {
    const score = computeRoleSuitability(r.role, attrs);
    return score > best.score ? { score, role: r } : best;
  }, { score: 0, role: relevantRoles[0] });
  return bestRole.score;
}

export type Footedness = 'left' | 'right' | 'both';

export type Personality =
  | 'model_citizen' | 'professional' | 'resolute' | 'spirited'
  | 'balanced' | 'casual' | 'unambitious' | 'volatile';

export interface HiddenAttributes {
  consistency: number;
  bigGames: number;
  versatility: number;
  adaptability: number;
  ambition: number;
  loyalty: number;
  pressure: number;
  professionalism: number;
  sportsmanship: number;
  temperament: number;
  injuryProneness: number;
}

export interface Player {
  id: string;
  name: string;
  age: number;
  nationality: string;
  secondNationality?: string;
  position: Position;
  role: PlayerRole;
  duty: Duty;
  attributes: PlayerAttributes;
  hidden: HiddenAttributes;
  personality: Personality;
  footedness: Footedness;
  height: number;
  weight: number;
  overall: number;
  potentialAbility: number;
  currentAbility: number;
  value: number;
  wage: number;
  contractExpiry: number;
  form: number;
  fitness: number;
  morale: number;
  reputation: number;
  goals: number;
  assists: number;
  appearances: number;
  yellowCards: number;
  redCards: number;
  traits: string[];
}
