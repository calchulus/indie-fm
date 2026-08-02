import { useGameStore } from '../store/gameStore';
import { generateSeasonReview } from '../simulation/season-systems';
import { useMemo } from 'react';

export function SeasonReviewScreen() {
  const { league, userTeamId, seasonNumber, seasonComplete } = useGameStore();

  const review = useMemo(() => {
    if (!league || !userTeamId || !seasonComplete) return null;
    return generateSeasonReview(league, userTeamId, seasonNumber - 1);
  }, [league, userTeamId, seasonNumber, seasonComplete]);

  if (!review) {
    return <div style={{ padding: 20, color: '#888', textAlign: 'center' }}>Complete a season to view the end-of-season review.</div>;
  }

  return (
    <div style={{ padding: '12px 16px', overflowY: 'auto', height: '100%' }}>
      <h3 style={{ margin: '0 0 16px', fontSize: 15 }}>📋 Season {review.season} Review</h3>

      {/* Final position */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
        <StatBox label="Final Position" value={`${review.finalPosition}${getOrdinal(review.finalPosition)}`} highlight={review.finalPosition <= 4} />
        <StatBox label="Points" value={String(review.points)} />
        <StatBox label="Record" value={`${review.record.w}W ${review.record.d}D ${review.record.l}L`} />
        <StatBox label="Goals" value={`${review.goalsScored}F ${review.goalsConceded}A`} />
      </div>

      {/* Champion */}
      <div style={{ padding: '12px 14px', background: 'rgba(251,191,36,0.08)', borderRadius: 8, marginBottom: 16, border: '1px solid rgba(251,191,36,0.2)' }}>
        <div style={{ fontSize: 13, color: '#fbbf24', fontWeight: 600 }}>🏆 Champions: {review.champion}</div>
      </div>

      {/* Key performers */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
          <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>TOP SCORER</div>
          {review.topScorer ? (
            <div style={{ fontSize: 14, fontWeight: 600 }}>{review.topScorer.name} <span style={{ color: '#4ade80' }}>({review.topScorer.goals})</span></div>
          ) : <div style={{ fontSize: 12, color: '#666' }}>No goals scored</div>}
        </div>
        <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
          <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>TOP ASSISTER</div>
          {review.topAssister ? (
            <div style={{ fontSize: 14, fontWeight: 600 }}>{review.topAssister.name} <span style={{ color: '#60a5fa' }}>({review.topAssister.assists})</span></div>
          ) : <div style={{ fontSize: 12, color: '#666' }}>No assists recorded</div>}
        </div>
      </div>

      {/* Best/Worst results */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        <div style={{ padding: '12px', background: 'rgba(74,222,128,0.05)', borderRadius: 8 }}>
          <div style={{ fontSize: 11, color: '#4ade80', marginBottom: 4 }}>BEST WIN</div>
          <div style={{ fontSize: 13 }}>{review.bestWin ?? '—'}</div>
        </div>
        <div style={{ padding: '12px', background: 'rgba(248,113,113,0.05)', borderRadius: 8 }}>
          <div style={{ fontSize: 11, color: '#f87171', marginBottom: 4 }}>WORST LOSS</div>
          <div style={{ fontSize: 13 }}>{review.worstLoss ?? '—'}</div>
        </div>
      </div>

      {/* Relegated */}
      {review.relegated.length > 0 && (
        <div style={{ padding: '12px 14px', background: 'rgba(248,113,113,0.05)', borderRadius: 8, border: '1px solid rgba(248,113,113,0.15)' }}>
          <div style={{ fontSize: 11, color: '#f87171', marginBottom: 4 }}>RELEGATED</div>
          <div style={{ fontSize: 13 }}>{review.relegated.join(', ')}</div>
        </div>
      )}
    </div>
  );
}

function StatBox({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div style={{ padding: '10px', background: highlight ? 'rgba(74,222,128,0.08)' : 'rgba(255,255,255,0.03)', borderRadius: 6, textAlign: 'center', border: highlight ? '1px solid rgba(74,222,128,0.2)' : 'none' }}>
      <div style={{ fontSize: 16, fontWeight: 700, color: highlight ? '#4ade80' : '#e0e0e0' }}>{value}</div>
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
