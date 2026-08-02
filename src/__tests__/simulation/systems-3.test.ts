import { describe, it, expect } from 'vitest';
import { generateFreeAgents, generateYouthProspects, offerTrial, evaluateTrialPerformance, shouldOfferContractAfterTrial, createSellOnClause, calculateSellOnFee, createReleaseClause, canTriggerReleaseClause, calculateTerminationCost, canTerminateContract, startWageNegotiation, negotiateWage, calculateAgentFee, calculateAgentWageCommission, createInstallmentPlan, proposeSwapDeal } from '../../simulation/systems-3';
import { generateTeam } from '../../data/generators';

describe('Systems-3: Free Agents', () => {
  it('generates the requested number of agents', () => {
    const agents = generateFreeAgents(10);
    expect(agents).toHaveLength(10);
  });

  it('generates players with valid attributes', () => {
    const agents = generateFreeAgents(5);
    agents.forEach((p) => {
      expect(p.overall).toBeGreaterThanOrEqual(40);
      expect(p.overall).toBeLessThanOrEqual(85);
      expect(p.age).toBeGreaterThanOrEqual(18);
      expect(p.age).toBeLessThanOrEqual(38);
      expect(p.name.length).toBeGreaterThan(0);
      expect(p.position).toBeTruthy();
    });
  });

  it('generates unique player ids', () => {
    const agents = generateFreeAgents(15);
    const ids = new Set(agents.map((p) => p.id));
    expect(ids.size).toBe(15);
  });
});

describe('Systems-3: Youth Prospects', () => {
  it('generates the requested number of prospects', () => {
    const prospects = generateYouthProspects(8);
    expect(prospects).toHaveLength(8);
  });

  it('generates young players with valid potential', () => {
    const prospects = generateYouthProspects(10);
    prospects.forEach((p) => {
      expect(p.age).toBeGreaterThanOrEqual(15);
      expect(p.age).toBeLessThanOrEqual(18);
      expect(p.potentialRating).toBeGreaterThanOrEqual(1);
      expect(p.potentialRating).toBeLessThanOrEqual(5);
      expect(p.cost).toBeGreaterThan(0);
    });
  });

  it('generates unique ids', () => {
    const prospects = generateYouthProspects(10);
    const ids = new Set(prospects.map((p) => p.id));
    expect(ids.size).toBe(10);
  });
});

describe('Systems-3: Trials', () => {
  const team = generateTeam(0, 65);

  it('creates a pending trial offer', () => {
    const player = generateFreeAgents(1)[0];
    const offer = offerTrial(player, team, 4);
    expect(offer.playerId).toBe(player.id);
    expect(offer.clubId).toBe(team.id);
    expect(offer.duration).toBe(4);
    expect(offer.status).toBe('pending');
  });

  it('evaluates trial performance in range', () => {
    const player = generateFreeAgents(1)[0];
    const rating = evaluateTrialPerformance(player);
    expect(rating).toBeGreaterThanOrEqual(1);
    expect(rating).toBeLessThanOrEqual(10);
  });

  it('recommends contract for high ratings', () => {
    expect(shouldOfferContractAfterTrial(8)).toBe(true);
    expect(shouldOfferContractAfterTrial(7)).toBe(true);
  });

  it('does not recommend for low ratings', () => {
    expect(shouldOfferContractAfterTrial(4)).toBe(false);
    expect(shouldOfferContractAfterTrial(3)).toBe(false);
  });
});

describe('Systems-3: Sell-On Clauses', () => {
  it('creates a sell-on clause', () => {
    const clause = createSellOnClause('p1', 'club1', 20);
    expect(clause.playerId).toBe('p1');
    expect(clause.sellingClubId).toBe('club1');
    expect(clause.percentage).toBe(20);
  });

  it('calculates sell-on fee', () => {
    const clause = createSellOnClause('p1', 'club1', 20);
    const fee = calculateSellOnFee(clause, 10_000_000);
    expect(fee).toBe(2_000_000);
  });
});

describe('Systems-3: Release Clauses', () => {
  const team = generateTeam(0, 65);

  it('creates a release clause', () => {
    const clause = createReleaseClause(team.players[0]);
    expect(clause.playerId).toBe(team.players[0].id);
    expect(clause.amount).toBeGreaterThan(0);
  });

  it('checks if buyer can trigger clause', () => {
    const clause = createReleaseClause(team.players[0]);
    expect(canTriggerReleaseClause(clause, clause.amount + 1)).toBe(true);
    expect(canTriggerReleaseClause(clause, clause.amount - 1)).toBe(false);
  });
});

describe('Systems-3: Contract Termination', () => {
  const team = generateTeam(0, 65);

  it('calculates termination cost', () => {
    const cost = calculateTerminationCost(team.players[0], 2);
    expect(cost).toBeGreaterThan(0);
  });

  it('allows termination with 1 year remaining', () => {
    expect(canTerminateContract(team.players[0], 1)).toBe(true);
  });

  it('blocks termination with many years remaining', () => {
    expect(canTerminateContract(team.players[0], 3)).toBe(false);
  });
});

describe('Systems-3: Wage Negotiation', () => {
  const team = generateTeam(0, 65);

  it('starts negotiation with player demands', () => {
    const neg = startWageNegotiation(team.players[0]);
    expect(neg.playerId).toBe(team.players[0].id);
    expect(neg.demandedWage).toBeGreaterThan(0);
    expect(neg.status).toBe('pending');
  });

  it('accepts when offer meets demand', () => {
    const neg = startWageNegotiation(team.players[0]);
    const result = negotiateWage(neg, neg.demandedWage);
    expect(result.status).toBe('accepted');
  });
});

describe('Systems-3: Agent Fees', () => {
  it('calculates agent fee as percentage of transfer', () => {
    const fee = calculateAgentFee(10_000_000);
    expect(fee).toBeGreaterThan(0);
    expect(fee).toBeLessThan(10_000_000);
  });

  it('calculates wage commission', () => {
    const commission = calculateAgentWageCommission(100_000);
    expect(commission).toBeGreaterThan(0);
    expect(commission).toBeLessThan(100_000);
  });
});

describe('Systems-3: Installment Plans', () => {
  it('creates installment plan', () => {
    const plan = createInstallmentPlan(20_000_000, 4, 1);
    expect(plan.installments).toHaveLength(4);
    expect(plan.totalFee).toBe(20_000_000);
    const total = plan.installments.reduce((s, i) => s + i.amount, 0);
    expect(total).toBe(20_000_000);
  });
});

describe('Systems-3: Swap Deals', () => {
  it('proposes a swap deal', () => {
    const teamA = generateTeam(0, 65);
    const teamB = generateTeam(1, 60);
    const deal = proposeSwapDeal(teamA.players[0], teamB.players[0], teamA, teamB);
    expect(deal.playerAId).toBe(teamA.players[0].id);
    expect(deal.playerBId).toBe(teamB.players[0].id);
  });
});
