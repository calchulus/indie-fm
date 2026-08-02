import { useMemo } from 'react';
import { useGameStore } from '../store/gameStore';
import { computeLiveRating } from '../simulation/quick-wins';
import { MatchState, Team } from '../types';

// --- Live Player Ratings (during match) ---
export function LiveRatings() {
  const { matchState, matchHome, matchAway } = useGameStore();
  if (!matchState || !matchHome || !matchAway) return <div style={{ padding: 16, color: '#888' }}>No match in progress.</div>;

  return (
    <div style={{ padding: '8px 12px', overflowY: 'auto', height: '100%', fontSize: 12 }}>
      <h4 style={{ margin: '0 0 8px', fontSize: 13 }}>📊 Live Ratings — {matchState.minute}'</h4>
      <div style={{ display: 'flex', gap: 16 }}>
        <TeamRatings team={matchHome} state={matchState} />
        <TeamRatings team={matchAway} state={matchState} />
      </div>
    </div>
  );
}

function TeamRatings({ team, state }: { team: Team; state: MatchState }) {
  const ratings = useMemo(() => {
    return team.players.slice(0, 11).map((p) => ({
      name: p.name.split(' ').pop() ?? p.name,
      position: p.position,
      rating: computeLiveRating(p.id, state.events, state.minute),
      goals: state.events.filter((e) => e.playerId === p.id && e.type === 'goal' && e.outcome === 'success').length,
    })).sort((a, b) => b.rating - a.rating);
  }, [team, state.events, state.minute]);

  const ratingColor = (r: number) => r >= 8 ? '#4ade80' : r >= 7 ? '#86efac' : r >= 6 ? '#e0e0e0' : r >= 5 ? '#facc15' : '#f87171';

  return (
    <div style={{ flex: 1 }}>
      <div style={{ fontWeight: 600, marginBottom: 6, color: '#60a5fa' }}>{team.shortName}</div>
      {ratings.map((p) => (
        <div key={p.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <span style={{ color: '#aaa' }}>
            <span style={{ color: '#666', marginRight: 4 }}>{p.position}</span>
            {p.name}
            {p.goals > 0 && <span style={{ color: '#4ade80', marginLeft: 4 }}>⚽{p.goals > 1 ? `×${p.goals}` : ''}</span>}
          </span>
          <span style={{ fontWeight: 700, color: ratingColor(p.rating), minWidth: 28, textAlign: 'right' }}>
            {p.rating.toFixed(1)}
          </span>
        </div>
      ))}
    </div>
  );
}

// --- Post-Match Report Card ---
export function MatchReportCard() {
  const { matchState, matchHome, matchAway } = useGameStore();
  if (!matchState || !matchHome || !matchAway) return <div style={{ padding: 16, color: '#888' }}>No match data.</div>;
  if (matchState.status !== 'full_time') return <div style={{ padding: 16, color: '#888' }}>Match not yet finished. Ratings available at full time.</div>;

  const homeRatings = computeTeamReport(matchHome, matchState);
  const awayRatings = computeTeamReport(matchAway, matchState);
  const motm = [...homeRatings, ...awayRatings].sort((a, b) => b.rating - a.rating)[0];

  const ratingColor = (r: number) => r >= 8 ? '#4ade80' : r >= 7 ? '#86efac' : r >= 6 ? '#e0e0e0' : r >= 5 ? '#facc15' : '#f87171';
  const ratingBg = (r: number) => r >= 8 ? 'rgba(74,222,128,0.15)' : r >= 7 ? 'rgba(74,222,128,0.08)' : r < 5 ? 'rgba(248,113,113,0.08)' : 'transparent';

  return (
    <div style={{ padding: '12px 16px', overflowY: 'auto', height: '100%' }}>
      <div style={{ textAlign: 'center', marginBottom: 12 }}>
        <div style={{ fontSize: 18, fontWeight: 700 }}>{matchHome.shortName} {matchState.homeScore} - {matchState.awayScore} {matchAway.shortName}</div>
        {motm && <div style={{ fontSize: 12, color: '#facc15', marginTop: 4 }}>⭐ Man of the Match: {motm.name} ({motm.rating.toFixed(1)})</div>}
      </div>

      <div style={{ display: 'flex', gap: 20 }}>
        {[{ team: matchHome, ratings: homeRatings }, { team: matchAway, ratings: awayRatings }].map(({ team, ratings }) => (
          <div key={team.id} style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 13, color: '#60a5fa' }}>{team.name}</div>
            <table style={{ width: '100%', fontSize: 11, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ color: '#666', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <th style={{ textAlign: 'left', padding: '3px 4px' }}>Player</th>
                  <th style={{ textAlign: 'center', padding: '3px 4px' }}>Pos</th>
                  <th style={{ textAlign: 'center', padding: '3px 4px' }}>G</th>
                  <th style={{ textAlign: 'center', padding: '3px 4px' }}>A</th>
                  <th style={{ textAlign: 'center', padding: '3px 4px' }}>Rating</th>
                </tr>
              </thead>
              <tbody>
                {ratings.map((p) => (
                  <tr key={p.id} style={{ background: ratingBg(p.rating) }}>
                    <td style={{ padding: '3px 4px', color: '#e0e0e0' }}>{p.name}</td>
                    <td style={{ padding: '3px 4px', textAlign: 'center', color: '#888' }}>{p.position}</td>
                    <td style={{ padding: '3px 4px', textAlign: 'center', color: p.goals > 0 ? '#4ade80' : '#666' }}>{p.goals || '-'}</td>
                    <td style={{ padding: '3px 4px', textAlign: 'center', color: p.assists > 0 ? '#60a5fa' : '#666' }}>{p.assists || '-'}</td>
                    <td style={{ padding: '3px 4px', textAlign: 'center', fontWeight: 700, color: ratingColor(p.rating) }}>{p.rating.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}

interface PlayerReport {
  id: string;
  name: string;
  position: string;
  rating: number;
  goals: number;
  assists: number;
  keyPasses: number;
  tackles: number;
  saves: number;
  errors: number;
}

function computeTeamReport(team: Team, state: MatchState): PlayerReport[] {
  return team.players.slice(0, 11).map((p) => {
    const events = state.events.filter((e) => e.playerId === p.id);
    const goals = events.filter((e) => e.type === 'goal' && e.outcome === 'success').length;
    const saves = events.filter((e) => e.type === 'save' && e.outcome === 'success').length;
    const tackles = events.filter((e) => e.type === 'tackle' && e.outcome === 'success').length;
    const passesOk = events.filter((e) => e.type === 'pass' && e.outcome === 'success').length;
    const passesFail = events.filter((e) => e.type === 'pass' && e.outcome === 'failure').length;
    const dribblesOk = events.filter((e) => e.type === 'dribble' && e.outcome === 'success').length;

    // Count assists: player passed successfully, then a goal was scored within 3 ticks
    let assists = 0;
    for (let i = 0; i < state.events.length; i++) {
      const evt = state.events[i];
      if (evt.playerId === p.id && evt.type === 'pass' && evt.outcome === 'success') {
        // Check if a goal follows within 3 ticks by the same team
        for (let j = i + 1; j < Math.min(i + 4, state.events.length); j++) {
          if (state.events[j].type === 'goal' && state.events[j].teamId === team.id && state.events[j].playerId !== p.id) {
            assists++;
            break;
          }
        }
      }
    }

    let rating = 6.0;
    rating += goals * 1.5;
    rating += assists * 0.8;
    rating += saves * 0.7;
    rating += tackles * 0.2;
    rating += passesOk * 0.03;
    rating += dribblesOk * 0.15;
    rating -= passesFail * 0.1;
    rating += Math.min(0.5, state.minute * 0.005);

    return {
      id: p.id,
      name: p.name,
      position: p.position,
      rating: Math.max(3, Math.min(10, Math.round(rating * 10) / 10)),
      goals,
      assists,
      keyPasses: passesOk,
      tackles,
      saves,
      errors: passesFail,
    };
  }).sort((a, b) => b.rating - a.rating);
}
