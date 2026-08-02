import { describe, it, expect } from 'vitest';
import { generateYouthIntake, getAcademyRating, getAcademyDescription, YouthAcademyConfig } from '../../simulation/youth-academy';
import { computeTeamOfTheWeek } from '../../simulation/teamofweek';
import { generateLeague } from '../../data/generators';
import { simulateRoundFast } from '../../simulation/fastmatch';

describe('Youth Academy', () => {
  const highConfig: YouthAcademyConfig = { facilityLevel: 5, coachingLevel: 5, investmentPerYear: 5_000_000 };
  const lowConfig: YouthAcademyConfig = { facilityLevel: 1, coachingLevel: 1, investmentPerYear: 500_000 };

  it('generates 2-4 players per intake', () => {
    const result = generateYouthIntake(highConfig);
    expect(result.players.length).toBeGreaterThanOrEqual(2);
    expect(result.players.length).toBeLessThanOrEqual(4);
  });

  it('high-level academy produces higher potential than low-level', () => {
    const highResults: number[] = [];
    const lowResults: number[] = [];
    for (let i = 0; i < 20; i++) {
      highResults.push(generateYouthIntake(highConfig).averagePotential);
      lowResults.push(generateYouthIntake(lowConfig).averagePotential);
    }
    const highAvg = highResults.reduce((s, v) => s + v, 0) / highResults.length;
    const lowAvg = lowResults.reduce((s, v) => s + v, 0) / lowResults.length;
    expect(highAvg).toBeGreaterThan(lowAvg);
  });

  it('youth players are aged 15-18', () => {
    const result = generateYouthIntake(highConfig);
    for (const p of result.players) {
      expect(p.age).toBeGreaterThanOrEqual(15);
      expect(p.age).toBeLessThanOrEqual(18);
    }
  });

  it('returns a quality label', () => {
    const result = generateYouthIntake(highConfig);
    expect(['Exceptional', 'Very Good', 'Good', 'Decent', 'Average']).toContain(result.quality);
  });

  it('computes academy rating from facility + coaching', () => {
    expect(getAcademyRating(highConfig)).toBe(100);
    expect(getAcademyRating(lowConfig)).toBe(20);
  });

  it('returns description for each level', () => {
    for (let i = 1; i <= 5; i++) {
      expect(getAcademyDescription(i).length).toBeGreaterThan(5);
    }
  });
});

describe('Team of the Week', () => {
  it('selects 11 players', () => {
    const league = generateLeague(20);
    const { results } = simulateRoundFast(league.teams, league.fixtures, 1, league.teams[0].id);
    const matchResults = results.map((r) => ({
      fixtureId: r.fixtureId, homeTeamId: r.homeTeamId, awayTeamId: r.awayTeamId,
      homeGoals: r.homeGoals, awayGoals: r.awayGoals,
    }));
    const totw = computeTeamOfTheWeek(league, matchResults, 1);
    expect(totw.players.length).toBe(11);
  });

  it('includes a goalkeeper', () => {
    const league = generateLeague(20);
    const { results } = simulateRoundFast(league.teams, league.fixtures, 1, league.teams[0].id);
    const matchResults = results.map((r) => ({
      fixtureId: r.fixtureId, homeTeamId: r.homeTeamId, awayTeamId: r.awayTeamId,
      homeGoals: r.homeGoals, awayGoals: r.awayGoals,
    }));
    const totw = computeTeamOfTheWeek(league, matchResults, 1);
    expect(totw.players.some((p) => p.position === 'GK')).toBe(true);
  });

  it('ratings are between 0 and 10', () => {
    const league = generateLeague(20);
    const { results } = simulateRoundFast(league.teams, league.fixtures, 1, league.teams[0].id);
    const matchResults = results.map((r) => ({
      fixtureId: r.fixtureId, homeTeamId: r.homeTeamId, awayTeamId: r.awayTeamId,
      homeGoals: r.homeGoals, awayGoals: r.awayGoals,
    }));
    const totw = computeTeamOfTheWeek(league, matchResults, 1);
    for (const p of totw.players) {
      expect(p.rating).toBeGreaterThanOrEqual(0);
      expect(p.rating).toBeLessThanOrEqual(10);
    }
  });

  it('records the correct round number', () => {
    const league = generateLeague(20);
    const { results } = simulateRoundFast(league.teams, league.fixtures, 1, league.teams[0].id);
    const matchResults = results.map((r) => ({
      fixtureId: r.fixtureId, homeTeamId: r.homeTeamId, awayTeamId: r.awayTeamId,
      homeGoals: r.homeGoals, awayGoals: r.awayGoals,
    }));
    const totw = computeTeamOfTheWeek(league, matchResults, 5);
    expect(totw.round).toBe(5);
  });
});
