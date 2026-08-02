import { describe, it, expect } from 'vitest';
import { adaptTactics, shouldAdapt } from '../../simulation/aiadaptation';
import { generateTeam } from '../../data/generators';

describe('AI Tactical Adaptation', () => {
  const team = generateTeam(0, 65);

  it('shouldAdapt returns true every 10 minutes', () => {
    expect(shouldAdapt(10)).toBe(true);
    expect(shouldAdapt(20)).toBe(true);
    expect(shouldAdapt(30)).toBe(true);
    expect(shouldAdapt(15)).toBe(false);
    expect(shouldAdapt(0)).toBe(false);
  });

  it('switches to attacking when losing late', () => {
    const tactics = adaptTactics(team, -1, 70);
    expect(tactics.mentality).toBe('attacking');
    expect(tactics.pressing).toBe('high');
  });

  it('switches to defensive when winning late', () => {
    const tactics = adaptTactics(team, 1, 75);
    expect(tactics.mentality).toBe('defensive');
    expect(tactics.pressing).toBe('low');
  });

  it('stays balanced when drawing early', () => {
    const tactics = adaptTactics(team, 0, 20);
    expect(tactics.mentality).toBe(team.tactics.mentality);
  });

  it('pushes forward when drawing very late', () => {
    const tactics = adaptTactics(team, 0, 80);
    expect(tactics.mentality).toBe('attacking');
  });

  it('does not mutate the original team', () => {
    const original = { ...team.tactics };
    adaptTactics(team, -2, 80);
    expect(team.tactics).toEqual(original);
  });
});
