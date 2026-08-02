import { useGameStore } from '../store/gameStore';

export function SquadStatus() {
  const { league, userTeamId } = useGameStore();

  if (!league) return null;
  const userTeam = league.teams.find((t) => t.id === userTeamId);
  if (!userTeam) return null;

  const players = userTeam.players;

  const formColor = (form: number) => form >= 7 ? '#4ade80' : form >= 5 ? '#fbbf24' : '#f87171';
  const fitnessColor = (f: number) => f >= 85 ? '#4ade80' : f >= 65 ? '#fbbf24' : '#f87171';
  const moraleColor = (m: number) => m >= 7 ? '#4ade80' : m >= 5 ? '#fbbf24' : '#f87171';

  return (
    <div style={{ padding: '12px 16px', overflowY: 'auto', height: '100%' }}>
      <h3 style={{ margin: '0 0 12px', fontSize: 15 }}>Squad Status — {userTeam.name}</h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        <StatCard label="Squad Size" value={String(players.length)} />
        <StatCard label="Avg Overall" value={String(Math.round(players.reduce((s, p) => s + p.overall, 0) / players.length))} />
        <StatCard label="Avg Age" value={(players.reduce((s, p) => s + p.age, 0) / players.length).toFixed(1)} />
        <StatCard label="Avg Fitness" value={`${Math.round(players.reduce((s, p) => s + p.fitness, 0) / players.length)}%`} />
      </div>

      <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ color: '#888', textAlign: 'left' }}>
            <th style={{ padding: '6px 8px' }}>Pos</th>
            <th style={{ padding: '6px 8px' }}>Name</th>
            <th style={{ padding: '6px 8px' }}>Age</th>
            <th style={{ padding: '6px 8px' }}>OVR</th>
            <th style={{ padding: '6px 8px' }}>Form</th>
            <th style={{ padding: '6px 8px' }}>Fitness</th>
            <th style={{ padding: '6px 8px' }}>Morale</th>
            <th style={{ padding: '6px 8px' }}>G</th>
            <th style={{ padding: '6px 8px' }}>A</th>
            <th style={{ padding: '6px 8px' }}>Apps</th>
          </tr>
        </thead>
        <tbody>
          {players.map((p, i) => (
            <tr key={p.id} style={{
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              background: i < 11 ? 'rgba(74,222,128,0.03)' : undefined,
            }}>
              <td style={{ padding: '4px 8px', color: '#60a5fa' }}>{p.position}</td>
              <td style={{ padding: '4px 8px' }}>{p.name}</td>
              <td style={{ padding: '4px 8px', color: '#888' }}>{p.age}</td>
              <td style={{ padding: '4px 8px', fontWeight: 600 }}>{p.overall}</td>
              <td style={{ padding: '4px 8px' }}>
                <span style={{ color: formColor(p.form) }}>{p.form}/10</span>
              </td>
              <td style={{ padding: '4px 8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 40, height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                    <div style={{ width: `${p.fitness}%`, height: '100%', background: fitnessColor(p.fitness), borderRadius: 2 }} />
                  </div>
                  <span style={{ color: fitnessColor(p.fitness), fontSize: 11 }}>{p.fitness}%</span>
                </div>
              </td>
              <td style={{ padding: '4px 8px' }}>
                <span style={{ color: moraleColor(p.morale) }}>{p.morale}/10</span>
              </td>
              <td style={{ padding: '4px 8px' }}>{p.goals}</td>
              <td style={{ padding: '4px 8px' }}>{p.assists}</td>
              <td style={{ padding: '4px 8px', color: '#888' }}>{p.appearances}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      padding: '10px 14px',
      background: 'rgba(255,255,255,0.03)',
      borderRadius: 6,
      textAlign: 'center',
    }}>
      <div style={{ fontSize: 20, fontWeight: 700, color: '#e0e0e0' }}>{value}</div>
      <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{label}</div>
    </div>
  );
}
