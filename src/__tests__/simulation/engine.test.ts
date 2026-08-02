import { describe, it, expect } from 'vitest';
import { initMatchState, simulateTick, simulateMinutes } from '../../simulation/engine';
import { generateTeam } from '../../data/generators';
import { PITCH_LENGTH, PITCH_WIDTH } from '../../types';

describe('Match Engine', () => {
  const home = generateTeam(0, 65);
  const away = generateTeam(1, 65);

  it('initializes match state correctly', () => {
    const state = initMatchState(home, away);
    expect(state.homeTeamId).toBe(home.id);
    expect(state.awayTeamId).toBe(away.id);
    expect(state.homeScore).toBe(0);
    expect(state.awayScore).toBe(0);
    expect(state.status).toBe('pre_match');
    expect(state.playerPositions).toHaveLength(22);
    expect(state.ballPosition.x).toBe(PITCH_LENGTH / 2);
  });

  it('transitions from pre_match to first_half on first tick', () => {
    let state = initMatchState(home, away);
    state = simulateTick(state, home, away);
    expect(state.status).toBe('first_half');
    expect(state.tick).toBe(1);
  });

  it('passes through half_time at minute 45', () => {
    let state = initMatchState(home, away);
    state = simulateMinutes(state, home, away, 45);
    // After 45 min of ticks, the sim has transitioned through half_time into second_half
    expect(['half_time', 'second_half']).toContain(state.status);
    expect(state.minute).toBeGreaterThanOrEqual(45);
    expect(state.events.some((e) => e.type === 'half_time')).toBe(true);
  });

  it('reaches full_time at minute 90', () => {
    let state = initMatchState(home, away);
    state = simulateMinutes(state, home, away, 90);
    expect(state.status).toBe('full_time');
  });

  it('keeps ball within pitch bounds', () => {
    let state = initMatchState(home, away);
    state = simulateMinutes(state, home, away, 10);
    expect(state.ballPosition.x).toBeGreaterThanOrEqual(0);
    expect(state.ballPosition.x).toBeLessThanOrEqual(PITCH_LENGTH);
    expect(state.ballPosition.y).toBeGreaterThanOrEqual(0);
    expect(state.ballPosition.y).toBeLessThanOrEqual(PITCH_WIDTH);
  });

  it('keeps players within pitch bounds', () => {
    let state = initMatchState(home, away);
    state = simulateMinutes(state, home, away, 5);
    for (const pp of state.playerPositions) {
      expect(pp.x).toBeGreaterThanOrEqual(0);
      expect(pp.x).toBeLessThanOrEqual(PITCH_LENGTH + 1);
      expect(pp.y).toBeGreaterThanOrEqual(0);
      expect(pp.y).toBeLessThanOrEqual(PITCH_WIDTH + 1);
    }
  });

  it('scores are non-negative', () => {
    let state = initMatchState(home, away);
    state = simulateMinutes(state, home, away, 90);
    expect(state.homeScore).toBeGreaterThanOrEqual(0);
    expect(state.awayScore).toBeGreaterThanOrEqual(0);
  });

  it('caps events array during long simulation', () => {
    let state = initMatchState(home, away);
    state = simulateMinutes(state, home, away, 90);
    expect(state.events.length).toBeLessThanOrEqual(200);
  });

  it('does not progress past full_time', () => {
    let state = initMatchState(home, away);
    state = simulateMinutes(state, home, away, 90);
    const frozen = simulateTick(state, home, away);
    expect(frozen.status).toBe('full_time');
    expect(frozen.tick).toBe(state.tick);
  });
});
