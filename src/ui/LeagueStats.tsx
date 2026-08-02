import { useGameStore } from '../store/gameStore';
import { useMemo } from 'react';

interface PlayerStat {
  name: string;
  team: string;
  position: string;
  goals: number;
  assists: number;
  apps: number;
  yellowCards: number;
  redCards: number;
}

export function LeagueStats() {
  const { league } = useGameStore();

  const stats: PlayerStat[] = useMemo(() => {
    if (!league) return [];
    return league.teams.flatMap((t) =>
      t.players.map((p) => ({
        name: p.name,
        team: t.shortName,
        position: p.position,
        goals: p.goals,
        assists: p.assists,
        apps: p.appearances,
        yellowCards: p.yellowCards,
        redCards: p.redCards,
      }))
    );
  }, [league]);

  if (!league) return null;

  const topScorers = [...stats].sort((a, b) => b.goals - a.goals).slice(0, 15);
  const topAssists = [...stats].sort((a, b) => b.assists - a.assists).slice(0, 15);
  const mostApps = [...stats].sort((a, b) => b.apps - a.apps).slice(0, 10);
  const mostCards = [...stats].sort((a, b) => (b.yellowCards + b.redCards * 2) - (a.yellowCards + a.redCards * 2)).slice(0, 10);

  return (
    <div style={{ padding: '12px 16px', overflowY: 'auto', height: '100%' }}>
      <h3 style={{ margin: '0 0 16px', fontSize: 15 }}>📊 League Statistics</h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Top Scorers */}
        <div>
          <h4 style={{ fontSize: 12, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>👟 Top Scorers</h4>
          <StatTable rows={topScorers} valueKey="goals" />
        </div>

        {/* Top Assists */}
        <div>
          <h4 style={{ fontSize: 12, color: '#4ade80', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>🎯 Most Assists</h4>
          <StatTable rows={topAssists} valueKey="assists" />
        </div>

        {/* Most Appearances */}
        <div>
          <h4 style={{ fontSize: 12, color: '#60a5fa', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>🏃 Most Appearances</h4>
          <StatTable rows={mostApps} valueKey="apps" />
        </div>

        {/* Most Cards */}
        <div>
          <h4 style={{ fontSize: 12, color: '#f87171', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>🟨 Most Cards</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {mostCards.map((p, i) => (
              <div key={p.name + i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '3px 8px', fontSize: 12, background: 'rgba(255,255,255,0.02)', borderRadius: 3 }}>
                <span style={{ color: '#888', width: 16 }}>{i + 1}</span>
                <span style={{ flex: 1 }}>{p.name}</span>
                <span style={{ color: '#888', width: 30 }}>{p.team}</span>
                <span style={{ color: '#fbbf24' }}>🟨{p.yellowCards}</span>
                <span style={{ color: '#f87171' }}>🟥{p.redCards}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatTable({ rows, valueKey }: { rows: PlayerStat[]; valueKey: 'goals' | 'assists' | 'apps' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {rows.map((p, i) => (
        <div key={p.name + i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '3px 8px', fontSize: 12, background: 'rgba(255,255,255,0.02)', borderRadius: 3 }}>
          <span style={{ color: '#888', width: 16 }}>{i + 1}</span>
          <span style={{ flex: 1 }}>{p.name}</span>
          <span style={{ color: '#888', width: 30 }}>{p.team}</span>
          <span style={{ fontWeight: 700, width: 24, textAlign: 'right' }}>{p[valueKey]}</span>
        </div>
      ))}
    </div>
  );
}
