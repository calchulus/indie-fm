import { describe, it, expect } from 'vitest';
import { useGameStore } from '../../store/gameStore';

describe('Game Store', () => {
  it('initializes a game with 20 teams', () => {
    useGameStore.getState().initGame();
    const { league, userTeamId } = useGameStore.getState();

    expect(league).not.toBeNull();
    expect(league!.teams).toHaveLength(20);
    expect(userTeamId).toBeTruthy();
    expect(league!.teams.some((t) => t.id === userTeamId)).toBe(true);
  });

  it('selects a different team', () => {
    useGameStore.getState().initGame();
    const { league } = useGameStore.getState();
    const newTeamId = league!.teams[5].id;

    useGameStore.getState().selectTeam(newTeamId);
    expect(useGameStore.getState().userTeamId).toBe(newTeamId);
  });

  it('starts a match between two teams', () => {
    useGameStore.getState().initGame();
    const { league } = useGameStore.getState();
    const home = league!.teams[0];
    const away = league!.teams[1];

    useGameStore.getState().startMatch(home.id, away.id);
    const { matchState, matchHome, matchAway } = useGameStore.getState();

    expect(matchState).not.toBeNull();
    expect(matchState!.status).toBe('pre_match');
    expect(matchHome!.id).toBe(home.id);
    expect(matchAway!.id).toBe(away.id);
  });

  it('ticks a match forward', () => {
    useGameStore.getState().initGame();
    const { league } = useGameStore.getState();
    useGameStore.getState().startMatch(league!.teams[0].id, league!.teams[1].id);

    useGameStore.getState().tickMatch();
    const { matchState } = useGameStore.getState();
    expect(matchState!.tick).toBe(1);
    expect(matchState!.status).toBe('first_half');
  });

  it('simulates minutes and reaches full time', () => {
    useGameStore.getState().initGame();
    const { league } = useGameStore.getState();
    useGameStore.getState().startMatch(league!.teams[0].id, league!.teams[1].id);

    useGameStore.getState().simMinutes(90);
    const { matchState, isSimulating } = useGameStore.getState();
    expect(matchState!.status).toBe('full_time');
    expect(isSimulating).toBe(false);
  });

  it('advances a round and updates standings', () => {
    useGameStore.getState().initGame();
    useGameStore.getState().advanceRound();

    const { league, lastRoundResults } = useGameStore.getState();
    expect(league!.currentRound).toBe(2);
    expect(lastRoundResults.length).toBeGreaterThan(0);

    // User's match is skipped (for interactive play), so 18 of 20 teams played
    const played = league!.standings.filter((s) => s.played > 0);
    expect(played.length).toBe(18);
  });

  it('simulates to end of season', () => {
    useGameStore.getState().initGame();
    useGameStore.getState().simToEnd();

    const { league, seasonComplete } = useGameStore.getState();
    expect(seasonComplete).toBe(true);

    for (const s of league!.standings) {
      expect(s.played).toBeGreaterThan(0);
    }
  }, 30000);
});
