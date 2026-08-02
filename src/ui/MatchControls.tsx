import { useEffect, useRef, useCallback } from 'react';
import { useGameStore } from '../store/gameStore';

export function MatchControls() {
  const matchState = useGameStore((s) => s.matchState);
  const isSimulating = useGameStore((s) => s.isSimulating);
  const simSpeed = useGameStore((s) => s.simSpeed);
  const setSimulating = useGameStore((s) => s.setSimulating);
  const setSimSpeed = useGameStore((s) => s.setSimSpeed);
  const tickMatch = useGameStore((s) => s.tickMatch);
  const simMinutes = useGameStore((s) => s.simMinutes);
  const startMatch = useGameStore((s) => s.startMatch);
  const league = useGameStore((s) => s.league);
  const userTeamId = useGameStore((s) => s.userTeamId);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const simulatingRef = useRef(isSimulating);
  simulatingRef.current = isSimulating;

  const clearSim = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    clearSim();
    if (isSimulating && matchState && matchState.status !== 'full_time') {
      const ms = Math.max(16, 250 / simSpeed);
      intervalRef.current = setInterval(() => {
        tickMatch();
      }, ms);
    }
    return clearSim;
  }, [isSimulating, simSpeed, matchState?.status, clearSim, tickMatch, matchState]);

  const handleQuickMatch = () => {
    if (!league) return;
    const others = league.teams.filter((t) => t.id !== userTeamId);
    const opponent = others[Math.floor(Math.random() * others.length)];
    const userTeam = league.teams.find((t) => t.id === userTeamId);
    if (userTeam && opponent) {
      startMatch(userTeam.id, opponent.id);
    }
  };

  const handleSkipToBreak = () => {
    if (!matchState) return;
    const minute = matchState.minute;
    let target: number;
    if (minute < 45) {
      target = 45 - minute;
    } else {
      target = 90 - minute;
    }
    if (target > 0) {
      simMinutes(target);
    }
  };

  const btnStyle: React.CSSProperties = {
    padding: '6px 14px',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: 4,
    background: 'rgba(255,255,255,0.08)',
    color: '#e0e0e0',
    cursor: 'pointer',
    fontSize: 13,
    transition: 'background 0.15s',
  };

  const status = matchState?.status;

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '8px 12px', flexWrap: 'wrap' }}>
      {!matchState && (
        <button style={btnStyle} onClick={handleQuickMatch}>
          ⚡ Quick Match
        </button>
      )}

      {matchState && status !== 'full_time' && (
        <>
          <button
            style={{ ...btnStyle, background: isSimulating ? 'rgba(239,68,68,0.3)' : 'rgba(74,222,128,0.2)' }}
            onClick={() => setSimulating(!isSimulating)}
          >
            {isSimulating ? '⏸ Pause' : '▶ Play'}
          </button>
          <button style={btnStyle} onClick={() => simMinutes(1)}>+1 min</button>
          <button style={btnStyle} onClick={() => simMinutes(5)}>+5 min</button>
          <button style={btnStyle} onClick={handleSkipToBreak}>
            {matchState.minute < 45 ? '⏭ Skip to HT' : '⏭ Skip to FT'}
          </button>

          <div style={{ display: 'flex', gap: 4, marginLeft: 12 }}>
            {[1, 2, 4, 8].map((s) => (
              <button
                key={s}
                style={{ ...btnStyle, background: simSpeed === s ? 'rgba(96,165,250,0.3)' : undefined }}
                onClick={() => setSimSpeed(s)}
              >
                {s}x
              </button>
            ))}
          </div>
        </>
      )}

      {matchState && status === 'full_time' && (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontWeight: 700, fontSize: 16 }}>
            Full Time: {matchState.homeScore} - {matchState.awayScore}
          </span>
          <button style={btnStyle} onClick={handleQuickMatch}>New Match</button>
        </div>
      )}

      {matchState && (
        <div style={{ marginLeft: 'auto', fontSize: 12, color: '#888' }}>
          Shots: {matchState.shots.home}-{matchState.shots.away} |
          On Target: {matchState.shotsOnTarget.home}-{matchState.shotsOnTarget.away} |
          Corners: {matchState.corners.home}-{matchState.corners.away} |
          Fouls: {matchState.fouls.home}-{matchState.fouls.away}
        </div>
      )}
    </div>
  );
}
