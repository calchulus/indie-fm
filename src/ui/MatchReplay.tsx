import { useState } from 'react';
import { useGameStore } from '../store/gameStore';

export function MatchReplay() {
  const matchState = useGameStore((s) => s.matchState);
  const matchHome = useGameStore((s) => s.matchHome);
  const matchAway = useGameStore((s) => s.matchAway);
  const [currentIdx, setCurrentIdx] = useState(0);

  if (!matchState || !matchHome || !matchAway) return null;

  const keyEvents = matchState.events.filter((e) =>
    ['goal', 'save', 'shot', 'yellow_card', 'red_card', 'corner', 'foul', 'kickoff', 'half_time', 'full_time'].includes(e.type)
  );

  if (keyEvents.length === 0) {
    return <div style={{ padding: 20, color: '#888', textAlign: 'center' }}>No key events to replay. Play a match first.</div>;
  }

  const current = keyEvents[Math.min(currentIdx, keyEvents.length - 1)];

  const step = (dir: number) => {
    setCurrentIdx((prev) => Math.max(0, Math.min(keyEvents.length - 1, prev + dir)));
  };

  const eventIcon = (type: string) => {
    switch (type) {
      case 'goal': return '⚽';
      case 'save': return '🧤';
      case 'shot': return '🎯';
      case 'yellow_card': return '🟨';
      case 'red_card': return '🟥';
      case 'corner': return '🚩';
      case 'foul': return '⚠️';
      case 'kickoff': return '▶️';
      case 'half_time': return '⏸️';
      case 'full_time': return '🏁';
      default: return '•';
    }
  };

  const teamColor = (teamId: string) => teamId === matchState.homeTeamId ? matchHome.colors.primary : matchAway.colors.primary;
  const teamName = (teamId: string) => teamId === matchState.homeTeamId ? matchHome.shortName : matchAway.shortName;

  const btnStyle: React.CSSProperties = {
    padding: '8px 16px', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 6,
    background: 'rgba(255,255,255,0.08)', color: '#e0e0e0', cursor: 'pointer', fontSize: 14,
  };

  return (
    <div style={{ padding: '12px 16px', overflowY: 'auto', height: '100%' }}>
      <h3 style={{ margin: '0 0 12px', fontSize: 15 }}>🎬 Match Replay</h3>

      {/* Score header */}
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <span style={{ fontSize: 20, fontWeight: 700 }}>
          <span style={{ color: matchHome.colors.primary }}>{matchHome.shortName}</span>
          {' '}{matchState.homeScore} - {matchState.awayScore}{' '}
          <span style={{ color: matchAway.colors.primary }}>{matchAway.shortName}</span>
        </span>
      </div>

      {/* Current event display */}
      <div style={{
        padding: '20px', marginBottom: 16, textAlign: 'center',
        background: 'rgba(255,255,255,0.03)', borderRadius: 8,
        border: `1px solid ${teamColor(current.teamId)}33`,
      }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>{eventIcon(current.type)}</div>
        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{current.description}</div>
        <div style={{ fontSize: 12, color: '#888' }}>
          {current.minute}' — <span style={{ color: teamColor(current.teamId) }}>{teamName(current.teamId)}</span>
          {' '}— Position ({Math.round(current.x)}, {Math.round(current.y)})
        </div>
      </div>

      {/* Timeline scrubber */}
      <div style={{ marginBottom: 12 }}>
        <input
          type="range"
          min={0}
          max={keyEvents.length - 1}
          value={currentIdx}
          onChange={(e) => setCurrentIdx(Number(e.target.value))}
          style={{ width: '100%', accentColor: '#60a5fa' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#888' }}>
          <span>0'</span>
          <span>Event {currentIdx + 1}/{keyEvents.length}</span>
          <span>90'</span>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
        <button style={btnStyle} onClick={() => setCurrentIdx(0)}>⏮</button>
        <button style={btnStyle} onClick={() => step(-1)}>◀ Prev</button>
        <button style={btnStyle} onClick={() => step(1)}>Next ▶</button>
        <button style={btnStyle} onClick={() => setCurrentIdx(keyEvents.length - 1)}>⏭</button>
      </div>

      {/* Event list */}
      <h4 style={{ fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>All Key Events</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {keyEvents.map((evt, i) => (
          <div
            key={evt.id}
            onClick={() => setCurrentIdx(i)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '4px 8px',
              borderRadius: 4, cursor: 'pointer', fontSize: 12,
              background: i === currentIdx ? 'rgba(96,165,250,0.15)' : 'transparent',
              border: i === currentIdx ? '1px solid rgba(96,165,250,0.3)' : '1px solid transparent',
            }}
          >
            <span style={{ width: 24, color: '#888' }}>{evt.minute}'</span>
            <span>{eventIcon(evt.type)}</span>
            <span style={{ flex: 1, color: evt.type === 'goal' ? '#fbbf24' : '#e0e0e0' }}>{evt.description}</span>
            <span style={{ fontSize: 10, color: teamColor(evt.teamId) }}>{teamName(evt.teamId)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
