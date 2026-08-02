import { useMemo } from 'react';
import { useGameStore } from '../store/gameStore';
import { computeMomentum } from '../simulation/momentum';

export function MomentumBar() {
  const matchState = useGameStore((s) => s.matchState);
  const matchHome = useGameStore((s) => s.matchHome);
  const matchAway = useGameStore((s) => s.matchAway);

  const momentum = useMemo(() => {
    if (!matchState || !matchHome) return null;
    return computeMomentum(matchState.events, matchHome.id, matchState.tick);
  }, [matchState, matchHome]);

  if (!momentum || !matchHome || !matchAway) return null;

  return (
    <div style={{ padding: '4px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 10, color: matchHome.colors.primary, width: 30, textAlign: 'right' }}>
        {matchHome.shortName}
      </span>
      <div style={{ flex: 1, height: 6, borderRadius: 3, overflow: 'hidden', display: 'flex', background: 'rgba(255,255,255,0.1)' }}>
        <div style={{
          width: `${momentum.home}%`,
          background: matchHome.colors.primary,
          transition: 'width 0.5s ease',
        }} />
        <div style={{
          width: `${momentum.away}%`,
          background: matchAway.colors.primary,
          transition: 'width 0.5s ease',
        }} />
      </div>
      <span style={{ fontSize: 10, color: matchAway.colors.primary, width: 30 }}>
        {matchAway.shortName}
      </span>
      <span style={{
        fontSize: 9,
        color: momentum.dominant === 'home' ? matchHome.colors.primary : momentum.dominant === 'away' ? matchAway.colors.primary : '#888',
        width: 50,
        textAlign: 'center',
      }}>
        {momentum.dominant === 'even' ? 'Even' : momentum.dominant === 'home' ? '◀ Pressure' : 'Pressure ▶'}
      </span>
    </div>
  );
}
