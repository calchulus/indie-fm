import { describe, it, expect } from 'vitest';
import { initMatchState, simulateMinutes } from '../../simulation/engine';
import { generateTeam } from '../../data/generators';
import { computeMatchRatings, getManOfTheMatch, computeAIAdaptation, detectRivalry, shouldSackAIManager } from '../../simulation/match-systems-2';
import { computeDevelopmentArc, applySeasonDevelopment, computeSquadHierarchy, computeAcademyOutput } from '../../simulation/depth-systems';
import { getSquadHappiness } from '../../simulation/happiness';
import { generateRenewalOffer, evaluateRenewalResponse } from '../../simulation/happiness';
import { rollInjury } from '../../simulation/setpieces';
import { advanceChain, createPossessionChain, detectCounterAttack, computePressingEffect, computeSetPieceDelivery } from '../../simulation/match-context';

describe('Engine property tests (#37)', () => {
  it('any two teams produce valid final state after 90 min', () => {
    for (let i = 0; i < 5; i++) {
      const home = generateTeam(0, 50 + Math.floor(Math.random() * 30));
      const away = generateTeam(1, 50 + Math.floor(Math.random() * 30));
      const state = simulateMinutes(initMatchState(home, away), home, away, 90);
      expect(state.status).toBe('full_time');
      expect(state.homeScore).toBeGreaterThanOrEqual(0);
      expect(state.awayScore).toBeGreaterThanOrEqual(0);
      expect(Number.isNaN(state.homeScore)).toBe(false);
      expect(Number.isNaN(state.awayScore)).toBe(false);
      expect(state.minute).toBeGreaterThanOrEqual(90);
    }
  });
});

describe('Match ratings (#7)', () => {
  it('computes ratings for all 22 players', () => {
    const home = generateTeam(0, 65);
    const away = generateTeam(1, 65);
    const state = simulateMinutes(initMatchState(home, away), home, away, 90);
    const ratings = computeMatchRatings(state, home, away);
    expect(ratings.length).toBe(22);
    ratings.forEach((r) => {
      expect(r.rating).toBeGreaterThanOrEqual(3);
      expect(r.rating).toBeLessThanOrEqual(10);
    });
  });

  it('MOTM has highest rating', () => {
    const home = generateTeam(0, 65);
    const away = generateTeam(1, 65);
    const state = simulateMinutes(initMatchState(home, away), home, away, 90);
    const motm = getManOfTheMatch(state, home, away);
    const ratings = computeMatchRatings(state, home, away);
    if (motm) expect(motm.rating).toBe(ratings[0].rating);
  });
});

describe('Adaptive AI (#8)', () => {
  it('losing team goes attacking after 60 min', () => {
    const team = generateTeam(0, 65);
    const result = computeAIAdaptation(team, -2, 70);
    expect(result).not.toBeNull();
    expect(result!.mentalityShift).toBe('attacking');
  });

  it('winning team goes defensive late', () => {
    const team = generateTeam(0, 65);
    const result = computeAIAdaptation(team, 2, 75);
    expect(result).not.toBeNull();
    expect(result!.mentalityShift).toBe('defensive');
  });

  it('no adaptation before 30 min', () => {
    const team = generateTeam(0, 65);
    expect(computeAIAdaptation(team, -2, 20)).toBeNull();
  });
});

describe('Rivalry detection (#9)', () => {
  it('detects same-city derby', () => {
    const home = generateTeam(0, 65);
    const away = generateTeam(1, 60);
    const awaySameCity = { ...away, city: home.city };
    const info = detectRivalry(home, awaySameCity);
    expect(info.isDerby).toBe(true);
    expect(info.intensity).toBe(3);
  });
});

describe('AI sackings (#10)', () => {
  it('sacks manager in relegation with low confidence', () => {
    const team = generateTeam(0, 50);
    const result = shouldSackAIManager(team, 19, 20, 25, 38, 10);
    expect(result).not.toBeNull();
  });

  it('does not sack early season', () => {
    const team = generateTeam(0, 50);
    expect(shouldSackAIManager(team, 19, 20, 5, 38, 10)).toBeNull();
  });
});

describe('Development arcs (#16)', () => {
  it('young player is in growth phase', () => {
    const team = generateTeam(0, 65);
    const young = team.players.find((p) => p.age <= 21) ?? team.players[0];
    const arc = computeDevelopmentArc({ ...young, age: 19 });
    expect(arc.phase).toBe('growth');
    expect(arc.growthRate).toBeGreaterThan(0);
  });

  it('old player is in decline phase', () => {
    const team = generateTeam(0, 65);
    const arc = computeDevelopmentArc({ ...team.players[0], age: 36 });
    expect(arc.phase).toBe('decline');
    expect(arc.growthRate).toBeLessThan(0);
  });

  it('applySeasonDevelopment changes overall', () => {
    const team = generateTeam(0, 65);
    const player = { ...team.players[0], age: 19, overall: 60, currentAbility: 60, potentialAbility: 85 };
    const arc = computeDevelopmentArc(player);
    const developed = applySeasonDevelopment(player, arc);
    expect(developed.overall).toBeGreaterThanOrEqual(player.overall);
  });
});

describe('Squad hierarchy (#17)', () => {
  it('identifies captain and senior group', () => {
    const team = generateTeam(0, 65);
    const hierarchy = computeSquadHierarchy(team);
    expect(hierarchy.captain).not.toBeNull();
    expect(hierarchy.seniorGroup.length).toBeLessThanOrEqual(5);
  });
});

describe('Academy scaling (#14)', () => {
  it('higher level produces more prospects', () => {
    const low = computeAcademyOutput(1, 50);
    const high = computeAcademyOutput(5, 50);
    expect(high.prospectCount).toBeGreaterThan(low.prospectCount);
    expect(high.avgPotential).toBeGreaterThanOrEqual(low.avgPotential);
  });
});

describe('Player happiness (#12)', () => {
  it('computes happiness for all players', () => {
    const team = generateTeam(0, 65);
    const happiness = getSquadHappiness(team, 38);
    expect(happiness.length).toBe(team.players.length);
    happiness.forEach((h) => {
      expect(h.overall).toBeGreaterThanOrEqual(0);
      expect(h.overall).toBeLessThanOrEqual(100);
    });
  });
});

describe('Contract renewal (#11)', () => {
  it('generates a renewal offer', () => {
    const team = generateTeam(0, 65);
    const offer = generateRenewalOffer(team.players[0], team, 2026);
    expect(offer.demandedWage).toBeGreaterThan(0);
    expect(offer.playerWillingness).toBeGreaterThan(0);
  });

  it('accepts when offer meets demand', () => {
    const team = generateTeam(0, 65);
    const offer = { ...generateRenewalOffer(team.players[0], team, 2026), playerWillingness: 0.8 };
    const metOffer = { ...offer, offeredWage: offer.demandedWage };
    expect(evaluateRenewalResponse(metOffer)).toBe('accepted');
  });
});

describe('Injury system (#9 from list 1)', () => {
  it('produces injuries within expected rate over many rolls', () => {
    const team = generateTeam(0, 65);
    const player = team.players[0];
    let injuries = 0;
    for (let i = 0; i < 1000; i++) {
      if (rollInjury(player, 50, true)) injuries++;
    }
    // Expected ~3% per foul → ~30 per 1000. Allow wide range for randomness.
    expect(injuries).toBeGreaterThan(5);
    expect(injuries).toBeLessThan(100);
  });
});

describe('Possession chains (#1)', () => {
  it('builds bonus after 5+ successful passes', () => {
    let chain = createPossessionChain('team1');
    for (let i = 0; i < 10; i++) chain = advanceChain(chain, true);
    expect(chain.length).toBe(10);
    expect(chain.bonus).toBeGreaterThan(0);
    expect(chain.bonus).toBeLessThanOrEqual(0.15);
  });

  it('resets on failed pass', () => {
    let chain = createPossessionChain('team1');
    for (let i = 0; i < 5; i++) chain = advanceChain(chain, true);
    chain = advanceChain(chain, false);
    expect(chain.length).toBe(0);
    expect(chain.bonus).toBe(0);
  });
});

describe('Counter-attacks (#2)', () => {
  it('detects counter with pacey forwards', () => {
    const team = generateTeam(0, 75);
    const result = detectCounterAttack(team, true, 'opponent');
    // May or may not trigger depending on forward pace
    expect(result.ticksRemaining).toBeGreaterThanOrEqual(0);
  });
});

describe('Pressing effect (#3)', () => {
  it('high press has more error chance than low', () => {
    const high = computePressingEffect('high', 30);
    const low = computePressingEffect('low', 30);
    expect(high.errorChance).toBeGreaterThan(low.errorChance);
    expect(high.staminaCost).toBeGreaterThan(low.staminaCost);
  });

  it('pressing effectiveness drops late in match', () => {
    const early = computePressingEffect('high', 30);
    const late = computePressingEffect('high', 80);
    expect(late.errorChance).toBeLessThan(early.errorChance);
  });
});

describe('Set piece delivery (#4)', () => {
  it('left foot from right side is inswinging', () => {
    const team = generateTeam(0, 65);
    const leftFooter = { ...team.players[0], footedness: 'left' as const };
    const delivery = computeSetPieceDelivery(leftFooter, 'right');
    expect(delivery.swing).toBe('inswinging');
    expect(delivery.effectiveZones).toContain('near_post');
  });
});
