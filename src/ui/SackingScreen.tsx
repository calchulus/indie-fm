import { useGameStore } from '../store/gameStore';

export function SackingScreen({ onNewCareer }: { onNewCareer: () => void }) {
  const { league, userTeamId, seasonHistory, clubRecords } = useGameStore();

  const userTeam = league?.teams.find((t) => t.id === userTeamId);
  const sorted = league ? [...league.standings].sort((a, b) => b.points - a.points) : [];
  const position = sorted.findIndex((s) => s.teamId === userTeamId) + 1;
  const record = sorted.find((s) => s.teamId === userTeamId);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
      <div style={{ background: '#1e1e2e', borderRadius: 12, padding: '32px', width: 450, textAlign: 'center', border: '1px solid rgba(248,113,113,0.3)' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🚪</div>
        <h2 style={{ margin: '0 0 8px', fontSize: 22, color: '#f87171' }}>You've Been Sacked</h2>
        <p style={{ fontSize: 14, color: '#888', marginBottom: 24 }}>
          The board of {userTeam?.name ?? 'your club'} has lost all confidence in your ability to manage this club.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
          <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{position}{getOrdinal(position)}</div>
            <div style={{ fontSize: 11, color: '#888' }}>Final Position</div>
          </div>
          <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{record?.won ?? 0}W {record?.drawn ?? 0}D {record?.lost ?? 0}L</div>
            <div style={{ fontSize: 11, color: '#888' }}>Record</div>
          </div>
          <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{clubRecords?.titlesWon ?? 0}</div>
            <div style={{ fontSize: 11, color: '#888' }}>Trophies Won</div>
          </div>
        </div>

        <div style={{ fontSize: 12, color: '#888', marginBottom: 24 }}>
          Seasons managed: {seasonHistory?.length ?? 0} • Highest points: {clubRecords?.highestPoints ?? 0}
        </div>

        <button onClick={onNewCareer} style={{ padding: '12px 24px', background: 'rgba(74,222,128,0.2)', border: 'none', borderRadius: 6, color: '#4ade80', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
          Start New Career
        </button>
      </div>
    </div>
  );
}

function getOrdinal(n: number): string {
  if (n === 1) return 'st';
  if (n === 2) return 'nd';
  if (n === 3) return 'rd';
  return 'th';
}
