// Weather effects on gameplay — modifies match engine calculations
// Rain reduces pass accuracy, wind affects shots, snow slows everything

export type WeatherCondition = 'clear' | 'cloudy' | 'rain' | 'heavy_rain' | 'snow' | 'wind';

export interface WeatherEffects {
  passAccuracyMod: number;   // Multiplier on pass success
  shotAccuracyMod: number;   // Multiplier on shot on-target chance
  dribbleMod: number;        // Multiplier on dribble success
  staminaDrainMod: number;   // Multiplier on stamina drain rate
  ballSpeedMod: number;      // Multiplier on ball movement speed
  description: string;
}

const WEATHER_EFFECTS: Record<WeatherCondition, WeatherEffects> = {
  clear: {
    passAccuracyMod: 1.0, shotAccuracyMod: 1.0, dribbleMod: 1.0,
    staminaDrainMod: 1.0, ballSpeedMod: 1.0,
    description: 'Perfect conditions. No impact on play.',
  },
  cloudy: {
    passAccuracyMod: 1.0, shotAccuracyMod: 1.0, dribbleMod: 1.0,
    staminaDrainMod: 1.0, ballSpeedMod: 1.0,
    description: 'Overcast but dry. No impact on play.',
  },
  rain: {
    passAccuracyMod: 0.88, shotAccuracyMod: 0.92, dribbleMod: 0.85,
    staminaDrainMod: 1.12, ballSpeedMod: 1.15,
    description: 'Rain makes the pitch slippery. Passes and dribbles less reliable, ball skids faster.',
  },
  heavy_rain: {
    passAccuracyMod: 0.75, shotAccuracyMod: 0.82, dribbleMod: 0.70,
    staminaDrainMod: 1.25, ballSpeedMod: 1.3,
    description: 'Torrential rain. Pitch is waterlogged — passing and dribbling severely impaired.',
  },
  snow: {
    passAccuracyMod: 0.80, shotAccuracyMod: 0.85, dribbleMod: 0.75,
    staminaDrainMod: 1.3, ballSpeedMod: 0.7,
    description: 'Snow covers the pitch. Ball slows down, players tire faster, footing uncertain.',
  },
  wind: {
    passAccuracyMod: 0.85, shotAccuracyMod: 0.78, dribbleMod: 0.92,
    staminaDrainMod: 1.15, ballSpeedMod: 1.2,
    description: 'Strong wind affects long passes and shots. Ball trajectory unpredictable.',
  },
};

export function getWeatherEffects(condition: WeatherCondition): WeatherEffects {
  return WEATHER_EFFECTS[condition];
}

export function generateMatchWeather(): WeatherCondition {
  const roll = Math.random();
  if (roll < 0.40) return 'clear';
  if (roll < 0.60) return 'cloudy';
  if (roll < 0.75) return 'rain';
  if (roll < 0.83) return 'heavy_rain';
  if (roll < 0.90) return 'snow';
  return 'wind';
}

// Apply weather modifiers to a base pass success rate
export function applyWeatherToPass(baseSuccess: number, condition: WeatherCondition): number {
  return Math.min(0.98, baseSuccess * getWeatherEffects(condition).passAccuracyMod);
}

// Apply weather modifiers to a base shot accuracy
export function applyWeatherToShot(baseAccuracy: number, condition: WeatherCondition): number {
  return Math.min(0.95, baseAccuracy * getWeatherEffects(condition).shotAccuracyMod);
}

// Apply weather modifiers to a base dribble success
export function applyWeatherToDribble(baseSuccess: number, condition: WeatherCondition): number {
  return Math.min(0.95, baseSuccess * getWeatherEffects(condition).dribbleMod);
}
