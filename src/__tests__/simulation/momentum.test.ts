import { describe, it, expect } from 'vitest';
import { computeMomentum } from '../../simulation/momentum';

describe('Momentum', () => {
  it('returns even momentum with no events', () => {
    const result = computeMomentum([], 'home1', 1000);
    expect(result.home).toBe(50);
    expect(result.away).toBe(50);
    expect(result.dominant).toBe('even');
  });

  it('shows home dominance after home goals', () => {
    const events = [
      { type: 'goal', teamId: 'home1', tick: 900, outcome: 'success' },
      { type: 'goal', teamId: 'home1', tick: 950, outcome: 'success' },
      { type: 'shot', teamId: 'home1', tick: 960, outcome: 'success' },
    ];
    const result = computeMomentum(events, 'home1', 1000);
    expect(result.home).toBeGreaterThan(60);
    expect(result.dominant).toBe('home');
  });

  it('shows away dominance after away pressure', () => {
    const events = [
      { type: 'goal', teamId: 'away1', tick: 900, outcome: 'success' },
      { type: 'shot', teamId: 'away1', tick: 920, outcome: 'success' },
      { type: 'corner', teamId: 'away1', tick: 940, outcome: 'neutral' },
      { type: 'corner', teamId: 'away1', tick: 960, outcome: 'neutral' },
    ];
    const result = computeMomentum(events, 'home1', 1000);
    expect(result.away).toBeGreaterThan(60);
    expect(result.dominant).toBe('away');
  });

  it('ignores events outside the 5-minute window', () => {
    const events = [
      { type: 'goal', teamId: 'home1', tick: 100, outcome: 'success' },
      { type: 'goal', teamId: 'home1', tick: 200, outcome: 'success' },
    ];
    const result = computeMomentum(events, 'home1', 3000);
    expect(result.dominant).toBe('even');
  });

  it('home and away always sum to 100', () => {
    const events = [
      { type: 'shot', teamId: 'home1', tick: 900, outcome: 'success' },
      { type: 'tackle', teamId: 'away1', tick: 910, outcome: 'success' },
      { type: 'pass', teamId: 'home1', tick: 920, outcome: 'success' },
    ];
    const result = computeMomentum(events, 'home1', 1000);
    expect(result.home + result.away).toBe(100);
  });
});
