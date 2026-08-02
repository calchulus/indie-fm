import { useMemo } from 'react';
import { useGameStore } from '../store/gameStore';
import { generateMatchPreview, getWeatherDescription } from '../simulation/preview';

export function MatchPreviewPanel() {
  const matchHome = useGameStore((s) => s.matchHome);
  const matchAway = useGameStore((s) => s.matchAway);

  const preview = useMemo(() => {
    if (!matchHome || !matchAway) return null;
    return generateMatchPreview(matchHome, matchAway);
  }, [matchHome, matchAway]);

  if (!preview || !matchHome || !matchAway) return null;

  return (
    <div style={{ padding: '12px 16px', overflowY: 'auto', height: '100%' }}>
      <h3 style={{ margin: '0 0 12px', fontSize: 15 }}>📋 Match Preview</h3>

      {/* Weather + Referee */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
        <div style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 6 }}>
          <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>WEATHER</div>
          <div style={{ fontSize: 13 }}>{getWeatherDescription(preview.weather)}</div>
        </div>
        <div style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 6 }}>
          <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>REFEREE</div>
          <div style={{ fontSize: 13 }}>{preview.referee.name}</div>
          <div style={{ fontSize: 11, color: '#888' }}>
            Strictness: {preview.referee.strictness}/10 • ~{preview.referee.avgCardsPerMatch} cards/match
          </div>
        </div>
      </div>

      {/* Head to Head */}
      <div style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 6, marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>HEAD-TO-HEAD ({preview.headToHead.meetings} meetings)</div>
        <div style={{ display: 'flex', gap: 16, fontSize: 13 }}>
          <span style={{ color: matchHome.colors.primary }}>{matchHome.shortName}: {preview.headToHead.homeWins}W</span>
          <span style={{ color: '#888' }}>Draws: {preview.headToHead.draws}</span>
          <span style={{ color: matchAway.colors.primary }}>{matchAway.shortName}: {preview.headToHead.awayWins}W</span>
        </div>
        {preview.headToHead.lastResult && (
          <div style={{ fontSize: 11, color: '#888', marginTop: 4 }}>Last meeting: {preview.headToHead.lastResult}</div>
        )}
      </div>

      {/* Team News */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <TeamNewsCard title={matchHome.name} news={preview.homeTeamNews} color={matchHome.colors.primary} />
        <TeamNewsCard title={matchAway.name} news={preview.awayTeamNews} color={matchAway.colors.primary} />
      </div>
    </div>
  );
}

function TeamNewsCard({ title, news, color }: { title: string; news: { injuries: string[]; suspensions: string[]; keyPlayerName?: string }; color: string }) {
  return (
    <div style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 6 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color, marginBottom: 6 }}>{title}</div>
      {news.keyPlayerName && (
        <div style={{ fontSize: 12, marginBottom: 4 }}>⭐ Key: {news.keyPlayerName}</div>
      )}
      {news.injuries.length > 0 && (
        <div style={{ fontSize: 11, color: '#f87171', marginBottom: 2 }}>
          🏥 Injuries: {news.injuries.join(', ')}
        </div>
      )}
      {news.suspensions.length > 0 && (
        <div style={{ fontSize: 11, color: '#fbbf24' }}>
          🟥 Suspended: {news.suspensions.join(', ')}
        </div>
      )}
      {news.injuries.length === 0 && news.suspensions.length === 0 && (
        <div style={{ fontSize: 11, color: '#4ade80' }}>✅ Full squad available</div>
      )}
    </div>
  );
}
