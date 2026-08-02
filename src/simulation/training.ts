import { Player, Team } from '../types';
import { StaffMember, getCoachingQuality } from './staff';

export type TrainingCategory =
  | 'general'
  | 'attacking'
  | 'defending'
  | 'technical'
  | 'tactical'
  | 'physical'
  | 'set_pieces'
  | 'match_preparation';

export type TrainingIntensity = 'light' | 'normal' | 'heavy' | 'double';

export interface TrainingSchedule {
  day: string;
  morning: TrainingCategory | 'rest';
  afternoon: TrainingCategory | 'rest';
}

export interface IndividualTrainingFocus {
  playerId: string;
  focus: 'position' | 'role' | 'attribute' | 'weak_foot' | 'traits';
  target?: string;
  progress: number;
}

export interface TrainingState {
  schedule: TrainingSchedule[];
  intensity: TrainingIntensity;
  individualFocus: IndividualTrainingFocus[];
  familiarity: number;
  weeklyRating: number;
}

const DEFAULT_SCHEDULE: TrainingSchedule[] = [
  { day: 'Monday', morning: 'physical', afternoon: 'technical' },
  { day: 'Tuesday', morning: 'attacking', afternoon: 'tactical' },
  { day: 'Wednesday', morning: 'defending', afternoon: 'set_pieces' },
  { day: 'Thursday', morning: 'match_preparation', afternoon: 'rest' },
  { day: 'Friday', morning: 'general', afternoon: 'rest' },
  { day: 'Saturday', morning: 'rest', afternoon: 'rest' },
  { day: 'Sunday', morning: 'rest', afternoon: 'rest' },
];

export function createTrainingState(): TrainingState {
  return {
    schedule: DEFAULT_SCHEDULE,
    intensity: 'normal',
    individualFocus: [],
    familiarity: 50,
    weeklyRating: 6,
  };
}

export function processWeeklyTraining(
  team: Team,
  training: TrainingState,
  staff: StaffMember[],
): { players: Player[]; training: TrainingState } {
  const intensityMod = getIntensityModifier(training.intensity);
  const attackQuality = getCoachingQuality(staff, 'attacking');
  const defendQuality = getCoachingQuality(staff, 'defending');
  const fitnessQuality = getCoachingQuality(staff, 'fitness');
  const techQuality = getCoachingQuality(staff, 'technical');
  const avgQuality = (attackQuality + defendQuality + fitnessQuality + techQuality) / 4;

  const updatedPlayers = team.players.map((player) => {
    if (player.age > 30) return player;

    const updated = { ...player, attributes: { ...player.attributes } };
    const growthChance = (avgQuality / 20) * intensityMod * 0.15;

    if (player.age <= 24 && Math.random() < growthChance) {
      const focus = training.individualFocus.find((f) => f.playerId === player.id);
      if (focus?.focus === 'attribute' && focus.target) {
        const key = focus.target as keyof typeof updated.attributes;
        if (key in updated.attributes) {
          updated.attributes[key] = Math.min(20, updated.attributes[key] + 1);
        }
      } else {
        const attrs = Object.keys(updated.attributes) as Array<keyof typeof updated.attributes>;
        const randomAttr = attrs[Math.floor(Math.random() * attrs.length)];
        updated.attributes[randomAttr] = Math.min(20, updated.attributes[randomAttr] + 1);
      }
    }

    return updated;
  });

  const familiarityGain = 0.5 + (avgQuality / 20) * 1.5;
  const newFamiliarity = Math.min(100, training.familiarity + familiarityGain);

  const weeklyRating = Math.round(Math.min(10, (avgQuality / 20) * 7 + intensityMod * 1.5 + Math.random() * 1.5));

  return {
    players: updatedPlayers,
    training: { ...training, familiarity: newFamiliarity, weeklyRating },
  };
}

function getIntensityModifier(intensity: TrainingIntensity): number {
  switch (intensity) {
    case 'light': return 0.6;
    case 'normal': return 1.0;
    case 'heavy': return 1.4;
    case 'double': return 1.8;
  }
}

export function getFamiliarityLabel(familiarity: number): string {
  if (familiarity >= 90) return 'Fluid';
  if (familiarity >= 70) return 'Accomplished';
  if (familiarity >= 50) return 'Reasonable';
  if (familiarity >= 30) return 'Awkward';
  return 'Unfamiliar';
}

export function getTrainingLoadWarning(players: Player[]): string | null {
  const lowFitness = players.filter((p) => p.fitness < 60);
  if (lowFitness.length >= 4) return '⚠️ Multiple players have low fitness. Consider lighter training.';
  if (lowFitness.length >= 2) return 'Some players are fatigued. Monitor workload.';
  return null;
}

export function retrainPosition(player: Player, newPosition: Player['position']): IndividualTrainingFocus {
  return {
    playerId: player.id,
    focus: 'position',
    target: newPosition,
    progress: 0,
  };
}
