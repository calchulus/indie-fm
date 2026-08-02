import { describe, it, expect } from 'vitest';
import { createDevelopmentArc, processDevelopment, getDevelopmentPhase, isWonderkid, getWonderkidRating, projectPeak } from '../../simulation/development-arcs';
import { generatePlayer } from '../../data/generators';

describe('Development Arcs', () => {
  it('classifies wonderkids correctly', () => {
    const player = generatePlayer('ST', 55);
    player.age = 17;
    player.potentialAbility = 160;
    player.currentAbility = 80;
    expect(isWonderkid(player)).toBe(true);
    expect(getDevelopmentPhase(player.age, player.potentialAbility, player.currentAbility)).toBe('wonderkid');
  });

  it('classifies emerging players correctly', () => {
    const player = generatePlayer('CM', 60);
    player.age = 21;
    player.potentialAbility = 120;
    expect(getDevelopmentPhase(player.age, player.potentialAbility, player.currentAbility)).toBe('emerging');
  });

  it('classifies prime players correctly', () => {
    const player = generatePlayer('CB', 70);
    player.age = 27;
    expect(getDevelopmentPhase(player.age, player.potentialAbility, player.currentAbility)).toBe('prime');
  });

  it('classifies declining players correctly', () => {
    const player = generatePlayer('GK', 65);
    player.age = 34;
    expect(getDevelopmentPhase(player.age, player.potentialAbility, player.currentAbility)).toBe('declining');
  });

  it('wonderkids grow attributes when processed', () => {
    const player = generatePlayer('ST', 50);
    player.age = 17;
    player.potentialAbility = 180;
    player.currentAbility = 70;
    const arc = createDevelopmentArc(player);
    expect(arc.phase).toBe('wonderkid');
    expect(arc.growthRate).toBeGreaterThan(0);

    const { player: developed } = processDevelopment(player, arc);
    const originalSum = Object.values(player.attributes).reduce((s, v) => s + v, 0);
    const developedSum = Object.values(developed.attributes).reduce((s, v) => s + v, 0);
    expect(developedSum).toBeGreaterThanOrEqual(originalSum);
  });

  it('declining players lose physical attributes', () => {
    const player = generatePlayer('LW', 65);
    player.age = 35;
    player.potentialAbility = 100;
    player.currentAbility = 90;
    const arc = createDevelopmentArc(player);
    expect(arc.phase).toBe('declining');
    expect(arc.growthRate).toBeLessThan(0);
  });

  it('does not exceed potential ability', () => {
    const player = generatePlayer('CM', 70);
    player.age = 20;
    player.potentialAbility = 100;
    player.currentAbility = 95;
    const arc = createDevelopmentArc(player);

    let current = player;
    let currentArc = arc;
    for (let i = 0; i < 10; i++) {
      const result = processDevelopment(current, currentArc);
      current = result.player;
      currentArc = result.arc;
    }
    expect(current.currentAbility).toBeLessThanOrEqual(player.potentialAbility);
  });

  it('projects peak correctly', () => {
    const player = generatePlayer('ST', 55);
    player.age = 18;
    player.potentialAbility = 160;
    player.currentAbility = 80;
    const arc = createDevelopmentArc(player);
    const projection = projectPeak(player, arc);
    expect(projection.peakAge).toBeGreaterThanOrEqual(player.age);
    expect(projection.projectedOverall).toBeGreaterThanOrEqual(player.overall);
  });

  it('wonderkid rating is 0 for non-wonderkids', () => {
    const player = generatePlayer('CB', 65);
    player.age = 28;
    expect(getWonderkidRating(player)).toBe(0);
  });

  it('wonderkid rating is positive for wonderkids', () => {
    const player = generatePlayer('ST', 50);
    player.age = 17;
    player.potentialAbility = 170;
    player.currentAbility = 70;
    expect(getWonderkidRating(player)).toBeGreaterThan(0);
  });
});
