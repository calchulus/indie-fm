import { memo } from 'react';
import { useGameStore } from '../store/gameStore';

export const EventFeed = memo(function EventFeed() {
  const matchState = useGameStore((s) => s.matchState);
  const matchHome = useGameStore((s) => s.matchHome);
  const matchAway = useGameStore((s) => s.matchAway);

  if (!matchState) return null;

  const recentEvents = matchState.events.slice(-30).reverse();

  return (
    <div style={{
      height: '100%',
      overflowY: 'auto',
      padding: '8px 12px',
      fontSize: 13,
      lineHeight: 1.6,
    }}>
      <h3 style={{ margin: '0 0 8px', fontSize: 14, color: '#aaa', textTransform: 'uppercase', letterSpacing: 1 }}>
        Match Events
      </h3>
      {recentEvents.map((evt) => {
        const isHome = evt.teamId === matchState.homeTeamId;
        const teamColor = isHome ? matchHome?.colors.primary : matchAway?.colors.primary;
        const icon = getEventIcon(evt.type);
        return (
          <div key={evt.id} style={{
            padding: '4px 0',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            display: 'flex',
            gap: 8,
            alignItems: 'baseline',
          }}>
            <span style={{ color: '#888', fontSize: 11, minWidth: 28 }}>{evt.minute}'</span>
            <span>{icon}</span>
            <span style={{ color: evt.outcome === 'success' ? '#4ade80' : evt.outcome === 'failure' ? '#f87171' : '#e0e0e0' }}>
              {evt.description}
            </span>
            <span style={{ marginLeft: 'auto', fontSize: 10, color: teamColor }}>
              {isHome ? matchHome?.shortName : matchAway?.shortName}
            </span>
          </div>
        );
      })}
    </div>
  );
});

function getEventIcon(type: string): string {
  switch (type) {
    case 'goal': return '⚽';
    case 'shot': return '🎯';
    case 'save': return '🧤';
    case 'yellow_card': return '🟨';
    case 'red_card': return '🟥';
    case 'corner': return '🚩';
    case 'foul': return '⚠️';
    case 'kickoff': return '▶️';
    case 'half_time': return '⏸️';
    case 'full_time': return '🏁';
    default: return '•';
  }
}
