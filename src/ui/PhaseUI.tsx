import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { Phase, generateDraftProspects } from '../simulation/phase-system';
import { generateFreeAgentPool } from '../simulation/phase-system';

// --- #1: Phase Transition Modal ---
export function PhaseTransitionModal() {
  const { seasonState, league } = useGameStore();
  const [dismissed, setDismissed] = useState<Phase | null>(null);

  if (!league || !seasonState) return null;
  if (dismissed === seasonState.phase) return null;

  const phaseInfo: Record<number, { icon: string; title: string; description: string }> = {
    [Phase.PLAYOFFS]: { icon: '🏆', title: 'Playoffs Begin!', description: 'The top 16 teams compete for the championship. Win 4 rounds to lift the trophy.' },
    [Phase.DRAFT]: { icon: '📋', title: 'Draft Day', description: 'Select young prospects to join your squad. Worst record picks first.' },
    [Phase.FREE_AGENCY]: { icon: '🆓', title: 'Free Agency Open', description: 'Unsigned players are available. Sign them before rival clubs do.' },
    [Phase.RESIGN_PLAYERS]: { icon: '📝', title: 'Re-Signing Period', description: 'Negotiate contract extensions with your players before they leave.' },
    [Phase.PRESEASON]: { icon: '🗓️', title: `Season ${seasonState.seasonNumber}`, description: 'A new season begins! Players have developed over the summer. Preseason friendlies ahead.' },
    [Phase.AFTER_TRADE_DEADLINE]: { icon: '🔒', title: 'Trade Deadline Passed', description: 'No more transfers until next season. Focus on the final stretch.' },
  };

  const info = phaseInfo[seasonState.phase];
  if (!info) return null;

  return (
    <div role="dialog" aria-label={info.title} aria-modal="true" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
      <div style={{ background: '#1a1a2e', borderRadius: 16, padding: 32, maxWidth: 420, width: '90%', textAlign: 'center', border: '1px solid rgba(255,255,255,0.15)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>{info.icon}</div>
        <h2 style={{ margin: '0 0 8px', fontSize: 20, color: '#e0e0e0' }}>{info.title}</h2>
        <p style={{ margin: '0 0 20px', fontSize: 13, color: '#aaa', lineHeight: 1.5 }}>{info.description}</p>
        <button
          onClick={() => setDismissed(seasonState.phase)}
          style={{ padding: '10px 24px', fontSize: 14, background: 'rgba(74,222,128,0.2)', border: '1px solid rgba(74,222,128,0.4)', borderRadius: 8, color: '#4ade80', cursor: 'pointer', fontWeight: 600 }}
        >
          Continue →
        </button>
      </div>
    </div>
  );
}

// --- #2: Draft UI ---
export function DraftScreen() {
  const { league, userTeamId, addToast } = useGameStore();
  const [prospects] = useState(() => generateDraftProspects(20));
  const [picked, setPicked] = useState<Set<string>>(new Set());

  if (!league || !userTeamId) return null;

  // User's pick position (based on final standing — worst picks first)
  const sorted = [...league.standings].sort((a, b) => a.points - b.points);
  const userPickPos = sorted.findIndex((s) => s.teamId === userTeamId) + 1;

  const handlePick = (prospectId: string) => {
    const prospect = prospects.find((p) => p.id === prospectId);
    if (!prospect || picked.has(prospectId)) return;
    setPicked((prev) => new Set([...prev, prospectId]));
    addToast(`📋 Draft pick: ${prospect.name} (${prospect.position}, ${prospect.potential}★ potential)`, 'success');
  };

  return (
    <div style={{ padding: '12px 16px', overflowY: 'auto', height: '100%' }}>
      <h3 style={{ margin: '0 0 4px', fontSize: 15 }}>📋 Youth Draft</h3>
      <div style={{ fontSize: 12, color: '#888', marginBottom: 12 }}>
        Your pick position: <strong>#{userPickPos}</strong> of {league.teams.length} • {prospects.length - picked.size} prospects remaining
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {prospects.map((p, i) => {
          const isPicked = picked.has(p.id);
          return (
            <div key={p.id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '8px 10px', borderRadius: 6, opacity: isPicked ? 0.4 : 1,
              background: isPicked ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>
                  <span style={{ color: '#666', marginRight: 6 }}>#{i + 1}</span>
                  {p.name}
                </div>
                <div style={{ fontSize: 11, color: '#888' }}>
                  {p.position} • Age {p.age} • OVR {p.overall} • {'★'.repeat(p.potential)}{'☆'.repeat(5 - p.potential)}
                </div>
              </div>
              {!isPicked && (
                <button
                  onClick={() => handlePick(p.id)}
                  style={{ padding: '4px 12px', fontSize: 11, background: 'rgba(74,222,128,0.2)', border: 'none', borderRadius: 4, color: '#4ade80', cursor: 'pointer' }}
                >
                  Select
                </button>
              )}
              {isPicked && <span style={{ fontSize: 11, color: '#4ade80' }}>✓ Picked</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// --- #3: Free Agency UI ---
export function FreeAgencyScreen() {
  const { league, userTeamId, addToast } = useGameStore();
  const [pool] = useState(() => generateFreeAgentPool(15));
  const [signed, setSigned] = useState<Set<string>>(new Set());

  if (!league || !userTeamId) return null;

  const handleSign = (playerId: string) => {
    const player = pool.find((p) => p.playerId === playerId);
    if (!player || signed.has(playerId)) return;
    setSigned((prev) => new Set([...prev, playerId]));
    addToast(`🆓 Signed ${player.playerName} (${player.position}, OVR ${player.overall}) on a free!`, 'success');
  };

  return (
    <div style={{ padding: '12px 16px', overflowY: 'auto', height: '100%' }}>
      <h3 style={{ margin: '0 0 4px', fontSize: 15 }}>🆓 Free Agency</h3>
      <div style={{ fontSize: 12, color: '#888', marginBottom: 12 }}>
        {pool.length - signed.size} players available • Demands decrease over time
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {pool.map((p) => {
          const isSigned = signed.has(p.playerId);
          return (
            <div key={p.playerId} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '8px 10px', borderRadius: 6, opacity: isSigned ? 0.4 : 1,
              background: isSigned ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{p.playerName}</div>
                <div style={{ fontSize: 11, color: '#888' }}>
                  {p.position} • Age {p.age} • OVR {p.overall} • Wage: £{(p.askingWage / 1000).toFixed(0)}k/wk
                  {p.daysAvailable > 0 && <span style={{ color: '#facc15' }}> • {p.daysAvailable}d waiting</span>}
                </div>
              </div>
              {!isSigned ? (
                <button
                  onClick={() => handleSign(p.playerId)}
                  style={{ padding: '4px 12px', fontSize: 11, background: 'rgba(74,222,128,0.2)', border: 'none', borderRadius: 4, color: '#4ade80', cursor: 'pointer' }}
                >
                  Sign
                </button>
              ) : (
                <span style={{ fontSize: 11, color: '#4ade80' }}>✓ Signed</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// --- #4: Playoff Progression UI ---
export function PlayoffScreen() {
  const { league, userTeamId, playoffBracket, addToast } = useGameStore();
  const [results, setResults] = useState<Map<string, { home: number; away: number }>>(new Map());

  if (!league || !userTeamId) return null;
  const teamName = (id: string) => league.teams.find((t) => t.id === id)?.shortName ?? '?';
  const isUserMatch = (homeId: string, awayId: string) => homeId === userTeamId || awayId === userTeamId;

  const handlePlayMatch = (matchId: string, homeId: string, awayId: string) => {
    if (results.has(matchId)) return;
    // Simulate result
    const homeGoals = Math.floor(Math.random() * 4);
    const awayGoals = Math.floor(Math.random() * 3);
    setResults((prev) => new Map([...prev, [matchId, { home: homeGoals, away: awayGoals }]]));
    if (isUserMatch(homeId, awayId)) {
      const userWon = (homeId === userTeamId && homeGoals > awayGoals) || (awayId === userTeamId && awayGoals > homeGoals);
      addToast(userWon ? `🏆 You win ${homeGoals}-${awayGoals}! Advancing.` : `❌ Lost ${homeGoals}-${awayGoals}. Eliminated.`, userWon ? 'success' : 'error');
    }
  };

  const roundNames = ['Round of 16', 'Quarter-Final', 'Semi-Final', 'Final'];
  const rounds = [0, 1, 2, 3];

  return (
    <div style={{ padding: '12px 16px', overflowY: 'auto', height: '100%' }}>
      <h3 style={{ margin: '0 0 12px', fontSize: 15 }}>🏆 Playoff Bracket</h3>
      <div style={{ display: 'flex', gap: 20, overflowX: 'auto' }}>
        {rounds.map((round) => {
          const matches = playoffBracket.filter((s) => s.round === round);
          if (matches.length === 0 && round > 0) return null;
          return (
            <div key={round} style={{ minWidth: 180 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#60a5fa', marginBottom: 8 }}>{roundNames[round]}</div>
              {matches.map((m, i) => {
                const matchId = `${round}_${i}`;
                const result = results.get(matchId);
                const userMatch = isUserMatch(m.homeId, m.awayId);
                return (
                  <div key={matchId} style={{
                    padding: '6px 8px', marginBottom: 6, borderRadius: 6, fontSize: 11,
                    background: userMatch ? 'rgba(96,165,250,0.1)' : 'rgba(255,255,255,0.03)',
                    border: userMatch ? '1px solid rgba(96,165,250,0.3)' : '1px solid rgba(255,255,255,0.06)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: result && result.home > result.away ? '#4ade80' : '#e0e0e0' }}>{teamName(m.homeId)}</span>
                      <span style={{ color: '#888' }}>{result ? result.home : '-'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: result && result.away > result.home ? '#4ade80' : '#e0e0e0' }}>{teamName(m.awayId)}</span>
                      <span style={{ color: '#888' }}>{result ? result.away : '-'}</span>
                    </div>
                    {!result && (
                      <button
                        onClick={() => handlePlayMatch(matchId, m.homeId, m.awayId)}
                        style={{ marginTop: 4, padding: '2px 8px', fontSize: 10, background: 'rgba(96,165,250,0.2)', border: 'none', borderRadius: 3, color: '#60a5fa', cursor: 'pointer', width: '100%' }}
                      >
                        {userMatch ? '▶ Play' : 'Sim'}
                      </button>
                    )}
                  </div>
                );
              })}
              {matches.length === 0 && <div style={{ fontSize: 11, color: '#555' }}>Awaiting results…</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// --- #5: Season Summary Screen ---
export function SeasonSummaryScreen() {
  const { league, userTeamId, seasonState, seasonAwards, allMatchStats } = useGameStore();

  if (!league || !userTeamId) return null;

  const sorted = [...league.standings].sort((a, b) => b.points - a.points);
  const userPos = sorted.findIndex((s) => s.teamId === userTeamId) + 1;
  const userStanding = sorted[userPos - 1];
  const userTeam = league.teams.find((t) => t.id === userTeamId);

  // User's season stats from allMatchStats
  const userStats = allMatchStats.filter((s) => s.teamId === userTeamId);
  const totalGoals = userStats.reduce((s, m) => s + m.goals, 0);
  const totalAssists = userStats.reduce((s, m) => s + m.assists, 0);
  const avgRating = userStats.length > 0 ? (userStats.reduce((s, m) => s + m.rating, 0) / userStats.length).toFixed(2) : '—';

  return (
    <div style={{ padding: '16px', overflowY: 'auto', height: '100%' }}>
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: 24, marginBottom: 4 }}>🏁</div>
        <h2 style={{ margin: '0 0 4px', fontSize: 18 }}>Season {seasonState.seasonNumber} Complete</h2>
        <div style={{ fontSize: 14, color: userPos <= 4 ? '#4ade80' : userPos >= 17 ? '#f87171' : '#e0e0e0' }}>
          {userTeam?.name} finished <strong>{userPos}{userPos === 1 ? 'st' : userPos === 2 ? 'nd' : userPos === 3 ? 'rd' : 'th'}</strong>
        </div>
      </div>

      {/* Final table (top 5 + bottom 3) */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Final Table</div>
        <table style={{ width: '100%', fontSize: 11, borderCollapse: 'collapse' }}>
          <tbody>
            {sorted.slice(0, 5).map((s, i) => (
              <tr key={s.teamId} style={{ background: s.teamId === userTeamId ? 'rgba(96,165,250,0.1)' : 'transparent' }}>
                <td style={{ padding: '3px 6px', color: '#888' }}>{i + 1}</td>
                <td style={{ padding: '3px 6px', color: '#e0e0e0' }}>{league.teams.find((t) => t.id === s.teamId)?.name}</td>
                <td style={{ padding: '3px 6px', textAlign: 'right', color: '#888' }}>{s.points} pts</td>
              </tr>
            ))}
            <tr><td colSpan={3} style={{ padding: '2px 6px', color: '#555', textAlign: 'center' }}>…</td></tr>
            {sorted.slice(-3).map((s, i) => (
              <tr key={s.teamId} style={{ background: s.teamId === userTeamId ? 'rgba(96,165,250,0.1)' : 'transparent' }}>
                <td style={{ padding: '3px 6px', color: '#f87171' }}>{sorted.length - 2 + i}</td>
                <td style={{ padding: '3px 6px', color: '#e0e0e0' }}>{league.teams.find((t) => t.id === s.teamId)?.name}</td>
                <td style={{ padding: '3px 6px', textAlign: 'right', color: '#888' }}>{s.points} pts</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Your season */}
      <div style={{ marginBottom: 16, padding: 12, background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Your Season</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, fontSize: 12 }}>
          <div><span style={{ color: '#888' }}>Record: </span>{userStanding?.won}W {userStanding?.drawn}D {userStanding?.lost}L</div>
          <div><span style={{ color: '#888' }}>Goals: </span>{totalGoals}</div>
          <div><span style={{ color: '#888' }}>Assists: </span>{totalAssists}</div>
          <div><span style={{ color: '#888' }}>Avg Rating: </span>{avgRating}</div>
          <div><span style={{ color: '#888' }}>Points: </span>{userStanding?.points}</div>
          <div><span style={{ color: '#888' }}>GD: </span>{(userStanding?.goalsFor ?? 0) - (userStanding?.goalsAgainst ?? 0)}</div>
        </div>
      </div>

      {/* Awards */}
      {seasonAwards && (
        <div style={{ padding: 12, background: 'rgba(250,204,21,0.05)', borderRadius: 8, border: '1px solid rgba(250,204,21,0.15)' }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: '#facc15' }}>🏅 Season Awards</div>
          <div style={{ fontSize: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {seasonAwards.mvp && <div>⭐ MVP: {seasonAwards.mvp.playerName} ({seasonAwards.mvp.rating} avg)</div>}
            {seasonAwards.topScorer && <div>⚽ Golden Boot: {seasonAwards.topScorer.playerName} ({seasonAwards.topScorer.goals} goals)</div>}
            {seasonAwards.mostAssists && <div>🎨 Playmaker: {seasonAwards.mostAssists.playerName} ({seasonAwards.mostAssists.assists} assists)</div>}
            {seasonAwards.bestGK && <div>🧤 Golden Glove: {seasonAwards.bestGK.playerName} ({seasonAwards.bestGK.saves} saves)</div>}
          </div>
        </div>
      )}
    </div>
  );
}
