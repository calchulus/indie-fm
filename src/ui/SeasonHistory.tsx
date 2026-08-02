import { useGameStore } from '../store/gameStore';

export function SeasonHistory() {
  const { seasonHistory, clubRecords, seasonNumber, league, userTeamId } = useGameStore();

  const userTeamName = league?.teams.find((t) => t.id === userTeamId)?.name ?? 'Your Club';

  return (
    <div style={{ padding: '12px 16px', overflowY: 'auto', height: '100%' }}>
      <h3 style={{ margin: '0 0 16px', fontSize: 15 }}>📜 Season History</h3>

      {/* Club Records */}
      <div style={{ marginBottom: 20 }}>
        <h4 style={{ fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
          {userTeamName} — Club Records
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          <RecordCard label="Titles Won" value={String(clubRecords.titlesWon)} />
          <RecordCard label="Seasons Played" value={String(clubRecords.seasonsPlayed)} />
          <RecordCard label="Highest Points" value={String(clubRecords.highestPoints)} />
          <RecordCard label="Most Goals (Season)" value={String(clubRecords.mostGoalsInSeason)} />
          <RecordCard label="Fewest Conceded" value={clubRecords.fewestGoalsConceded === 999 ? '—' : String(clubRecords.fewestGoalsConceded)} />
          <RecordCard label="Biggest Win" value={clubRecords.biggestWin?.scoreline ?? '—'} />
          <RecordCard label="Biggest Loss" value={clubRecords.biggestLoss?.scoreline ?? '—'} />
          <RecordCard label="Current Season" value={`#${seasonNumber}`} />
        </div>
      </div>

      {/* Past Seasons */}
      <h4 style={{ fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
        Past Seasons ({seasonHistory.length})
      </h4>
      {seasonHistory.length === 0 && (
        <div style={{ color: '#666', fontSize: 13 }}>No completed seasons yet. Simulate to end of season to record history.</div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[...seasonHistory].reverse().map((record) => (
          <div key={record.season} style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>Season {record.season}</span>
              <span style={{ fontSize: 12, color: record.championId === userTeamId ? '#4ade80' : '#888' }}>
                {record.championId === userTeamId ? '🏆 Champions!' : `Champion: ${record.championName}`}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#aaa' }}>
              <span>Your position: <strong style={{ color: '#e0e0e0' }}>{record.userPosition}{getOrdinal(record.userPosition)}</strong></span>
              <span>Points: <strong style={{ color: '#e0e0e0' }}>{record.userPoints}</strong></span>
              <span>Runner-up: {record.runnerUpName}</span>
              {record.topScorerName && <span>Top scorer: {record.topScorerName} ({record.topScorerGoals})</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecordCard({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ padding: '8px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: 6, textAlign: 'center' }}>
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
