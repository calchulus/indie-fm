import { describe, it, expect } from 'vitest';
import { processRound } from '../../simulation/orchestrator';
import { generateLeague } from '../../data/generators';
import { createBoardState } from '../../simulation/board';
import { createFinances } from '../../simulation/board';
import { createFanSentiment } from '../../simulation/media';
import { createTrainingState } from '../../simulation/training';
import { generateDefaultBackroom } from '../../simulation/staff';
import { createMentoringGroups } from '../../simulation/dynamics';
import { simulateRoundFast } from '../../simulation/fastmatch';

describe('Round Orchestrator', () => {
  const league = generateLeague(20);
  const userTeamId = league.teams[0].id;
  const userTeam = league.teams[0];
  const board = createBoardState(userTeam, 10);
  const finances = createFinances(userTeam);
  const fanSentiment = createFanSentiment(userTeam);
  const training = createTrainingState();
  const staff = generateDefaultBackroom();
  const mentoringGroups = createMentoringGroups(userTeam);

  it('processes a round without errors', () => {
    const { fixtures, results } = simulateRoundFast(league.teams, league.fixtures, 1, userTeamId);
    const updatedLeague = { ...league, fixtures, currentRound: 2 };

    const matchResults = results.map((r) => ({
      fixtureId: r.fixtureId,
      homeTeamId: r.homeTeamId,
      awayTeamId: r.awayTeamId,
      homeGoals: r.homeGoals,
      awayGoals: r.awayGoals,
    }));

    const result = processRound(
      updatedLeague, userTeamId, matchResults,
      board, finances, fanSentiment, training, staff, [], [], mentoringGroups,
    );

    expect(result.league).toBeDefined();
    expect(result.board).toBeDefined();
    expect(result.finances).toBeDefined();
    expect(result.fanSentiment).toBeDefined();
    expect(result.training).toBeDefined();
    expect(result.injuries).toBeDefined();
  });

  it('updates board confidence after a round', () => {
    const { fixtures, results } = simulateRoundFast(league.teams, league.fixtures, 1, userTeamId);
    const updatedLeague = { ...league, fixtures, currentRound: 2 };
    const matchResults = results.map((r) => ({
      fixtureId: r.fixtureId, homeTeamId: r.homeTeamId, awayTeamId: r.awayTeamId,
      homeGoals: r.homeGoals, awayGoals: r.awayGoals,
    }));

    const result = processRound(
      updatedLeague, userTeamId, matchResults,
      board, finances, fanSentiment, training, staff, [], [], mentoringGroups,
    );

    expect(result.board.confidence).toBeGreaterThanOrEqual(0);
    expect(result.board.confidence).toBeLessThanOrEqual(100);
  });

  it('updates finances after a round', () => {
    const { fixtures, results } = simulateRoundFast(league.teams, league.fixtures, 1, userTeamId);
    const updatedLeague = { ...league, fixtures, currentRound: 2 };
    const matchResults = results.map((r) => ({
      fixtureId: r.fixtureId, homeTeamId: r.homeTeamId, awayTeamId: r.awayTeamId,
      homeGoals: r.homeGoals, awayGoals: r.awayGoals,
    }));

    const result = processRound(
      updatedLeague, userTeamId, matchResults,
      board, finances, fanSentiment, training, staff, [], [], mentoringGroups,
    );

    expect(result.finances.records.length).toBe(1);
    expect(result.finances.balance).not.toBe(finances.balance);
  });

  it('increases training familiarity after a round', () => {
    const { fixtures, results } = simulateRoundFast(league.teams, league.fixtures, 1, userTeamId);
    const updatedLeague = { ...league, fixtures, currentRound: 2 };
    const matchResults = results.map((r) => ({
      fixtureId: r.fixtureId, homeTeamId: r.homeTeamId, awayTeamId: r.awayTeamId,
      homeGoals: r.homeGoals, awayGoals: r.awayGoals,
    }));

    const result = processRound(
      updatedLeague, userTeamId, matchResults,
      board, finances, fanSentiment, training, staff, [], [], mentoringGroups,
    );

    expect(result.training.familiarity).toBeGreaterThan(training.familiarity);
  });

  it('generates news items', () => {
    const { fixtures, results } = simulateRoundFast(league.teams, league.fixtures, 1, userTeamId);
    const updatedLeague = { ...league, fixtures, currentRound: 2 };
    const matchResults = results.map((r) => ({
      fixtureId: r.fixtureId, homeTeamId: r.homeTeamId, awayTeamId: r.awayTeamId,
      homeGoals: r.homeGoals, awayGoals: r.awayGoals,
    }));

    const result = processRound(
      updatedLeague, userTeamId, matchResults,
      board, finances, fanSentiment, training, staff, [], [], mentoringGroups,
    );

    expect(Array.isArray(result.news)).toBe(true);
  });
});
