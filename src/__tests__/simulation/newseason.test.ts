import { describe, it, expect } from 'vitest';
import { startNewSeason } from '../../simulation/newseason';
import { generateLeague } from '../../data/generators';

describe('New Season', () => {
  const league = generateLeague(20);

  it('resets fixtures for a new season', () => {
    const result = startNewSeason(league);
    expect(result.league.currentRound).toBe(1);
    expect(result.league.fixtures.every((f) => !f.played)).toBe(true);
  });

  it('resets standings to zero', () => {
    const result = startNewSeason(league);
    for (const s of result.league.standings) {
      expect(s.played).toBe(0);
      expect(s.points).toBe(0);
      expect(s.won).toBe(0);
    }
  });

  it('generates youth intake', () => {
    const result = startNewSeason(league);
    expect(result.youthIntake.length).toBeGreaterThan(0);
    expect(result.youthIntake.length).toBeLessThanOrEqual(80);
  });

  it('ages players by one year', () => {
    const originalAges = league.teams[0].players.map((p) => p.age);
    const result = startNewSeason(league);
    const newAges = result.league.teams[0].players
      .filter((p) => originalAges.includes(p.age - 1))
      .map((p) => p.age);
    expect(newAges.length).toBeGreaterThan(0);
  });

  it('resets player season stats', () => {
    const result = startNewSeason(league);
    for (const team of result.league.teams) {
      for (const player of team.players) {
        expect(player.goals).toBe(0);
        expect(player.assists).toBe(0);
        expect(player.appearances).toBe(0);
        expect(player.yellowCards).toBe(0);
      }
    }
  });

  it('maintains minimum squad size of 14', () => {
    const result = startNewSeason(league);
    for (const team of result.league.teams) {
      expect(team.players.length).toBeGreaterThanOrEqual(14);
    }
  });
});
