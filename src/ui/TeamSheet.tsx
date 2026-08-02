import { useGameStore } from '../store/gameStore';

export function TeamSheet() {
  const { league, userTeamId, selectTeam } = useGameStore();

  if (!league) return null;

  const userTeam = league.teams.find((t) => t.id === userTeamId);
  if (!userTeam) return null;

  return (
    <div style={{ padding: '8px 12px', overflowY: 'auto', height: '100%' }}>
      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: 1 }}>Your Team</label>
        <select
          value={userTeamId ?? ''}
          onChange={(e) => selectTeam(e.target.value)}
          style={{
            display: 'block',
            width: '100%',
            marginTop: 4,
            padding: '6px 8px',
            background: '#2a2a3e',
            color: '#e0e0e0',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 4,
            fontSize: 13,
          }}
        >
          {league.teams.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </div>

      <div style={{ fontSize: 12, color: '#aaa', marginBottom: 8 }}>
        <div>Stadium: {userTeam.stadium} ({userTeam.capacity.toLocaleString()})</div>
        <div>Budget: £{(userTeam.budget / 1_000_000).toFixed(1)}M</div>
        <div>Formation: {userTeam.tactics.formation} | {userTeam.tactics.mentality}</div>
      </div>

      <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ color: '#888', textAlign: 'left' }}>
            <th style={{ padding: '4px 6px' }}>Pos</th>
            <th style={{ padding: '4px 6px' }}>Name</th>
            <th style={{ padding: '4px 6px' }}>Age</th>
            <th style={{ padding: '4px 6px' }}>OVR</th>
          </tr>
        </thead>
        <tbody>
          {userTeam.players.slice(0, 16).map((p, i) => (
            <tr key={p.id} style={{
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              background: i < 11 ? 'rgba(74,222,128,0.05)' : undefined,
            }}>
              <td style={{ padding: '3px 6px', color: '#60a5fa' }}>{p.position}</td>
              <td style={{ padding: '3px 6px' }}>{p.name}</td>
              <td style={{ padding: '3px 6px', color: '#888' }}>{p.age}</td>
              <td style={{ padding: '3px 6px', fontWeight: 600, color: p.overall >= 75 ? '#4ade80' : p.overall >= 60 ? '#fbbf24' : '#f87171' }}>
                {p.overall}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
