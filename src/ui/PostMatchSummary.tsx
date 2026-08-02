import { useMemo, memo } from 'react';
import { useGameStore } from '../store/gameStore';
import { MatchState } from '../types';

interface PlayerRating {
  playerId: string;
  name: string;
  position: string;
  rating: number;
  goals: number;
  assists: number;
  keyEvents: number;
}

function computeRatings(state: MatchState, teamId: string, players: Array<{ id: string; name: string; position: string }>): PlayerRating[] {
  const ratings: PlayerRating[] = players.slice(0, 11).map((p) => ({
    playerId: p.id,
    name: p.name,
    position: p.position,
    rating: 6.0,
    goals: 0,
    assists: 0,
    keyEvents: 0,
  }));

  for (const evt of state.events) {
    if (evt.teamId !== teamId || !evt.playerId) continue;
    const player = ratings.find((r) => r.playerId === evt.playerId);
    if (!player) continue;

    switch (evt.type) {
      case 'goal':
        player.goals++;
        player.rating += 1.5;
        player.keyEvents++;
        break;
      case 'save':
        player.rating += 0.8;
        player.keyEvents++;
        break;
      case 'shot':
        if (evt.outcome === 'success') player.rating += 0.3;
        player.keyEvents++;
        break;
      case 'tackle':
        if (evt.outcome === 'success') player.rating += 0.3;
        else player.rating -= 0.2;
        break;
      case 'pass':
        if (evt.outcome === 'success') player.rating += 0.05;
        else player.rating -= 0.1;
        break;
      case 'foul':
        player.rating -= 0.3;
        break;
      case 'yellow_card':
        player.rating -= 0.5;
        break;
      case 'red_card':
        player.rating -= 1.5;
        break;
    }
  }

  return ratings.map((r) => ({ ...r, rating: Math.max(3, Math.min(10, Math.round(r.rating * 10) / 10)) }));
}

export const PostMatchSummary = memo(function PostMatchSummary() {
  const matchState = useGameStore((s) => s.matchState);
  const matchHome = useGameStore((s) => s.matchHome);
  const matchAway = useGameStore((s) => s.matchAway);

  const homeRatings = useMemo(() => {
    if (!matchState || !matchHome) return [];
    return computeRatings(matchState, matchHome.id, matchHome.players);
  }, [matchState, matchHome]);

  const awayRatings = useMemo(() => {
    if (!matchState || !matchAway) return [];
    return computeRatings(matchState, matchAway.id, matchAway.players);
  }, [matchState, matchAway]);

  if (!matchState || matchState.status !== 'full_time' || !matchHome || !matchAway) return null;

  const ratingColor = (r: number) => r >= 8 ? '#4ade80' : r >= 7 ? '#a3e635' : r >= 6 ? '#fbbf24' : '#f87171';

  const manOfTheMatch = [...homeRatings, ...awayRatings].sort((a, b) => b.rating - a.rating)[0];

  return (
    <div style={{ padding: '12px 16px', overflowY: 'auto', height: '100%' }}>
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 24, fontWeight: 700 }}>
          {matchHome.shortName} {matchState.homeScore} - {matchState.awayScore} {matchAway.shortName}
        </div>
        <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>Full Time</div>
        {manOfTheMatch && (
          <div style={{ marginTop: 8, fontSize: 13, color: '#fbbf24' }}>
            ⭐ Man of the Match: {manOfTheMatch.name} ({manOfTheMatch.rating})
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <RatingColumn title={matchHome.name} ratings={homeRatings} color={matchHome.colors.primary} ratingColor={ratingColor} />
        <RatingColumn title={matchAway.name} ratings={awayRatings} color={matchAway.colors.primary} ratingColor={ratingColor} />
      </div>
    </div>
  );
});

function RatingColumn({ title, ratings, color, ratingColor }: {
  title: string;
  ratings: PlayerRating[];
  color: string;
  ratingColor: (r: number) => string;
}) {
  return (
    <div>
      <h4 style={{ fontSize: 13, color, marginBottom: 8, fontWeight: 600 }}>{title}</h4>
      <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
        <tbody>
          {ratings.sort((a, b) => b.rating - a.rating).map((r) => (
            <tr key={r.playerId} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <td style={{ padding: '3px 6px', color: '#60a5fa', width: 30 }}>{r.position}</td>
              <td style={{ padding: '3px 6px' }}>
                {r.name.split(' ').pop()}
                {r.goals > 0 && <span style={{ marginLeft: 4 }}>⚽{r.goals > 1 ? `×${r.goals}` : ''}</span>}
              </td>
              <td style={{ padding: '3px 6px', fontWeight: 700, color: ratingColor(r.rating), textAlign: 'right' }}>
                {r.rating.toFixed(1)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
