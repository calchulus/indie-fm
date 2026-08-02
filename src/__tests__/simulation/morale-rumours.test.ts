import { describe, it, expect } from 'vitest';
import { computeMoraleReasons, getMoraleLabel } from '../../simulation/morale';
import { generateTransferRumours, getLikelihoodColor, getLikelihoodLabel } from '../../simulation/rumours';
import { generatePlayer, generateLeague } from '../../data/generators';

describe('Player Morale', () => {
  const player = generatePlayer('ST', 70);

  it('returns positive reason for regular starters', () => {
    const reasons = computeMoraleReasons(player, {
      isStarter: true, recentResults: ['W', 'W', 'D'], contractYearsLeft: 3, teamPosition: 5, totalTeams: 20,
    });
    const playingTime = reasons.find((r) => r.factor === 'Playing Time');
    expect(playingTime?.impact).toBeGreaterThan(0);
  });

  it('returns negative reason for non-starters', () => {
    const reasons = computeMoraleReasons(player, {
      isStarter: false, recentResults: ['L', 'L', 'D'], contractYearsLeft: 2, teamPosition: 10, totalTeams: 20,
    });
    const playingTime = reasons.find((r) => r.factor === 'Playing Time');
    expect(playingTime?.impact).toBeLessThan(0);
  });

  it('detects winning streak', () => {
    const reasons = computeMoraleReasons(player, {
      isStarter: true, recentResults: ['W', 'W', 'W', 'D'], contractYearsLeft: 2, teamPosition: 3, totalTeams: 20,
    });
    const results = reasons.find((r) => r.factor === 'Results');
    expect(results?.impact).toBeGreaterThan(0);
  });

  it('detects poor run of form', () => {
    const reasons = computeMoraleReasons(player, {
      isStarter: true, recentResults: ['L', 'L', 'L', 'D'], contractYearsLeft: 2, teamPosition: 15, totalTeams: 20,
    });
    const results = reasons.find((r) => r.factor === 'Results');
    expect(results?.impact).toBeLessThan(0);
  });

  it('detects contract expiry concern', () => {
    const reasons = computeMoraleReasons(player, {
      isStarter: true, recentResults: ['W'], contractYearsLeft: 0, teamPosition: 5, totalTeams: 20,
    });
    const contract = reasons.find((r) => r.factor === 'Contract');
    expect(contract?.impact).toBeLessThan(0);
  });

  it('detects title challenge excitement', () => {
    const reasons = computeMoraleReasons(player, {
      isStarter: true, recentResults: ['W'], contractYearsLeft: 3, teamPosition: 2, totalTeams: 20,
    });
    const ambition = reasons.find((r) => r.factor === 'Ambition');
    expect(ambition?.impact).toBeGreaterThan(0);
  });

  it('detects relegation battle concern', () => {
    const reasons = computeMoraleReasons(player, {
      isStarter: true, recentResults: ['L'], contractYearsLeft: 2, teamPosition: 19, totalTeams: 20,
    });
    const ambition = reasons.find((r) => r.factor === 'Ambition');
    expect(ambition?.impact).toBeLessThan(0);
  });

  it('returns correct morale labels', () => {
    expect(getMoraleLabel(10).label).toBe('Ecstatic');
    expect(getMoraleLabel(7).label).toBe('Happy');
    expect(getMoraleLabel(5).label).toBe('Content');
    expect(getMoraleLabel(3).label).toBe('Unhappy');
    expect(getMoraleLabel(1).label).toBe('Miserable');
  });
});

describe('Transfer Rumours', () => {
  const league = generateLeague(20);

  it('generates the requested number of rumours', () => {
    const rumours = generateTransferRumours(league, league.teams[0].id, 8);
    expect(rumours).toHaveLength(8);
  });

  it('each rumour has required fields', () => {
    const rumours = generateTransferRumours(league, league.teams[0].id, 5);
    for (const r of rumours) {
      expect(r.playerName).toBeTruthy();
      expect(r.fromClub).toBeTruthy();
      expect(r.toClub).toBeTruthy();
      expect(r.fee).toBeTruthy();
      expect(['confirmed', 'likely', 'possible', 'unlikely', 'speculation']).toContain(r.likelihood);
    }
  });

  it('from and to clubs are different', () => {
    const rumours = generateTransferRumours(league, league.teams[0].id, 10);
    for (const r of rumours) {
      expect(r.fromClub).not.toBe(r.toClub);
    }
  });

  it('returns correct likelihood colors', () => {
    expect(getLikelihoodColor('confirmed')).toBe('#4ade80');
    expect(getLikelihoodColor('speculation')).toBe('#888');
  });

  it('returns correct likelihood labels', () => {
    expect(getLikelihoodLabel('confirmed')).toContain('Done Deal');
    expect(getLikelihoodLabel('speculation')).toContain('Speculation');
  });
});
