// Formation change mid-match: recalculate player positions based on new formation
import { MatchState, Team, PITCH_LENGTH, PITCH_WIDTH } from '../types';
import { getFormationSlots } from './tactics';

export function recalculatePositions(state: MatchState, home: Team, away: Team): MatchState {
  const homeSlots = getFormationSlots(home.tactics.formation);
  const awaySlots = getFormationSlots(away.tactics.formation);

  const updatedPositions = state.playerPositions.map((pp) => {
    const isHome = pp.teamId === home.id;
    const team = isHome ? home : away;
    const slots = isHome ? homeSlots : awaySlots;
    const playerIdx = team.players.findIndex((p) => p.id === pp.playerId);
    if (playerIdx < 0 || playerIdx >= slots.length) return pp;

    const slot = slots[playerIdx];
    const targetX = isHome ? slot.baseX : PITCH_LENGTH - slot.baseX;
    const targetY = isHome ? slot.baseY : PITCH_WIDTH - slot.baseY;

    return { ...pp, targetX, targetY };
  });

  return { ...state, playerPositions: updatedPositions };
}
