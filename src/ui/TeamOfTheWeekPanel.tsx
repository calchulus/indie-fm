import { useGameStore } from '../store/gameStore';
import { computeTeamOfTheWeek, TeamOfTheWeek } from '../simulation/teamofweek';
import { useMemo } from 'react';

export function TeamOfTheWeekPanel() {
  const { league, lastRoundResults } = useGameStore();

  const totw: TeamOfTheWeek | null = useMemo(() => {
    if (!league || lastRoundResults.length === 0) return null;
    return computeTeamOfTheWeek(league, lastRoundResults, league.currentRound - 1);
  }, [league, lastRoundResults]);

  if (!totw) {
    return <div style={{ padding: 20, color: '#888', textAlign: 'center' }}>Advance a round to generate Team of the Week.</div>;
  }

  const posColor = (pos: string) => {
    if (pos === 'GK') return '#fbbf24';
    if (['CB', 'LB', 'RB'].includes(pos)) return '#60a5fa';
    if (['CDM', 'CM', 'CAM'].includes(pos)) return '#4ade80';
    return '#f87171';
  };

  return (
    <div style={{ padding: '12px 16px', overflowY: 'auto', height: '100%' }}>
      <h3 style={{ margin: '0 0 12px', fontSize: 15 }}>⭐ Team of the Week — Round {totw.round}</h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {totw.players.map((p, i) => (
          <div key={p.player.id} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
            background: i === 0 ? 'rgba(251,191,36,0.08)' : 'rgba(255,255,255,0.03)',
            borderRadius: 6, border: i === 0 ? '1px solid rgba(251,191,36,0.2)' : '1px solid transparent',
          }}>
            <span style={{ fontSize: 11, color: '#888', width: 20 }}>#{i + 1}</span>
            <span style={{ fontSize: 11, color: posColor(p.position), fontWeight: 600, width: 30 }}>{p.position}</span>
            <span style={{ fontSize: 12, flex: 1, fontWeight: 500 }}>{p.player.name}</span>
            <span style={{ fontSize: 11, color: '#888' }}>{p.teamName}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: p.rating >= 8 ? '#4ade80' : p.rating >= 7 ? '#fbbf24' : '#e0e0e0' }}>
              {p.rating.toFixed(1)}
            </span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 12, fontSize: 11, color: '#888', textAlign: 'center' }}>
        Formation: {totw.formation} • Ratings based on match performance, team result, and position
      </div>
    </div>
  );
}
