import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { MatchEvent } from '../types';

export function MatchHighlights() {
  const matchState = useGameStore((s) => s.matchState);
  const matchHome = useGameStore((s) => s.matchHome);
  const matchAway = useGameStore((s) => s.matchAway);
  const [selectedEvent, setSelectedEvent] = useState<MatchEvent | null>(null);

  if (!matchState || !matchHome || !matchAway) return null;

  const keyEvents = matchState.events.filter((e) =>
    ['goal', 'save', 'yellow_card', 'red_card', 'corner', 'shot'].includes(e.type)
  );

  const goals = keyEvents.filter((e) => e.type === 'goal');
  const cards = keyEvents.filter((e) => e.type === 'yellow_card' || e.type === 'red_card');
  const saves = keyEvents.filter((e) => e.type === 'save');

  const teamName = (id: string) => id === matchState.homeTeamId ? matchHome.shortName : matchAway.shortName;
  const teamColor = (id: string) => id === matchState.homeTeamId ? matchHome.colors.primary : matchAway.colors.primary;

  const eventIcon = (type: string) => {
    switch (type) {
      case 'goal': return '⚽';
      case 'save': return '🧤';
      case 'yellow_card': return '🟨';
      case 'red_card': return '🟥';
      case 'corner': return '🚩';
      case 'shot': return '🎯';
      default: return '•';
    }
  };

  return (
    <div style={{ padding: '12px 16px', overflowY: 'auto', height: '100%' }}>
      <h3 style={{ margin: '0 0 12px', fontSize: 15 }}>🎬 Match Highlights</h3>

      {/* Score header */}
      <div style={{ textAlign: 'center', marginBottom: 16, padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
        <span style={{ fontSize: 20, fontWeight: 700 }}>
          <span style={{ color: matchHome.colors.primary }}>{matchHome.shortName}</span>
          {' '}{matchState.homeScore} - {matchState.awayScore}{' '}
          <span style={{ color: matchAway.colors.primary }}>{matchAway.shortName}</span>
        </span>
        <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>{matchState.minute}' — {matchState.status.replace(/_/g, ' ')}</div>
      </div>

      {/* Key stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 16 }}>
        <MiniStat label="Goals" value={String(goals.length)} />
        <MiniStat label="Saves" value={String(saves.length)} />
        <MiniStat label="Cards" value={String(cards.length)} />
        <MiniStat label="Key Events" value={String(keyEvents.length)} />
      </div>

      {/* Timeline */}
      <h4 style={{ fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Key Moments</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {keyEvents.slice(-30).reverse().map((evt) => (
          <div
            key={evt.id}
            onClick={() => setSelectedEvent(evt)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '6px 10px',
              borderRadius: 4,
              cursor: 'pointer',
              background: selectedEvent?.id === evt.id ? 'rgba(96,165,250,0.15)' : 'rgba(255,255,255,0.02)',
              border: selectedEvent?.id === evt.id ? '1px solid rgba(96,165,250,0.3)' : '1px solid transparent',
            }}
          >
            <span style={{ fontSize: 11, color: '#888', minWidth: 28 }}>{evt.minute}'</span>
            <span style={{ fontSize: 14 }}>{eventIcon(evt.type)}</span>
            <span style={{ fontSize: 12, flex: 1, color: evt.type === 'goal' ? '#fbbf24' : '#e0e0e0' }}>
              {evt.description}
            </span>
            <span style={{ fontSize: 10, color: teamColor(evt.teamId), fontWeight: 600 }}>
              {teamName(evt.teamId)}
            </span>
          </div>
        ))}
        {keyEvents.length === 0 && (
          <div style={{ color: '#666', fontSize: 13, padding: 12 }}>No key events yet. Play the match to generate highlights.</div>
        )}
      </div>

      {/* Event detail */}
      {selectedEvent && (
        <div style={{ marginTop: 16, padding: '10px 14px', background: 'rgba(255,255,255,0.05)', borderRadius: 6 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
            {eventIcon(selectedEvent.type)} {selectedEvent.description}
          </div>
          <div style={{ fontSize: 12, color: '#888' }}>
            Minute {selectedEvent.minute} • Position ({Math.round(selectedEvent.x)}, {Math.round(selectedEvent.y)}) •
            Outcome: <span style={{ color: selectedEvent.outcome === 'success' ? '#4ade80' : selectedEvent.outcome === 'failure' ? '#f87171' : '#fbbf24' }}>{selectedEvent.outcome}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ padding: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: 6, textAlign: 'center' }}>
      <div style={{ fontSize: 16, fontWeight: 700, color: '#e0e0e0' }}>{value}</div>
      <div style={{ fontSize: 10, color: '#888' }}>{label}</div>
    </div>
  );
}
