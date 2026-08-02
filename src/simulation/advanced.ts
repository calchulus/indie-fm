import { Team } from '../types';

export type Weather = 'clear' | 'cloudy' | 'rain' | 'heavy_rain' | 'snow' | 'wind';

export interface WeatherState {
  condition: Weather;
  intensity: number;
  temperature: number;
  windSpeed: number;
}

export interface SetPieceConfig {
  cornerTakerId?: string;
  freeKickTakerId?: string;
  penaltyTakerId?: string;
  cornerTarget: 'near_post' | 'far_post' | 'short' | 'mixed';
  freeKickStyle: 'direct' | 'cross' | 'short';
}

export interface FatigueState {
  playerId: string;
  stamina: number;
  matchFatigue: number;
}

export interface ChemistryLink {
  playerAId: string;
  playerBId: string;
  strength: number;
}

export function generateWeather(): WeatherState {
  const roll = Math.random();
  let condition: Weather;
  if (roll < 0.4) condition = 'clear';
  else if (roll < 0.6) condition = 'cloudy';
  else if (roll < 0.75) condition = 'rain';
  else if (roll < 0.85) condition = 'heavy_rain';
  else if (roll < 0.92) condition = 'wind';
  else condition = 'snow';

  return {
    condition,
    intensity: 0.3 + Math.random() * 0.7,
    temperature: Math.round(5 + Math.random() * 25),
    windSpeed: condition === 'wind' ? 20 + Math.random() * 30 : Math.random() * 15,
  };
}

export function getWeatherModifiers(weather: WeatherState): {
  passAccuracy: number;
  ballSpeed: number;
  shotAccuracy: number;
  staminaDrain: number;
} {
  switch (weather.condition) {
    case 'heavy_rain':
      return { passAccuracy: 0.8, ballSpeed: 1.15, shotAccuracy: 0.85, staminaDrain: 1.3 };
    case 'rain':
      return { passAccuracy: 0.9, ballSpeed: 1.08, shotAccuracy: 0.92, staminaDrain: 1.15 };
    case 'snow':
      return { passAccuracy: 0.75, ballSpeed: 0.85, shotAccuracy: 0.8, staminaDrain: 1.4 };
    case 'wind':
      return { passAccuracy: 0.85, ballSpeed: 1.0, shotAccuracy: 0.82, staminaDrain: 1.1 };
    default:
      return { passAccuracy: 1.0, ballSpeed: 1.0, shotAccuracy: 1.0, staminaDrain: 1.0 };
  }
}

export function initFatigueState(team: Team): FatigueState[] {
  return team.players.slice(0, 11).map((p) => ({
    playerId: p.id,
    stamina: p.attributes.stamina,
    matchFatigue: 0,
  }));
}

export function updateFatigue(fatigue: FatigueState[], minute: number, weather: WeatherState): FatigueState[] {
  const weatherMod = getWeatherModifiers(weather).staminaDrain;
  return fatigue.map((f) => {
    const drainRate = (0.4 + (minute / 90) * 0.3) * weatherMod;
    const newFatigue = Math.min(100, f.matchFatigue + drainRate);
    return { ...f, matchFatigue: newFatigue };
  });
}

export function getFatiguePenalty(fatigue: FatigueState[], playerId: string): number {
  const f = fatigue.find((ft) => ft.playerId === playerId);
  if (!f) return 1.0;
  if (f.matchFatigue < 50) return 1.0;
  if (f.matchFatigue < 75) return 0.92;
  if (f.matchFatigue < 90) return 0.82;
  return 0.7;
}

export function computeChemistry(team: Team): number {
  const starters = team.players.slice(0, 11);
  let chemistry = 50;

  const nationalities = new Map<string, number>();
  for (const p of starters) {
    nationalities.set(p.nationality, (nationalities.get(p.nationality) ?? 0) + 1);
  }
  const maxShared = Math.max(...nationalities.values());
  chemistry += maxShared * 3;

  const avgAge = starters.reduce((s, p) => s + p.age, 0) / starters.length;
  if (avgAge >= 25 && avgAge <= 30) chemistry += 10;

  const avgMorale = starters.reduce((s, p) => s + p.morale, 0) / starters.length;
  chemistry += Math.round((avgMorale - 5) * 3);

  const avgForm = starters.reduce((s, p) => s + p.form, 0) / starters.length;
  chemistry += Math.round((avgForm - 5) * 2);

  return Math.max(1, Math.min(100, chemistry));
}

export function getChemistryModifier(chemistry: number): number {
  if (chemistry >= 80) return 1.1;
  if (chemistry >= 60) return 1.05;
  if (chemistry >= 40) return 1.0;
  if (chemistry >= 20) return 0.95;
  return 0.9;
}

export function resolveSetPiece(
  type: 'corner' | 'free_kick' | 'penalty',
  attackingTeam: Team,
  defendingTeam: Team,
  config: SetPieceConfig,
  weather: WeatherState,
): { goal: boolean; scorerId?: string; description: string } {
  const weatherMod = getWeatherModifiers(weather);
  const attackers = attackingTeam.players.filter((p) => ['ST', 'CB', 'CAM', 'CM'].includes(p.position));
  const scorer = attackers[Math.floor(Math.random() * attackers.length)] ?? attackingTeam.players[9];

  let goalChance: number;
  switch (type) {
    case 'penalty':
      goalChance = 0.76 * weatherMod.shotAccuracy;
      break;
    case 'corner':
      goalChance = 0.04 * (config.cornerTarget === 'near_post' ? 1.2 : 1.0);
      break;
    case 'free_kick':
      goalChance = config.freeKickStyle === 'direct' ? 0.06 : 0.03;
      break;
  }

  const isGoal = Math.random() < goalChance;
  if (isGoal) {
    return {
      goal: true,
      scorerId: type === 'penalty' ? config.penaltyTakerId ?? scorer.id : scorer.id,
      description: type === 'penalty'
        ? `Penalty converted by ${scorer.name}!`
        : type === 'corner'
          ? `${scorer.name} heads in from the corner!`
          : `${scorer.name} scores from the free kick!`,
    };
  }

  return {
    goal: false,
    description: type === 'penalty'
      ? `Penalty saved!`
      : type === 'corner'
        ? `Corner cleared by ${defendingTeam.name}`
        : `Free kick comes to nothing`,
  };
}

export interface VARReview {
  type: 'goal' | 'penalty' | 'red_card' | 'offside';
  originalDecision: string;
  overturned: boolean;
  description: string;
}

export function simulateVAR(review: VARReview): VARReview {
  const overturnChance = review.type === 'offside' ? 0.3 : 0.15;
  const overturned = Math.random() < overturnChance;
  return {
    ...review,
    overturned,
    description: overturned
      ? `VAR: Decision overturned! ${review.originalDecision} → reversed`
      : `VAR: Decision confirmed. ${review.originalDecision} stands`,
  };
}
