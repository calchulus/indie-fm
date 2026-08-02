import { describe, it, expect } from 'vitest';
import { getCommentary } from '../../simulation/commentary';

describe('Commentary', () => {
  it('returns a string for every event type', () => {
    const types = ['goal', 'shot', 'save', 'tackle', 'foul', 'yellow_card', 'red_card', 'corner', 'pass'] as const;
    for (const type of types) {
      const result = getCommentary(type, 'Test Player');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    }
  });

  it('includes the player name in the output', () => {
    const result = getCommentary('goal', 'Marcus Silva');
    expect(result).toContain('Marcus Silva');
  });

  it('returns empty string for unknown event types', () => {
    const result = getCommentary('unknown_type' as never, 'Player');
    expect(result).toBe('');
  });

  it('produces varied output across multiple calls', () => {
    const results = new Set<string>();
    for (let i = 0; i < 20; i++) {
      results.add(getCommentary('goal', 'Test'));
    }
    expect(results.size).toBeGreaterThan(1);
  });
});
