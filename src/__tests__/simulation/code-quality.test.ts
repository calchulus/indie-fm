import { describe, it, expect } from 'vitest';
import { serializeState, deserializeState, saveToLocalStorage, loadFromLocalStorage, createHistory, pushHistory, undo, redo, validateTeamName, validateBudget, validateSquadSize, calculateVirtualWindow, getAriaLabel, KEYBOARD_NAV, translate, createError, trackEvent, trackMatchStarted } from '../../simulation/code-quality';

describe('Code Quality: Serialization', () => {
  it('serializes and deserializes roundtrip', () => {
    const data = { name: 'test', value: 42, nested: { arr: [1, 2, 3] } };
    const json = serializeState(data);
    const result = deserializeState<typeof data>(json);
    expect(result).toEqual(data);
  });

  it('deserializeState returns null for invalid JSON', () => {
    expect(deserializeState('not json')).toBeNull();
  });

  it('saveToLocalStorage and loadFromLocalStorage roundtrip', () => {
    const data = { test: true, value: 42 };
    saveToLocalStorage('test-key', data);
    const loaded = loadFromLocalStorage<typeof data>('test-key');
    expect(loaded).toEqual(data);
  });
});

describe('Code Quality: History (Undo/Redo)', () => {
  it('creates history with initial state', () => {
    const h = createHistory({ formation: '4-4-2' });
    expect(h.present).toEqual({ formation: '4-4-2' });
    expect(h.past).toHaveLength(0);
    expect(h.future).toHaveLength(0);
  });

  it('pushes state onto history', () => {
    let h = createHistory({ formation: '4-4-2' });
    h = pushHistory(h, { formation: '4-3-3' });
    expect(h.present).toEqual({ formation: '4-3-3' });
    expect(h.past).toHaveLength(1);
    expect(h.past[0]).toEqual({ formation: '4-4-2' });
  });

  it('undoes to previous state', () => {
    let h = createHistory({ formation: '4-4-2' });
    h = pushHistory(h, { formation: '4-3-3' });
    h = undo(h);
    expect(h.present).toEqual({ formation: '4-4-2' });
    expect(h.future).toHaveLength(1);
  });

  it('redoes after undo', () => {
    let h = createHistory({ formation: '4-4-2' });
    h = pushHistory(h, { formation: '4-3-3' });
    h = undo(h);
    h = redo(h);
    expect(h.present).toEqual({ formation: '4-3-3' });
    expect(h.future).toHaveLength(0);
  });

  it('clears future on new push after undo', () => {
    let h = createHistory({ formation: '4-4-2' });
    h = pushHistory(h, { formation: '4-3-3' });
    h = undo(h);
    h = pushHistory(h, { formation: '3-5-2' });
    expect(h.present).toEqual({ formation: '3-5-2' });
    expect(h.future).toHaveLength(0);
    expect(h.past).toHaveLength(1);
    expect(h.past[0]).toEqual({ formation: '4-4-2' });
  });

  it('undo on empty past returns same history', () => {
    const h = createHistory({ x: 1 });
    expect(undo(h)).toBe(h);
  });

  it('redo on empty future returns same history', () => {
    const h = createHistory({ x: 1 });
    expect(redo(h)).toBe(h);
  });

  it('supports multiple undo steps', () => {
    let h = createHistory(1);
    h = pushHistory(h, 2);
    h = pushHistory(h, 3);
    h = pushHistory(h, 4);
    h = undo(h);
    h = undo(h);
    expect(h.present).toBe(2);
    expect(h.past).toHaveLength(1);
    expect(h.future).toHaveLength(2);
  });
});

describe('Code Quality: Validation', () => {
  it('validates correct team name', () => {
    expect(validateTeamName('FC Barcelona').valid).toBe(true);
  });

  it('rejects empty team name', () => {
    expect(validateTeamName('').valid).toBe(false);
  });

  it('rejects too-long team name', () => {
    expect(validateTeamName('x'.repeat(51)).valid).toBe(false);
  });

  it('validates correct budget', () => {
    expect(validateBudget(10_000_000).valid).toBe(true);
  });

  it('rejects negative budget', () => {
    expect(validateBudget(-1).valid).toBe(false);
  });

  it('validates correct squad size', () => {
    expect(validateSquadSize(20).valid).toBe(true);
  });

  it('rejects too-large squad', () => {
    expect(validateSquadSize(50).valid).toBe(false);
  });
});

describe('Code Quality: Virtual Window', () => {
  it('calculates visible range', () => {
    const win = calculateVirtualWindow(0, 500, 40, 100);
    expect(win.startIndex).toBe(0);
    expect(win.endIndex).toBeGreaterThan(0);
    expect(win.visibleCount).toBeGreaterThan(0);
  });

  it('offsets start when scrolled', () => {
    const win = calculateVirtualWindow(400, 500, 40, 100);
    expect(win.startIndex).toBeGreaterThan(0);
  });

  it('clamps to total items', () => {
    const win = calculateVirtualWindow(0, 500, 40, 5);
    expect(win.endIndex).toBeLessThanOrEqual(5);
  });
});

describe('Code Quality: ARIA', () => {
  it('generates aria labels', () => {
    const label = getAriaLabel('match controls');
    expect(label.length).toBeGreaterThan(0);
  });

  it('includes context when provided', () => {
    const label = getAriaLabel('button', 'submit');
    expect(label).toContain('button');
  });
});

describe('Code Quality: i18n', () => {
  it('translates known keys to all languages', () => {
    expect(translate('nav.match', 'en')).toBe('Match');
    expect(translate('nav.match', 'es')).toBe('Partido');
    expect(translate('nav.match', 'fr')).toBe('Match');
    expect(translate('nav.match', 'de')).toBe('Spiel');
  });

  it('falls back to key for unknown keys', () => {
    expect(translate('unknown.key', 'en')).toBe('unknown.key');
  });
});

describe('Code Quality: Keyboard Nav', () => {
  it('maps arrow keys to tab navigation', () => {
    expect(KEYBOARD_NAV['ArrowLeft'].action).toBe('prev_tab');
    expect(KEYBOARD_NAV['ArrowRight'].action).toBe('next_tab');
  });

  it('maps escape to close modal', () => {
    expect(KEYBOARD_NAV['Escape'].action).toBe('close_modal');
  });
});

describe('Code Quality: Error Handling', () => {
  it('creates error with correct structure', () => {
    const err = createError('E001', 'Something failed');
    expect(err.code).toBe('E001');
    expect(err.message).toBe('Something failed');
    expect(err.recoverable).toBe(true);
  });

  it('creates non-recoverable error', () => {
    const err = createError('E002', 'Fatal', false);
    expect(err.recoverable).toBe(false);
  });
});

describe('Code Quality: Analytics', () => {
  it('tracks events with properties', () => {
    const event = trackEvent('test_event', { key: 'value' });
    expect(event.event).toBe('test_event');
    expect(event.properties).toEqual({ key: 'value' });
    expect(event.timestamp).toBeGreaterThan(0);
  });

  it('tracks match started', () => {
    const event = trackMatchStarted('Team A', 'Team B');
    expect(event.event).toContain('match');
  });
});
