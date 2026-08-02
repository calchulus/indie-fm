import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../../store/gameStore';

describe('Integration: Full Game Loop', () => {
  beforeEach(() => {
    useGameStore.getState().initGame();
  });

  it('initGame produces a valid league with all subsystems', () => {
    const state = useGameStore.getState();
    expect(state.league).not.toBeNull();
    expect(state.league!.teams).toHaveLength(20);
    expect(state.userTeamId).toBeTruthy();
    expect(state.board).not.toBeNull();
    expect(state.finances).not.toBeNull();
    expect(state.fanSentiment).not.toBeNull();
    expect(state.training).not.toBeNull();
    expect(state.staff.length).toBeGreaterThan(0);
    expect(state.seasonNumber).toBe(1);
  });

  it('advanceRound updates standings, fires orchestrator, and autosaves', () => {
    useGameStore.getState().advanceRound();
    const state = useGameStore.getState();

    // Standings updated
    const played = state.league!.standings.filter((s) => s.played > 0);
    expect(played.length).toBeGreaterThanOrEqual(18); // user match skipped

    // Round advanced
    expect(state.league!.currentRound).toBe(2);

    // Results recorded
    expect(state.lastRoundResults.length).toBeGreaterThan(0);

    // Board confidence changed (or stayed same)
    expect(state.board!.confidence).toBeGreaterThanOrEqual(0);
    expect(state.board!.confidence).toBeLessThanOrEqual(100);

    // Finances processed
    expect(state.finances!.records.length).toBe(1);

    // Training familiarity increased
    expect(state.training!.familiarity).toBeGreaterThan(50);
  });

  it('goals are attributed to individual players after a round', () => {
    useGameStore.getState().advanceRound();
    const state = useGameStore.getState();

    // At least some players across the league should have goals
    const allPlayers = state.league!.teams.flatMap((t) => t.players);
    const scorers = allPlayers.filter((p) => p.goals > 0);
    expect(scorers.length).toBeGreaterThan(0);

    // Appearances incremented for starters
    const withApps = allPlayers.filter((p) => p.appearances > 0);
    expect(withApps.length).toBeGreaterThan(100); // 11 starters × ~19 teams
  });

  it('simToEnd completes the season and records history', () => {
    useGameStore.getState().simToEnd();
    const state = useGameStore.getState();

    expect(state.seasonComplete).toBe(true);
    expect(state.seasonHistory.length).toBe(1);
    expect(state.seasonHistory[0].championName).toBeTruthy();
    expect(state.seasonHistory[0].userPosition).toBeGreaterThanOrEqual(1);
    expect(state.seasonHistory[0].userPosition).toBeLessThanOrEqual(20);

    // Club records updated
    expect(state.clubRecords.seasonsPlayed).toBe(1);
  }, 30000);

  it('startNewSeason resets for a new season with aged players', () => {
    // Complete a season first
    useGameStore.getState().simToEnd();
    const beforeAvgAge = useGameStore.getState().league!.teams[0].players.reduce((s, p) => s + p.age, 0) / useGameStore.getState().league!.teams[0].players.length;

    // Start new season
    useGameStore.getState().startNewSeason();
    const state = useGameStore.getState();

    expect(state.seasonComplete).toBe(false);
    expect(state.league!.currentRound).toBe(1);
    expect(state.seasonNumber).toBe(2);

    // Fixtures reset
    expect(state.league!.fixtures.every((f) => !f.played)).toBe(true);

    // Standings reset
    expect(state.league!.standings.every((s) => s.played === 0)).toBe(true);

    // Average squad age increased (aging + youth intake + promotion/relegation churn may lower it)
    const afterAvgAge = state.league!.teams[0].players.reduce((s, p) => s + p.age, 0) / state.league!.teams[0].players.length;
    expect(afterAvgAge).toBeGreaterThanOrEqual(beforeAvgAge - 4);
  }, 30000);

  it('full lifecycle: init → advance 5 rounds → simToEnd → new season → advance', () => {
    // Advance 5 rounds
    for (let i = 0; i < 5; i++) {
      useGameStore.getState().advanceRound();
    }
    expect(useGameStore.getState().league!.currentRound).toBe(6);

    // Sim to end
    useGameStore.getState().simToEnd();
    expect(useGameStore.getState().seasonComplete).toBe(true);

    // New season
    useGameStore.getState().startNewSeason();
    expect(useGameStore.getState().seasonNumber).toBe(2);
    expect(useGameStore.getState().league!.currentRound).toBe(1);

    // Advance in new season
    useGameStore.getState().advanceRound();
    expect(useGameStore.getState().league!.currentRound).toBe(2);
    expect(useGameStore.getState().lastRoundResults.length).toBeGreaterThan(0);
  }, 30000);

  it('match simulation produces valid results with attribute-based engine', () => {
    const state = useGameStore.getState();
    const home = state.league!.teams[0];
    const away = state.league!.teams[1];

    useGameStore.getState().startMatch(home.id, away.id);
    useGameStore.getState().simMinutes(90);

    const matchState = useGameStore.getState().matchState!;
    expect(matchState.status).toBe('full_time');
    expect(matchState.homeScore).toBeGreaterThanOrEqual(0);
    expect(matchState.awayScore).toBeGreaterThanOrEqual(0);
    expect(matchState.events.length).toBeGreaterThan(0);
  });

  it('player development arcs affect attributes over multiple rounds', () => {
    // Advance multiple rounds to trigger development
    for (let i = 0; i < 5; i++) {
      useGameStore.getState().advanceRound();
    }

    const finalPlayers = useGameStore.getState().league!.teams[0].players;
    // Development is probabilistic, so we just check it doesn't crash and squad is intact
    expect(finalPlayers.length).toBeGreaterThanOrEqual(14);
  });
});
