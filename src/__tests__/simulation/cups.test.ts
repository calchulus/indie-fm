import { describe, it, expect } from 'vitest';
import { createCup, simulateCupRound, simulateFullCup } from '../../simulation/cups';
import { generateLeague } from '../../data/generators';

describe('Cup Competitions', () => {
  const league = generateLeague(16);
  const teamIds = league.teams.map((t) => t.id);

  it('creates a cup with correct first round fixtures', () => {
    const cup = createCup('Test Cup', teamIds);
    expect(cup.name).toBe('Test Cup');
    expect(cup.rounds).toHaveLength(1);
    expect(cup.rounds[0].fixtures.length).toBe(8);
    expect(cup.currentRoundIndex).toBe(0);
  });

  it('simulates a round and produces winners', () => {
    const cup = createCup('Test Cup', teamIds);
    const { cup: updated, results } = simulateCupRound(cup, league.teams);

    expect(results.length).toBeGreaterThan(0);
    expect(updated.rounds[0].played).toBe(true);

    const winners = updated.rounds[0].fixtures.filter((f) => f.winnerId);
    expect(winners.length).toBe(8);
  });

  it('handles extra time and penalties for draws', () => {
    const cup = createCup('Test Cup', teamIds);
    const { cup: updated } = simulateCupRound(cup, league.teams);

    const drawnFixtures = updated.rounds[0].fixtures.filter(
      (f) => f.played && f.homeGoals === f.awayGoals && f.awayTeamId
    );
    for (const f of drawnFixtures) {
      expect(f.extraTime || f.penalties).toBeTruthy();
      expect(f.winnerId).toBeTruthy();
    }
  });

  it('simulates full cup to a winner', () => {
    const cup = createCup('Test Cup', teamIds);
    const final = simulateFullCup(cup, league.teams);

    expect(final.winnerId).toBeTruthy();
    expect(teamIds).toContain(final.winnerId);
  });

  it('halves the number of teams each round', () => {
    const cup = createCup('Test Cup', teamIds);
    let current = cup;
    let prevWinners = 16;

    for (let i = 0; i < 4 && !current.winnerId; i++) {
      const { cup: updated } = simulateCupRound(current, league.teams);
      current = updated;
      if (current.rounds.length > 1) {
        const lastRound = current.rounds[current.rounds.length - 1];
        const activeFixtures = lastRound.fixtures.filter((f) => f.awayTeamId);
        expect(activeFixtures.length).toBeLessThanOrEqual(prevWinners / 2);
        prevWinners = activeFixtures.length * 2;
      }
    }
  });
});
