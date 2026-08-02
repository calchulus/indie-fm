import { describe, it, expect } from 'vitest';
import { getFormationSlots, getMentalityModifier, getPressingModifier, getTempoModifier } from '../../simulation/tactics';
import { PITCH_LENGTH, PITCH_WIDTH, Formation, DEFAULT_TACTICS } from '../../types';

describe('Tactics', () => {
  const formations: Formation[] = ['4-4-2', '4-3-3', '3-5-2', '4-2-3-1', '5-3-2'];

  it('returns 11 slots for every formation', () => {
    for (const f of formations) {
      const slots = getFormationSlots(f);
      expect(slots).toHaveLength(11);
    }
  });

  it('keeps all formation slots within pitch bounds', () => {
    for (const f of formations) {
      const slots = getFormationSlots(f);
      for (const slot of slots) {
        expect(slot.baseX).toBeGreaterThanOrEqual(0);
        expect(slot.baseX).toBeLessThanOrEqual(PITCH_LENGTH);
        expect(slot.baseY).toBeGreaterThanOrEqual(0);
        expect(slot.baseY).toBeLessThanOrEqual(PITCH_WIDTH);
      }
    }
  });

  it('has a goalkeeper as first slot', () => {
    for (const f of formations) {
      const slots = getFormationSlots(f);
      expect(slots[0].role).toBe('GK');
    }
  });

  it('mentality modifiers are symmetric around 1.0', () => {
    const atk = getMentalityModifier({ ...DEFAULT_TACTICS, mentality: 'attacking' });
    const def = getMentalityModifier({ ...DEFAULT_TACTICS, mentality: 'defensive' });
    const bal = getMentalityModifier({ ...DEFAULT_TACTICS, mentality: 'balanced' });

    expect(atk.attack).toBeGreaterThan(1);
    expect(def.defend).toBeGreaterThan(1);
    expect(bal.attack).toBe(1);
    expect(bal.defend).toBe(1);
  });

  it('pressing modifiers scale correctly', () => {
    expect(getPressingModifier({ ...DEFAULT_TACTICS, pressing: 'high' })).toBeGreaterThan(1);
    expect(getPressingModifier({ ...DEFAULT_TACTICS, pressing: 'low' })).toBeLessThan(1);
    expect(getPressingModifier({ ...DEFAULT_TACTICS, pressing: 'medium' })).toBe(1);
  });

  it('tempo modifiers scale correctly', () => {
    expect(getTempoModifier({ ...DEFAULT_TACTICS, tempo: 'fast' })).toBeGreaterThan(1);
    expect(getTempoModifier({ ...DEFAULT_TACTICS, tempo: 'slow' })).toBeLessThan(1);
    expect(getTempoModifier({ ...DEFAULT_TACTICS, tempo: 'normal' })).toBe(1);
  });
});
