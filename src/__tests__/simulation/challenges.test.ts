import { describe, it, expect } from 'vitest';
import { validateChallengeAction, checkUnbeatenConstraint, insertCustomClub } from '../../simulation/challenges';
import { generateLeague } from '../../data/generators';

describe('Challenge Constraints', () => {
  it('blocks transfers when noSignings is true', () => {
    const result = validateChallengeAction({ noSignings: true }, 'transfer');
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('No signings');
  });

  it('allows transfers when no constraints active', () => {
    const result = validateChallengeAction({}, 'transfer', { playerAge: 25, budget: 5_000_000 });
    expect(result.allowed).toBe(true);
  });

  it('blocks transfers over budget cap', () => {
    const result = validateChallengeAction({ maxBudget: 10_000_000 }, 'transfer', { budget: 15_000_000 });
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('Budget capped');
  });

  it('blocks transfers for players over 21 when youthOnly', () => {
    const result = validateChallengeAction({ youthOnly: true }, 'transfer', { playerAge: 25 });
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('21 or under');
  });

  it('allows transfers for players 21 or under when youthOnly', () => {
    const result = validateChallengeAction({ youthOnly: true }, 'transfer', { playerAge: 20 });
    expect(result.allowed).toBe(true);
  });

  it('blocks squad additions over max size', () => {
    const result = validateChallengeAction({ maxSquadSize: 16 }, 'squad_add', { squadSize: 16 });
    expect(result.allowed).toBe(false);
  });

  it('checks unbeaten constraint correctly', () => {
    const league = generateLeague(20);
    const userTeamId = league.teams[0].id;
    // No fixtures played — should be unbeaten
    expect(checkUnbeatenConstraint(league, userTeamId)).toBe(true);
  });
});

describe('Create-a-Club', () => {
  it('inserts a custom club into the league', () => {
    const league = generateLeague(20);
    const { league: updated, newTeamId } = insertCustomClub(
      league, 'Test FC', 'Testville', 'Test Park', 30000, 20_000_000,
      { primary: '#ff0000', secondary: '#ffffff' },
    );

    expect(updated.teams).toHaveLength(20);
    expect(updated.teams.some((t) => t.id === newTeamId)).toBe(true);
    const newTeam = updated.teams.find((t) => t.id === newTeamId);
    expect(newTeam?.name).toBe('Test FC');
    expect(newTeam?.players.length).toBeGreaterThanOrEqual(11);
  });
});
