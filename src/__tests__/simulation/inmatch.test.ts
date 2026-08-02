import { describe, it, expect } from 'vitest';
import { getShoutEffect, canSubstitute, getSuggestedSubs, applySubstitution, applyInMatchTactics, applyFormationChange, getHalfTimeTalkOptions } from '../../simulation/inmatch';
import { initMatchState } from '../../simulation/engine';
import { generateTeam } from '../../data/generators';

describe('In-Match Systems', () => {
  const home = generateTeam(0, 65);
  const away = generateTeam(1, 65);

  describe('getShoutEffect', () => {
    it('returns correct effect for encourage', () => {
      const effect = getShoutEffect('encourage');
      expect(effect.moraleBoost).toBe(1);
      expect(effect.attackMod).toBeGreaterThan(1);
      expect(effect.duration).toBeGreaterThan(0);
    });

    it('returns correct effect for sit_deeper', () => {
      const effect = getShoutEffect('sit_deeper');
      expect(effect.attackMod).toBeLessThan(1);
      expect(effect.defendMod).toBeGreaterThan(1);
    });

    it('all shouts have valid structure', () => {
      const shouts = ['encourage', 'demand_more', 'get_creative', 'hustle', 'sit_deeper', 'push_forward', 'waste_time', 'get_stuck_in'] as const;
      shouts.forEach((s) => {
        const effect = getShoutEffect(s);
        expect(effect.shout).toBe(s);
        expect(effect.duration).toBeGreaterThan(0);
        expect(effect.attackMod).toBeGreaterThan(0);
        expect(effect.defendMod).toBeGreaterThan(0);
      });
    });
  });

  describe('canSubstitute', () => {
    it('allows subs during first half', () => {
      let state = initMatchState(home, away);
      state = { ...state, status: 'first_half', minute: 20 };
      expect(canSubstitute(state, home.id, 0)).toBe(true);
    });

    it('blocks subs at full time', () => {
      let state = initMatchState(home, away);
      state = { ...state, status: 'full_time', minute: 90 };
      expect(canSubstitute(state, home.id, 0)).toBe(false);
    });

    it('blocks subs after 5 used', () => {
      let state = initMatchState(home, away);
      state = { ...state, status: 'first_half', minute: 20 };
      expect(canSubstitute(state, home.id, 5)).toBe(false);
    });

    it('allows up to 5 subs', () => {
      let state = initMatchState(home, away);
      state = { ...state, status: 'second_half', minute: 60 };
      expect(canSubstitute(state, home.id, 4)).toBe(true);
    });
  });

  describe('applySubstitution', () => {
    it('swaps players in the lineup', () => {
      const state = initMatchState(home, away);
      const offId = home.players[0].id;
      const onId = home.players[11].id;
      const { team: updated } = applySubstitution(state, home, offId, onId);
      expect(updated.players[0].id).toBe(onId);
      expect(updated.players[11].id).toBe(offId);
    });

    it('does nothing for invalid sub (bench to bench)', () => {
      const state = initMatchState(home, away);
      const { team: updated } = applySubstitution(state, home, home.players[11].id, home.players[12].id);
      expect(updated.players[11].id).toBe(home.players[11].id);
    });
  });

  describe('applyInMatchTactics', () => {
    it('updates mentality', () => {
      const updated = applyInMatchTactics(home, { mentality: 'defensive' });
      expect(updated.tactics.mentality).toBe('defensive');
    });

    it('preserves other tactics', () => {
      const original = home.tactics.formation;
      const updated = applyInMatchTactics(home, { pressing: 'high' });
      expect(updated.tactics.formation).toBe(original);
      expect(updated.tactics.pressing).toBe('high');
    });
  });

  describe('applyFormationChange', () => {
    it('changes formation', () => {
      const updated = applyFormationChange(home, '3-5-2');
      expect(updated.tactics.formation).toBe('3-5-2');
    });
  });

  describe('getHalfTimeTalkOptions', () => {
    it('returns 3 options when winning', () => {
      const options = getHalfTimeTalkOptions(2);
      expect(options).toHaveLength(3);
      expect(options[0].id).toBe('keep_it_up');
    });

    it('returns 3 options when drawing', () => {
      const options = getHalfTimeTalkOptions(0);
      expect(options).toHaveLength(3);
      expect(options[0].id).toBe('encourage');
    });

    it('returns 3 options when losing', () => {
      const options = getHalfTimeTalkOptions(-1);
      expect(options).toHaveLength(3);
      expect(options[0].id).toBe('rally');
      expect(options[0].moraleEffect).toBe(2);
    });
  });

  describe('getSuggestedSubs', () => {
    it('suggests subs for fatigued players', () => {
      const fatiguedTeam = { ...home, players: home.players.map((p, i) => i === 0 ? { ...p, fitness: 30 } : p) };
      const state = { ...initMatchState(home, away), minute: 60, status: 'second_half' as const };
      const suggestions = getSuggestedSubs(fatiguedTeam, state);
      if (fatiguedTeam.players.slice(11).some((b) => b.position === fatiguedTeam.players[0].position)) {
        expect(suggestions.length).toBeGreaterThan(0);
        expect(suggestions[0].reason).toBe('Fatigued');
      }
    });
  });
});
