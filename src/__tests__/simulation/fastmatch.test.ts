import { describe, it, expect } from 'vitest';
import { simulateFastMatch } from '../../simulation/fastmatch';
import { generateTeam } from '../../data/generators';

describe('Fast Match Resolver', () => {
  const home = generateTeam(0, 70);
  const away = generateTeam(1, 60);

  it('produces non-negative goals', () => {
    for (let i = 0; i < 20; i++) {
      const result = simulateFastMatch(home, away);
      expect(result.homeGoals).toBeGreaterThanOrEqual(0);
      expect(result.awayGoals).toBeGreaterThanOrEqual(0);
    }
  });

  it('produces reasonable shot counts', () => {
    const result = simulateFastMatch(home, away);
    expect(result.homeShots).toBeGreaterThanOrEqual(0);
    expect(result.awayShots).toBeGreaterThanOrEqual(0);
    expect(result.homeShots).toBeLessThanOrEqual(30);
    expect(result.awayShots).toBeLessThanOrEqual(30);
  });

  it('possession sums to 100', () => {
    const result = simulateFastMatch(home, away);
    expect(result.homePossession).toBeGreaterThanOrEqual(20);
    expect(result.homePossession).toBeLessThanOrEqual(80);
  });

  it('stronger team scores more on average over many sims', () => {
    let homeTotal = 0;
    let awayTotal = 0;
    for (let i = 0; i < 100; i++) {
      const result = simulateFastMatch(home, away);
      homeTotal += result.homeGoals;
      awayTotal += result.awayGoals;
    }
    expect(homeTotal).toBeGreaterThan(awayTotal);
  });

  it('runs in under 1ms per match', () => {
    const start = performance.now();
    for (let i = 0; i < 1000; i++) {
      simulateFastMatch(home, away);
    }
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(1000);
  });
});
