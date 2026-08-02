// Zustand selector helpers (#30) — granular subscriptions to prevent unnecessary re-renders
import { useGameStore } from '../store/gameStore';
import { League, Team, MatchState } from '../types';

// Use these instead of `const { x, y, z } = useGameStore()` to avoid
// re-rendering when unrelated store fields change.

export function useLeague(): League | null {
  return useGameStore((s) => s.league);
}

export function useUserTeam(): Team | null {
  return useGameStore((s) => {
    if (!s.league || !s.userTeamId) return null;
    return s.league.teams.find((t) => t.id === s.userTeamId) ?? null;
  });
}

export function useUserTeamId(): string | null {
  return useGameStore((s) => s.userTeamId);
}

export function useMatchState(): MatchState | null {
  return useGameStore((s) => s.matchState);
}

export function useMatchHome(): Team | null {
  return useGameStore((s) => s.matchHome);
}

export function useMatchAway(): Team | null {
  return useGameStore((s) => s.matchAway);
}

export function useIsSimulating(): boolean {
  return useGameStore((s) => s.isSimulating);
}

export function useSimSpeed(): number {
  return useGameStore((s) => s.simSpeed);
}

export function useSeasonNumber(): number {
  return useGameStore((s) => s.seasonNumber);
}

export function useBoard(): ReturnType<typeof useGameStore.getState>['board'] {
  return useGameStore((s) => s.board);
}

export function useToasts(): ReturnType<typeof useGameStore.getState>['toasts'] {
  return useGameStore((s) => s.toasts);
}

// Actions (stable references, never cause re-renders)
export function useActions() {
  return useGameStore((s) => ({
    setSimulating: s.setSimulating,
    setSimSpeed: s.setSimSpeed,
    addToast: s.addToast,
    removeToast: s.removeToast,
  }));
}
