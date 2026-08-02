import { describe, it, expect } from 'vitest';
import { simulateRound, simulateSeason, getSortedStandings, getFormGuide } from '../../simulation/season';
import { generateLeague } from '../../data/generators';

describe('Season Simulation', () => {
  it('simulates a round and updates standings', () => {
    const league = generateLeague(20);
    const { league: updated, results } = simulateRound(league);

    expect(results.length).toBeGreaterThan(0);
    expect(updated.currentRound).toBe(2);

    const playedStandings = updated.standings.filter((s) => s.played > 0);
    expect(playedStandings.length).toBe(20);

    for (const s of updated.standings) {
      expect(s.played).toBe(1);
      expect(s.points).toBeGreaterThanOrEqual(0);
      expect(s.won + s.drawn + s.lost).toBe(1);
    }
  });

  it('awards 3 points for a win, 1 for a draw', () => {
    const league = generateLeague(20);
    const { league: updated } = simulateRound(league);

    for (const s of updated.standings) {
      expect(s.points).toBe(s.won * 3 + s.drawn);
    }
  });

  it('simulates full season without errors', () => {
    const league = generateLeague(20);
    const { league: final, allResults } = simulateSeason(league);

    expect(allResults.length).toBeGreaterThan(0);
    for (const s of final.standings) {
      expect(s.played).toBeGreaterThan(0);
    }
  }, 30000);

  it('sorts standings by points then goal difference', () => {
    const league = generateLeague(20);
    const { league: final } = simulateSeason(league);
    const sorted = getSortedStandings(final.standings);

    for (let i = 0; i < sorted.length - 1; i++) {
      if (sorted[i].points === sorted[i + 1].points) {
        const gdA = sorted[i].goalsFor - sorted[i].goalsAgainst;
        const gdB = sorted[i + 1].goalsFor - sorted[i + 1].goalsAgainst;
        expect(gdA).toBeGreaterThanOrEqual(gdB);
      } else {
        expect(sorted[i].points).toBeGreaterThan(sorted[i + 1].points);
      }
    }
  }, 30000);

  it('returns form guide as W/D/L strings', () => {
    const league = generateLeague(20);
    const { league: updated } = simulateRound(league);
    const teamId = updated.teams[0].id;
    const form = getFormGuide(updated, teamId, 5);

    expect(form.length).toBeLessThanOrEqual(5);
    for (const result of form) {
      expect(['W', 'D', 'L']).toContain(result);
    }
  });
});
