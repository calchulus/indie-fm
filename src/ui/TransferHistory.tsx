import { useState } from 'react';
import { useGameStore } from '../store/gameStore';

export function TransferHistory() {
  const { league, userTeamId, news } = useGameStore();
  const [filter, setFilter] = useState<'all' | 'in' | 'out'>('all');

  if (!league || !userTeamId) return null;
  const userTeam = league.teams.find((t) => t.id === userTeamId);
  if (!userTeam) return null;

  // Extract transfer records from news items
  const transferNews = news.filter((n) => n.category === 'transfer');

  const btnStyle = (active: boolean): React.CSSProperties => ({
    padding: '4px 12px', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 4,
    background: active ? 'rgba(96,165,250,0.3)' : 'rgba(255,255,255,0.08)',
    color: '#e0e0e0', cursor: 'pointer', fontSize: 12,
  });

  return (
    <div style={{ padding: '12px 16px', overflowY: 'auto', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ margin: 0, fontSize: 15 }}>💰 Transfer History</h3>
        <div style={{ display: 'flex', gap: 6 }}>
          <button style={btnStyle(filter === 'all')} onClick={() => setFilter('all')}>All</button>
          <button style={btnStyle(filter === 'in')} onClick={() => setFilter('in')}>In</button>
          <button style={btnStyle(filter === 'out')} onClick={() => setFilter('out')}>Out</button>
        </div>
      </div>

      {/* Squad summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
        <div style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: 6, textAlign: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 700 }}>{userTeam.players.length}</div>
          <div style={{ fontSize: 10, color: '#888' }}>Squad Size</div>
        </div>
        <div style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: 6, textAlign: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 700 }}>£{(userTeam.budget / 1_000_000).toFixed(1)}M</div>
          <div style={{ fontSize: 10, color: '#888' }}>Budget</div>
        </div>
        <div style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: 6, textAlign: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 700 }}>£{(userTeam.players.reduce((s, p) => s + p.wage, 0) / 1000).toFixed(0)}k/w</div>
          <div style={{ fontSize: 10, color: '#888' }}>Wage Bill</div>
        </div>
      </div>

      {/* Transfer news log */}
      <h4 style={{ fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Transfer Activity</h4>
      {transferNews.length === 0 ? (
        <div style={{ color: '#666', fontSize: 13, textAlign: 'center', padding: 20 }}>
          No transfers recorded yet. Make transfers or advance rounds to generate activity.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {transferNews.map((n) => (
            <div key={n.id} style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 6, fontSize: 12 }}>
              <div style={{ fontWeight: 500 }}>{n.headline}</div>
              <div style={{ color: '#888', marginTop: 2 }}>{n.body}</div>
            </div>
          ))}
        </div>
      )}

      {/* Current squad values */}
      <h4 style={{ fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: 1, margin: '16px 0 8px' }}>Squad Market Values</h4>
      <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ color: '#888', textAlign: 'left' }}>
            <th style={{ padding: '4px 8px' }}>Pos</th>
            <th style={{ padding: '4px 8px' }}>Name</th>
            <th style={{ padding: '4px 8px' }}>Age</th>
            <th style={{ padding: '4px 8px' }}>OVR</th>
            <th style={{ padding: '4px 8px' }}>Value</th>
            <th style={{ padding: '4px 8px' }}>Wage</th>
          </tr>
        </thead>
        <tbody>
          {[...userTeam.players].sort((a, b) => b.value - a.value).map((p) => (
            <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <td style={{ padding: '3px 8px', color: '#60a5fa' }}>{p.position}</td>
              <td style={{ padding: '3px 8px' }}>{p.name}</td>
              <td style={{ padding: '3px 8px', color: '#888' }}>{p.age}</td>
              <td style={{ padding: '3px 8px', fontWeight: 600 }}>{p.overall}</td>
              <td style={{ padding: '3px 8px' }}>£{(p.value / 1_000_000).toFixed(1)}M</td>
              <td style={{ padding: '3px 8px', color: '#888' }}>£{(p.wage / 1000).toFixed(0)}k/w</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
