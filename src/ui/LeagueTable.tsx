import { useGameStore } from '../store/gameStore';
import { ClubCrest } from './ClubCrest';

export function LeagueTable() {
  const { league, userTeamId } = useGameStore();

  if (!league) return null;

  const sorted = [...league.standings].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const gdA = a.goalsFor - a.goalsAgainst;
    const gdB = b.goalsFor - b.goalsAgainst;
    return gdB - gdA;
  });

  return (
    <div style={{ padding: '8px 12px', overflowY: 'auto', height: '100%' }}>
      <h3 style={{ margin: '0 0 8px', fontSize: 14, color: '#aaa', textTransform: 'uppercase', letterSpacing: 1 }}>
        {league.name}
      </h3>
      <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ color: '#888', textAlign: 'left' }}>
            <th style={{ padding: '4px 4px' }}>#</th>
            <th style={{ padding: '4px 6px' }}>Team</th>
            <th style={{ padding: '4px 4px' }}>P</th>
            <th style={{ padding: '4px 4px' }}>W</th>
            <th style={{ padding: '4px 4px' }}>D</th>
            <th style={{ padding: '4px 4px' }}>L</th>
            <th style={{ padding: '4px 4px' }}>GD</th>
            <th style={{ padding: '4px 4px' }}>Pts</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((s, i) => {
            const team = league.teams.find((t) => t.id === s.teamId);
            const isUser = s.teamId === userTeamId;
            return (
              <tr key={s.teamId} style={{
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                background: isUser ? 'rgba(96,165,250,0.1)' : undefined,
                fontWeight: isUser ? 600 : 400,
              }}>
                <td style={{ padding: '3px 4px', color: i < 4 ? '#4ade80' : i >= sorted.length - 3 ? '#f87171' : '#888' }}>
                  {i + 1}
                </td>
                <td style={{ padding: '3px 6px', display: 'flex', alignItems: 'center', gap: 6 }}>
                  {team && <ClubCrest teamId={team.id} primary={team.colors.primary} secondary={team.colors.secondary} teamName={team.name} size={18} />}
                  {team?.name ?? '?'}
                </td>
                <td style={{ padding: '3px 4px', color: '#888' }}>{s.played}</td>
                <td style={{ padding: '3px 4px' }}>{s.won}</td>
                <td style={{ padding: '3px 4px' }}>{s.drawn}</td>
                <td style={{ padding: '3px 4px' }}>{s.lost}</td>
                <td style={{ padding: '3px 4px' }}>{s.goalsFor - s.goalsAgainst}</td>
                <td style={{ padding: '3px 4px', fontWeight: 700 }}>{s.points}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
