import { Player } from '../types';

export interface TraitEffect {
  trait: string;
  shotBonus: number;
  passBonus: number;
  dribbleBonus: number;
  defendBonus: number;
  mentalBonus: number;
}

const TRAIT_EFFECTS: Record<string, TraitEffect> = {
  'Likes to try long range shots': { trait: 'long_shots', shotBonus: 0.08, passBonus: 0, dribbleBonus: 0, defendBonus: 0, mentalBonus: 0 },
  'Shoots from distance': { trait: 'long_shots', shotBonus: 0.07, passBonus: 0, dribbleBonus: 0, defendBonus: 0, mentalBonus: 0 },
  'Tries first time shots': { trait: 'first_time', shotBonus: 0.05, passBonus: 0, dribbleBonus: 0, defendBonus: 0, mentalBonus: 0.02 },
  'Likes to lob keeper': { trait: 'lob', shotBonus: 0.04, passBonus: 0, dribbleBonus: 0, defendBonus: 0, mentalBonus: 0.03 },
  'Plays one-twos': { trait: 'one_twos', shotBonus: 0, passBonus: 0.06, dribbleBonus: 0.03, defendBonus: 0, mentalBonus: 0 },
  'Plays through balls': { trait: 'through_balls', shotBonus: 0, passBonus: 0.07, dribbleBonus: 0, defendBonus: 0, mentalBonus: 0.02 },
  'Likes to switch ball': { trait: 'switch', shotBonus: 0, passBonus: 0.05, dribbleBonus: 0, defendBonus: 0, mentalBonus: 0 },
  'Comes deep to get ball': { trait: 'deep', shotBonus: 0, passBonus: 0.04, dribbleBonus: 0.02, defendBonus: 0.02, mentalBonus: 0 },
  'Runs with ball often': { trait: 'runs', shotBonus: 0, passBonus: 0, dribbleBonus: 0.08, defendBonus: 0, mentalBonus: 0 },
  'Cuts inside': { trait: 'cuts_inside', shotBonus: 0.04, passBonus: 0, dribbleBonus: 0.05, defendBonus: 0, mentalBonus: 0 },
  'Hugs the line': { trait: 'wide', shotBonus: 0, passBonus: 0.04, dribbleBonus: 0.04, defendBonus: 0, mentalBonus: 0 },
  'Dives into tackles': { trait: 'aggressive_tackle', shotBonus: 0, passBonus: 0, dribbleBonus: 0, defendBonus: 0.08, mentalBonus: -0.02 },
  'Marks opponent tightly': { trait: 'tight_mark', shotBonus: 0, passBonus: 0, dribbleBonus: 0, defendBonus: 0.07, mentalBonus: 0.02 },
  'Tries to beat offside trap': { trait: 'offside', shotBonus: 0.05, passBonus: 0, dribbleBonus: 0.03, defendBonus: 0, mentalBonus: 0.02 },
  'Gets into opposition area': { trait: 'box_runs', shotBonus: 0.05, passBonus: 0, dribbleBonus: 0.02, defendBonus: 0, mentalBonus: 0 },
  'Makes late runs into the box': { trait: 'late_runs', shotBonus: 0.06, passBonus: 0, dribbleBonus: 0, defendBonus: 0, mentalBonus: 0.02 },
  'Tracks back defensively': { trait: 'tracks_back', shotBonus: 0, passBonus: 0, dribbleBonus: 0, defendBonus: 0.06, mentalBonus: 0.02 },
  'Leaders on the pitch': { trait: 'leader', shotBonus: 0, passBonus: 0.02, dribbleBonus: 0, defendBonus: 0.02, mentalBonus: 0.06 },
  'Plays with back to goal': { trait: 'hold_up', shotBonus: 0.02, passBonus: 0.04, dribbleBonus: 0, defendBonus: 0, mentalBonus: 0.02 },
  'Tries to play way out of trouble': { trait: 'play_out', shotBonus: 0, passBonus: 0.05, dribbleBonus: 0.04, defendBonus: 0, mentalBonus: 0.02 },
  'Possesses long flat throw': { trait: 'long_throw', shotBonus: 0, passBonus: 0.06, dribbleBonus: 0, defendBonus: 0, mentalBonus: 0 },
  'Curls ball': { trait: 'curl', shotBonus: 0.05, passBonus: 0.03, dribbleBonus: 0, defendBonus: 0, mentalBonus: 0 },
  'Knocks ball past opponent': { trait: 'knock_past', shotBonus: 0, passBonus: 0, dribbleBonus: 0.07, defendBonus: 0, mentalBonus: 0 },
  'Tends to hold up the ball': { trait: 'hold_up', shotBonus: 0.02, passBonus: 0.03, dribbleBonus: 0, defendBonus: 0.02, mentalBonus: 0 },
  'Winds up opponents': { trait: 'wind_up', shotBonus: 0, passBonus: 0, dribbleBonus: 0.03, defendBonus: 0, mentalBonus: -0.03 },
  'Argues with officials': { trait: 'argues', shotBonus: 0, passBonus: 0, dribbleBonus: 0, defendBonus: -0.02, mentalBonus: -0.04 },
  'Retains possession rather than risk pass': { trait: 'safe', shotBonus: -0.02, passBonus: 0.05, dribbleBonus: 0, defendBonus: 0.02, mentalBonus: 0.02 },
  'Pushes forward at every opportunity': { trait: 'push_forward', shotBonus: 0.03, passBonus: 0.02, dribbleBonus: 0.03, defendBonus: -0.03, mentalBonus: 0 },
  'Sits on shoulder of last defender': { trait: 'shoulder', shotBonus: 0.06, passBonus: 0, dribbleBonus: 0.02, defendBonus: 0, mentalBonus: 0 },
  'Drops deep to collect ball from defence': { trait: 'deep_collect', shotBonus: 0, passBonus: 0.05, dribbleBonus: 0.02, defendBonus: 0.03, mentalBonus: 0 },
  'Likes to try skills and tricks': { trait: 'skills', shotBonus: 0.02, passBonus: 0, dribbleBonus: 0.07, defendBonus: 0, mentalBonus: 0 },
  'Plays the final ball': { trait: 'final_ball', shotBonus: 0, passBonus: 0.08, dribbleBonus: 0, defendBonus: 0, mentalBonus: 0.02 },
  'Likes to close down opponents': { trait: 'close_down', shotBonus: 0, passBonus: 0, dribbleBonus: 0, defendBonus: 0.07, mentalBonus: 0.02 },
  'Plays short corners': { trait: 'short_corners', shotBonus: 0, passBonus: 0.04, dribbleBonus: 0, defendBonus: 0, mentalBonus: 0 },
  'Stays back at set pieces': { trait: 'stays_back', shotBonus: 0, passBonus: 0, dribbleBonus: 0, defendBonus: 0.05, mentalBonus: 0.02 },
  'Tries overhead kicks': { trait: 'overhead', shotBonus: 0.04, passBonus: 0, dribbleBonus: 0, defendBonus: 0, mentalBonus: 0.02 },
  'Comes short to link play': { trait: 'link_play', shotBonus: 0, passBonus: 0.06, dribbleBonus: 0.02, defendBonus: 0, mentalBonus: 0 },
  'Likes to round keeper': { trait: 'round_keeper', shotBonus: 0.05, passBonus: 0, dribbleBonus: 0.04, defendBonus: 0, mentalBonus: 0 },
};

export function getTraitEffects(player: Player): TraitEffect[] {
  return player.traits
    .map((t) => TRAIT_EFFECTS[t])
    .filter((e): e is TraitEffect => e !== undefined);
}

export function computeTraitBonus(player: Player, category: 'shot' | 'pass' | 'dribble' | 'defend' | 'mental'): number {
  const effects = getTraitEffects(player);
  return effects.reduce((sum, e) => {
    switch (category) {
      case 'shot': return sum + e.shotBonus;
      case 'pass': return sum + e.passBonus;
      case 'dribble': return sum + e.dribbleBonus;
      case 'defend': return sum + e.defendBonus;
      case 'mental': return sum + e.mentalBonus;
    }
  }, 0);
}

export function getTraitSummary(player: Player): string[] {
  const effects = getTraitEffects(player);
  const bonuses: string[] = [];
  const shot = effects.reduce((s, e) => s + e.shotBonus, 0);
  const pass = effects.reduce((s, e) => s + e.passBonus, 0);
  const dribble = effects.reduce((s, e) => s + e.dribbleBonus, 0);
  const defend = effects.reduce((s, e) => s + e.defendBonus, 0);
  const mental = effects.reduce((s, e) => s + e.mentalBonus, 0);

  if (shot > 0.05) bonuses.push(`+${Math.round(shot * 100)}% shooting`);
  if (pass > 0.05) bonuses.push(`+${Math.round(pass * 100)}% passing`);
  if (dribble > 0.05) bonuses.push(`+${Math.round(dribble * 100)}% dribbling`);
  if (defend > 0.05) bonuses.push(`+${Math.round(defend * 100)}% defending`);
  if (mental > 0.05) bonuses.push(`+${Math.round(mental * 100)}% mental`);
  if (mental < -0.02) bonuses.push(`${Math.round(mental * 100)}% discipline`);

  return bonuses;
}
