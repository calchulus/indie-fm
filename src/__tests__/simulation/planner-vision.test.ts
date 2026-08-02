import { describe, it, expect } from 'vitest';
import { generateLeague } from '../../data/generators';
import { Position } from '../../types';

// Test the squad planner logic
function buildDepthChart(teams: ReturnType<typeof generateLeague>['teams'], teamId: string) {
  const team = teams.find((t) => t.id === teamId);
  if (!team) return [];

  const allPositions: Position[] = ['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'ST'];
  const posGroups: Record<string, typeof team.players> = {};
  for (const p of team.players) {
    if (!posGroups[p.position]) posGroups[p.position] = [];
    posGroups[p.position].push(p);
  }

  return allPositions.map((pos) => {
    const players = (posGroups[pos] ?? []).sort((a, b) => b.overall - a.overall);
    const topQuality = players[0]?.overall ?? 0;
    const quality = players.length === 0 ? 'missing' : topQuality >= 70 ? 'strong' : topQuality >= 50 ? 'adequate' : 'weak';
    return { position: pos, count: players.length, quality };
  });
}

describe('Squad Planner Logic', () => {
  const league = generateLeague(20);
  const teamId = league.teams[0].id;

  it('produces a depth entry for every position', () => {
    const chart = buildDepthChart(league.teams, teamId);
    expect(chart).toHaveLength(10);
  });

  it('every position has a quality rating', () => {
    const chart = buildDepthChart(league.teams, teamId);
    for (const entry of chart) {
      expect(['strong', 'adequate', 'weak', 'missing']).toContain(entry.quality);
    }
  });

  it('GK position has at least 1 player', () => {
    const chart = buildDepthChart(league.teams, teamId);
    const gk = chart.find((c) => c.position === 'GK');
    expect(gk?.count).toBeGreaterThanOrEqual(1);
  });

  it('total players across positions equals squad size', () => {
    const chart = buildDepthChart(league.teams, teamId);
    const total = chart.reduce((s, c) => s + c.count, 0);
    const team = league.teams.find((t) => t.id === teamId);
    expect(total).toBe(team?.players.length);
  });

  it('strong quality requires overall >= 70', () => {
    const chart = buildDepthChart(league.teams, teamId);
    const team = league.teams.find((t) => t.id === teamId);
    for (const entry of chart) {
      if (entry.quality === 'strong' && entry.count > 0) {
        const posPlayers = team!.players.filter((p) => p.position === entry.position);
        const maxOvr = Math.max(...posPlayers.map((p) => p.overall));
        expect(maxOvr).toBeGreaterThanOrEqual(70);
      }
    }
  });
});

describe('Club Vision Logic', () => {
  it('high reputation clubs have title expectations', () => {
    // This tests the philosophy text logic
    const philosophy = getClubPhilosophy(80);
    expect(philosophy).toContain('trophies');
  });

  it('low reputation clubs focus on survival', () => {
    const philosophy = getClubPhilosophy(25);
    expect(philosophy).toContain('survival');
  });

  it('mid reputation clubs focus on progress', () => {
    const philosophy = getClubPhilosophy(60);
    expect(philosophy).toContain('progress');
  });
});

function getClubPhilosophy(reputation: number): string {
  if (reputation >= 75) return 'A club with a proud history and global following. The board demands excellence — nothing less than trophies will satisfy the fans.';
  if (reputation >= 55) return 'An ambitious club with a passionate fanbase. The board wants to see progress towards the top of the table and attractive football.';
  if (reputation >= 35) return 'A club with potential and a loyal following. The board values stability and gradual improvement, with an eye on developing young talent.';
  return 'A club fighting to establish itself. The board prioritizes survival and building foundations for the future.';
}
