import { describe, it, expect } from 'vitest';
import { generateLeague, generatePlayer, generateTeam, generateSquad } from '../../data/generators';
import { ATTRIBUTE_GROUPS } from '../../types';

describe('Data Generators', () => {
  it('generates a league with correct team count', () => {
    const league = generateLeague(20);
    expect(league.teams).toHaveLength(20);
    expect(league.standings).toHaveLength(20);
    expect(league.fixtures.length).toBeGreaterThan(0);
    expect(league.currentRound).toBe(1);
  });

  it('generates a league with 10 teams', () => {
    const league = generateLeague(10);
    expect(league.teams).toHaveLength(10);
  });

  it('generates a player with all 45 attributes', () => {
    const player = generatePlayer('CM', 65);
    const allAttrs = [
      ...ATTRIBUTE_GROUPS.technical,
      ...ATTRIBUTE_GROUPS.mental,
      ...ATTRIBUTE_GROUPS.physical,
      ...ATTRIBUTE_GROUPS.goalkeeping,
    ];
    for (const attr of allAttrs) {
      expect(player.attributes[attr]).toBeDefined();
      expect(typeof player.attributes[attr]).toBe('number');
      expect(player.attributes[attr]).toBeGreaterThanOrEqual(1);
      expect(player.attributes[attr]).toBeLessThanOrEqual(20);
    }
  });

  it('generates a player with valid metadata', () => {
    const player = generatePlayer('ST', 70);
    expect(player.name.length).toBeGreaterThan(2);
    expect(player.age).toBeGreaterThanOrEqual(18);
    expect(player.age).toBeLessThanOrEqual(35);
    expect(player.nationality).toBeTruthy();
    expect(player.position).toBe('ST');
    expect(player.overall).toBeGreaterThanOrEqual(1);
    expect(player.overall).toBeLessThanOrEqual(99);
    expect(player.potentialAbility).toBeGreaterThanOrEqual(player.currentAbility);
    expect(player.height).toBeGreaterThanOrEqual(160);
    expect(player.height).toBeLessThanOrEqual(200);
    expect(['left', 'right', 'both']).toContain(player.footedness);
  });

  it('generates a squad with 16 players', () => {
    const squad = generateSquad(65, '4-4-2');
    expect(squad).toHaveLength(16);
    expect(squad.filter((p) => p.position === 'GK').length).toBeGreaterThanOrEqual(1);
  });

  it('generates a team with valid structure', () => {
    const team = generateTeam(0, 65);
    expect(team.name).toBeTruthy();
    expect(team.players.length).toBeGreaterThanOrEqual(11);
    expect(team.budget).toBeGreaterThan(0);
    expect(team.tactics.formation).toBeTruthy();
    expect(team.colors.primary).toMatch(/^#/);
  });

  it('generates fixtures covering all teams', () => {
    const league = generateLeague(20);
    const teamIds = new Set(league.teams.map((t) => t.id));
    for (const fixture of league.fixtures) {
      expect(teamIds.has(fixture.homeTeamId)).toBe(true);
      expect(teamIds.has(fixture.awayTeamId)).toBe(true);
      expect(fixture.homeTeamId).not.toBe(fixture.awayTeamId);
    }
  });
});
