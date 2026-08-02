import { describe, it, expect } from 'vitest';
import { generateTeam } from '../../data/generators';
import { Team } from '../../types';

// Test the tactical analysis logic
function avgAttr(team: Team, keys: string[]): number {
  const starters = team.players.slice(0, 11);
  const vals = starters.map((p) => {
    const attrs = p.attributes as unknown as Record<string, number>;
    return keys.reduce((s, k) => s + (attrs[k] ?? 0), 0) / keys.length;
  });
  return vals.reduce((s, v) => s + v, 0) / vals.length;
}

describe('Tactical Analysis', () => {
  const strongTeam = generateTeam(0, 78);
  const weakTeam = generateTeam(1, 45);

  it('computes average attributes for a team', () => {
    const avg = avgAttr(strongTeam, ['finishing', 'offTheBall', 'composure']);
    expect(avg).toBeGreaterThan(0);
    expect(avg).toBeLessThanOrEqual(20);
  });

  it('strong team has higher attack than weak team', () => {
    const strongAtk = avgAttr(strongTeam, ['finishing', 'offTheBall', 'composure']);
    const weakAtk = avgAttr(weakTeam, ['finishing', 'offTheBall', 'composure']);
    expect(strongAtk).toBeGreaterThan(weakAtk);
  });

  it('strong team has higher defense than weak team', () => {
    const strongDef = avgAttr(strongTeam, ['marking', 'tackling', 'positioning']);
    const weakDef = avgAttr(weakTeam, ['marking', 'tackling', 'positioning']);
    expect(strongDef).toBeGreaterThan(weakDef);
  });

  it('strong team has higher midfield than weak team', () => {
    const strongMid = avgAttr(strongTeam, ['passing', 'vision', 'technique']);
    const weakMid = avgAttr(weakTeam, ['passing', 'vision', 'technique']);
    expect(strongMid).toBeGreaterThan(weakMid);
  });

  it('avgAttr handles missing attributes gracefully', () => {
    const avg = avgAttr(strongTeam, ['nonexistent_attr']);
    expect(avg).toBe(0);
  });

  it('avgAttr returns consistent results', () => {
    const avg1 = avgAttr(strongTeam, ['pace', 'acceleration']);
    const avg2 = avgAttr(strongTeam, ['pace', 'acceleration']);
    expect(avg1).toBe(avg2);
  });
});
