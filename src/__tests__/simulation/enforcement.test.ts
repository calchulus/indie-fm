import { describe, it, expect } from 'vitest';
import { isTransferWindowOpen, getTransferWindowLabel, getExpiringContracts, removeExpiredContracts, getTotalWages, isOverWageBudget, canAffordPlayer, MAX_SQUAD_SIZE, isSquadFull, canSignPlayer } from '../../simulation/enforcement';
import { generateTeam, generatePlayer } from '../../data/generators';
import { Team } from '../../types';

describe('Enforcement Rules', () => {
  const team = generateTeam(0, 65);

  describe('Transfer window', () => {
    it('is open during summer window (rounds 1-4)', () => {
      expect(isTransferWindowOpen(1, 38)).toBe(true);
      expect(isTransferWindowOpen(4, 38)).toBe(true);
    });

    it('is open during winter window', () => {
      const mid = Math.floor(38 / 2);
      expect(isTransferWindowOpen(mid, 38)).toBe(true);
      expect(isTransferWindowOpen(mid - 2, 38)).toBe(true);
      expect(isTransferWindowOpen(mid + 2, 38)).toBe(true);
    });

    it('is closed outside windows', () => {
      expect(isTransferWindowOpen(10, 38)).toBe(false);
      expect(isTransferWindowOpen(30, 38)).toBe(false);
    });

    it('returns correct labels', () => {
      expect(getTransferWindowLabel(2, 38)).toContain('Summer');
      expect(getTransferWindowLabel(10, 38)).toContain('Closed');
    });
  });

  describe('Contract expiry', () => {
    it('finds expiring contracts', () => {
      const t: Team = {
        ...team,
        players: [
          { ...team.players[0], contractExpiry: 2026 },
          { ...team.players[1], contractExpiry: 2028 },
        ],
      };
      const expiring = getExpiringContracts(t, 2026);
      expect(expiring).toHaveLength(1);
      expect(expiring[0].contractExpiry).toBe(2026);
    });

    it('removes expired contracts and returns released players', () => {
      const t: Team = {
        ...team,
        players: [
          { ...team.players[0], contractExpiry: 2025 },
          { ...team.players[1], contractExpiry: 2028 },
          { ...team.players[2], contractExpiry: 2026 },
        ],
      };
      const { team: updated, released } = removeExpiredContracts(t, 2026);
      expect(released).toHaveLength(2);
      expect(updated.players).toHaveLength(1);
      expect(updated.players[0].contractExpiry).toBe(2028);
    });
  });

  describe('Wage budget', () => {
    it('calculates total wages', () => {
      const total = getTotalWages(team);
      expect(total).toBeGreaterThan(0);
      expect(total).toBe(team.players.reduce((s, p) => s + p.wage, 0));
    });

    it('detects over-budget', () => {
      expect(isOverWageBudget(team, 1)).toBe(true);
      expect(isOverWageBudget(team, 999_999_999)).toBe(false);
    });

    it('checks affordability', () => {
      const budget = getTotalWages(team) + 1000;
      expect(canAffordPlayer(team, 1000, budget)).toBe(true);
      expect(canAffordPlayer(team, 1001, budget)).toBe(false);
    });
  });

  describe('Squad size limit', () => {
    it('MAX_SQUAD_SIZE is 25', () => {
      expect(MAX_SQUAD_SIZE).toBe(25);
    });

    it('detects full squad', () => {
      const fullTeam: Team = { ...team, players: Array.from({ length: 25 }, (_, i) => generatePlayer(i, 'CM', 25)) };
      expect(isSquadFull(fullTeam)).toBe(true);
      expect(canSignPlayer(fullTeam)).toBe(false);
    });

    it('allows signing when under limit', () => {
      expect(isSquadFull(team)).toBe(false);
      expect(canSignPlayer(team)).toBe(true);
    });
  });
});
