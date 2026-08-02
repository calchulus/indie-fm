import { useGameStore } from '../store/gameStore';

export function ManagerProfile() {
  const { league, userTeamId, seasonHistory, clubRecords, seasonNumber, board } = useGameStore();

  if (!league || !userTeamId) return null;
  const userTeam = league.teams.find((t) => t.id === userTeamId);
  if (!userTeam) return null;

  const userStanding = [...league.standings].sort((a, b) => b.points - a.points).findIndex((s) => s.teamId === userTeamId) + 1;
  const played = league.standings.find((s) => s.teamId === userTeamId)?.played ?? 0;
  const won = league.standings.find((s) => s.teamId === userTeamId)?.won ?? 0;
  const drawn = league.standings.find((s) => s.teamId === userTeamId)?.drawn ?? 0;
  const lost = league.standings.find((s) => s.teamId === userTeamId)?.lost ?? 0;
  const winRate = played > 0 ? Math.round((won / played) * 100) : 0;

  return (
    <div style={{ padding: '12px 16px', overflowY: 'auto', height: '100%' }}>
      <h3 style={{ margin: '0 0 16px', fontSize: 15 }}>👤 Manager Profile</h3>

      {/* Manager card */}
      <div style={{ padding: '16px', background: 'rgba(96,165,250,0.05)', borderRadius: 8, border: '1px solid rgba(96,165,250,0.15)', marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#e0e0e0' }}>The Gaffer</div>
            <div style={{ fontSize: 12, color: '#888' }}>Managing {userTeam.name} • Season {seasonNumber}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, color: '#888' }}>Board Confidence</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: (board?.confidence ?? 50) >= 60 ? '#4ade80' : '#fbbf24' }}>{board?.confidence ?? 50}%</div>
          </div>
        </div>
      </div>

      {/* Current season stats */}
      <h4 style={{ fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Current Season</h4>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
        <StatCard label="Position" value={`${userStanding}${getOrdinal(userStanding)}`} />
        <StatCard label="Win Rate" value={`${winRate}%`} />
        <StatCard label="Record" value={`${won}W ${drawn}D ${lost}L`} />
        <StatCard label="Played" value={String(played)} />
      </div>

      {/* Career records */}
      <h4 style={{ fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Career Records</h4>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
        <StatCard label="Titles Won" value={String(clubRecords.titlesWon)} />
        <StatCard label="Seasons" value={String(clubRecords.seasonsPlayed)} />
        <StatCard label="Best Points" value={String(clubRecords.highestPoints)} />
        <StatCard label="Most Goals" value={String(clubRecords.mostGoalsInSeason)} />
      </div>

      {/* Season history */}
      <h4 style={{ fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Season History</h4>
      {seasonHistory.length === 0 ? (
        <div style={{ color: '#666', fontSize: 13 }}>No completed seasons yet.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[...seasonHistory].reverse().map((record) => (
            <div key={record.season} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: 4, fontSize: 12 }}>
              <span style={{ color: '#888', width: 60 }}>S{record.season}</span>
              <span style={{ flex: 1 }}>Finished {record.userPosition}{getOrdinal(record.userPosition)} ({record.userPoints} pts)</span>
              {record.championId === userTeamId && <span style={{ color: '#fbbf24' }}>🏆 Champions</span>}
              <span style={{ color: '#888' }}>Champion: {record.championName}</span>
            </div>
          ))}
        </div>
      )}

      {/* Biggest results */}
      <h4 style={{ fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: 1, margin: '16px 0 8px' }}>Notable Results</h4>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div style={{ padding: '10px', background: 'rgba(74,222,128,0.05)', borderRadius: 6 }}>
          <div style={{ fontSize: 11, color: '#4ade80', marginBottom: 4 }}>Biggest Win</div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{clubRecords.biggestWin?.scoreline ?? '—'}</div>
          {clubRecords.biggestWin && <div style={{ fontSize: 11, color: '#888' }}>vs {clubRecords.biggestWin.opponent} (S{clubRecords.biggestWin.season})</div>}
        </div>
        <div style={{ padding: '10px', background: 'rgba(248,113,113,0.05)', borderRadius: 6 }}>
          <div style={{ fontSize: 11, color: '#f87171', marginBottom: 4 }}>Biggest Loss</div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{clubRecords.biggestLoss?.scoreline ?? '—'}</div>
          {clubRecords.biggestLoss && <div style={{ fontSize: 11, color: '#888' }}>vs {clubRecords.biggestLoss.opponent} (S{clubRecords.biggestLoss.season})</div>}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: 6, textAlign: 'center' }}>
      <div style={{ fontSize: 16, fontWeight: 700, color: '#e0e0e0' }}>{value}</div>
      <div style={{ fontSize: 10, color: '#888', marginTop: 2 }}>{label}</div>
    </div>
  );
}

function getOrdinal(n: number): string {
  if (n === 1) return 'st';
  if (n === 2) return 'nd';
  if (n === 3) return 'rd';
  return 'th';
}
