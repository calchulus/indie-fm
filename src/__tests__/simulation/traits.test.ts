import { describe, it, expect } from 'vitest';
import { computeTraitBonus, getTraitEffects, getTraitSummary } from '../../simulation/traits';
import { generatePlayer } from '../../data/generators';

describe('Player Traits', () => {
  it('returns empty effects for player with no traits', () => {
    const player = generatePlayer('CM', 65);
    player.traits = [];
    const effects = getTraitEffects(player);
    expect(effects).toHaveLength(0);
  });

  it('computes shot bonus for shooting traits', () => {
    const player = generatePlayer('ST', 70);
    player.traits = ['Likes to try long range shots', 'Tries first time shots'];
    const bonus = computeTraitBonus(player, 'shot');
    expect(bonus).toBeGreaterThan(0.1);
  });

  it('computes pass bonus for passing traits', () => {
    const player = generatePlayer('CM', 65);
    player.traits = ['Plays through balls', 'Plays one-twos'];
    const bonus = computeTraitBonus(player, 'pass');
    expect(bonus).toBeGreaterThan(0.1);
  });

  it('computes dribble bonus for dribbling traits', () => {
    const player = generatePlayer('LW', 68);
    player.traits = ['Runs with ball often', 'Cuts inside'];
    const bonus = computeTraitBonus(player, 'dribble');
    expect(bonus).toBeGreaterThan(0.1);
  });

  it('computes defend bonus for defensive traits', () => {
    const player = generatePlayer('CB', 70);
    player.traits = ['Marks opponent tightly', 'Dives into tackles'];
    const bonus = computeTraitBonus(player, 'defend');
    expect(bonus).toBeGreaterThan(0.1);
  });

  it('computes negative mental bonus for discipline traits', () => {
    const player = generatePlayer('ST', 65);
    player.traits = ['Argues with officials'];
    const bonus = computeTraitBonus(player, 'mental');
    expect(bonus).toBeLessThan(0);
  });

  it('returns trait summary strings', () => {
    const player = generatePlayer('ST', 70);
    player.traits = ['Likes to try long range shots', 'Plays through balls', 'Runs with ball often'];
    const summary = getTraitSummary(player);
    expect(summary.length).toBeGreaterThan(0);
    expect(summary.some((s) => s.includes('shooting'))).toBe(true);
  });

  it('handles unknown traits gracefully', () => {
    const player = generatePlayer('CM', 60);
    player.traits = ['Nonexistent trait', 'Another fake trait'];
    const effects = getTraitEffects(player);
    expect(effects).toHaveLength(0);
    const bonus = computeTraitBonus(player, 'shot');
    expect(bonus).toBe(0);
  });
});
