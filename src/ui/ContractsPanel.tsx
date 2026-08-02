import { useGameStore } from '../store/gameStore';
import { Player } from '../types';

export function ContractsPanel() {
  const { league, userTeamId } = useGameStore();

  if (!league || !userTeamId) return null;
  const userTeam = league.teams.find((t) => t.id === userTeamId);
  if (!userTeam) return null;

  const currentYear = 2026 + (useGameStore.getState().seasonNumber - 1);
  const wageBudget = Math.round(userTeam.budget * 0.6);
  const totalWages = userTeam.players.reduce((s, p) => s + p.wage, 0);
  const wageUsage = Math.round((totalWages / wageBudget) * 100);

  const expiringSoon = userTeam.players
    .filter((p) => p.contractExpiry <= currentYear + 1)
    .sort((a, b) => a.contractExpiry - b.contractExpiry);

  const handleRenew = (player: Player) => {
    const newExpiry = player.contractExpiry + 2;
    const wageIncrease = Math.round(player.wage * 1.15);
    const updatedTeams = league.teams.map((t) =>
      t.id === userTeamId
        ? { ...t, players: t.players.map((p) => p.id === player.id ? { ...p, contractExpiry: newExpiry, wage: wageIncrease } : p) }
        : t
    );
    useGameStore.setState({ league: { ...league, teams: updatedTeams } });
    useGameStore.getState().addToast(`📝 ${player.name} signed a new deal until ${newExpiry} (£${(wageIncrease / 1000).toFixed(0)}k/w)`, 'success');
  };

  const handleRelease = (player: Player) => {
    const updatedTeams = league.teams.map((t) =>
      t.id === userTeamId
        ? { ...t, players: t.players.filter((p) => p.id !== player.id) }
        : t
    );
    useGameStore.setState({ league: { ...league, teams: updatedTeams } });
    useGameStore.getState().addToast(`👋 ${player.name} released from contract.`, 'info');
  };

  const btnStyle: React.CSSProperties = {
    padding: '4px 10px', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 4,
    background: 'rgba(255,255,255,0.08)', color: '#e0e0e0', cursor: 'pointer', fontSize: 11,
  };

  return (
    <div style={{ padding: '12px 16px', overflowY: 'auto', height: '100%' }}>
      <h3 style={{ margin: '0 0 12px', fontSize: 15 }}>📝 Contracts</h3>

      {/* Wage budget */}
      <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12 }}>
          <span style={{ color: '#888' }}>Wage Budget Usage</span>
          <span style={{ color: wageUsage > 90 ? '#f87171' : wageUsage > 70 ? '#fbbf24' : '#4ade80' }}>
            £{(totalWages / 1000).toFixed(0)}k / £{(wageBudget / 1000).toFixed(0)}k ({wageUsage}%)
          </span>
        </div>
        <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
          <div style={{ width: `${Math.min(100, wageUsage)}%`, height: '100%', background: wageUsage > 90 ? '#f87171' : wageUsage > 70 ? '#fbbf24' : '#4ade80', borderRadius: 3 }} />
        </div>
      </div>

      {/* Expiring contracts */}
      {expiringSoon.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <h4 style={{ fontSize: 12, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
            ⚠️ Expiring Soon ({expiringSoon.length})
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {expiringSoon.map((p) => (
              <div key={p.id} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
                background: 'rgba(251,191,36,0.05)', borderRadius: 6, border: '1px solid rgba(251,191,36,0.15)',
              }}>
                <span style={{ fontSize: 11, color: '#60a5fa', width: 28 }}>{p.position}</span>
                <span style={{ fontSize: 12, flex: 1, fontWeight: 500 }}>{p.name}</span>
                <span style={{ fontSize: 11, color: '#fbbf24' }}>Expires {p.contractExpiry}</span>
                <span style={{ fontSize: 11, color: '#888' }}>£{(p.wage / 1000).toFixed(0)}k/w</span>
                <button style={{ ...btnStyle, background: 'rgba(74,222,128,0.15)' }} onClick={() => handleRenew(p)}>Renew +2yr</button>
                <button style={{ ...btnStyle, borderColor: 'rgba(248,113,113,0.3)' }} onClick={() => handleRelease(p)}>Release</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full squad contracts */}
      <h4 style={{ fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Full Squad Contracts</h4>
      <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ color: '#888', textAlign: 'left' }}>
            <th style={{ padding: '4px 8px' }}>Pos</th>
            <th style={{ padding: '4px 8px' }}>Name</th>
            <th style={{ padding: '4px 8px' }}>Age</th>
            <th style={{ padding: '4px 8px' }}>Wage</th>
            <th style={{ padding: '4px 8px' }}>Expiry</th>
            <th style={{ padding: '4px 8px' }}>Status</th>
            <th style={{ padding: '4px 8px' }}></th>
          </tr>
        </thead>
        <tbody>
          {userTeam.players.map((p) => {
            const yearsLeft = p.contractExpiry - currentYear;
            const status = yearsLeft <= 0 ? 'Expired' : yearsLeft === 1 ? 'Final year' : `${yearsLeft}yr left`;
            const statusColor = yearsLeft <= 0 ? '#f87171' : yearsLeft === 1 ? '#fbbf24' : '#4ade80';
            return (
              <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '3px 8px', color: '#60a5fa' }}>{p.position}</td>
                <td style={{ padding: '3px 8px' }}>{p.name}</td>
                <td style={{ padding: '3px 8px', color: '#888' }}>{p.age}</td>
                <td style={{ padding: '3px 8px' }}>£{(p.wage / 1000).toFixed(0)}k/w</td>
                <td style={{ padding: '3px 8px' }}>{p.contractExpiry}</td>
                <td style={{ padding: '3px 8px', color: statusColor, fontSize: 11 }}>{status}</td>
                <td style={{ padding: '3px 8px' }}>
                  <button style={btnStyle} onClick={() => handleRenew(p)}>Renew</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
