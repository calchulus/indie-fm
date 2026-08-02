import { useGameStore } from '../store/gameStore';
import { MomentumSparkline, computeMomentumSparkline, computeSquadDepth, computeAchievements, buildQuickMatchSummary } from './GameSystemsUI';
import { computeSquadHierarchy } from '../simulation/depth-systems';

export function MatchInsights() {
  const { matchState, matchHome, matchAway } = useGameStore();
  if (!matchState || !matchHome || !matchAway) return <div style={{ padding: 16, color: '#888', fontSize: 13 }}>No match data available.</div>;

  const sparkData = computeMomentumSparkline(matchState.events, matchHome.id);
  const summary = buildQuickMatchSummary(matchState, matchHome, matchAway);

  return (
    <div style={{ padding: '12px 16px', overflowY: 'auto', height: '100%' }}>
      <h3 style={{ margin: '0 0 12px', fontSize: 15 }}>📊 Match Insights</h3>

      {/* Momentum sparkline */}
      <div style={{ marginBottom: 16, padding: 12, background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ fontSize: 12, color: '#aaa', marginBottom: 8 }}>Momentum (home ↑ / away ↓)</div>
        <MomentumSparkline data={sparkData} width={280} height={50} />
      </div>

      {/* Quick summary */}
      <div style={{ padding: 12, background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>
          {summary.homeName} {summary.homeScore} - {summary.awayScore} {summary.awayName}
        </div>
        <div style={{ fontSize: 12, color: '#aaa', marginBottom: 4 }}>
          Possession: {Math.round(summary.possession.home * 100)}% - {Math.round(summary.possession.away * 100)}%
        </div>
        <div style={{ fontSize: 12, color: '#aaa', marginBottom: 4 }}>
          Shots: {summary.shots.home} - {summary.shots.away}
        </div>
        {summary.scorers.length > 0 && (
          <div style={{ fontSize: 12, color: '#4ade80', marginBottom: 4 }}>
            ⚽ {summary.scorers.join(', ')}
          </div>
        )}
        <div style={{ fontSize: 12, color: '#facc15' }}>⭐ MOTM: {summary.motm}</div>
      </div>
    </div>
  );
}

export function SquadDepthChart() {
  const { league, userTeamId } = useGameStore();
  if (!league || !userTeamId) return null;
  const team = league.teams.find((t) => t.id === userTeamId);
  if (!team) return null;

  const depth = computeSquadDepth(team);
  const hierarchy = computeSquadHierarchy(team);

  return (
    <div style={{ padding: '12px 16px', overflowY: 'auto', height: '100%' }}>
      <h3 style={{ margin: '0 0 12px', fontSize: 15 }}>📋 Squad Depth Chart</h3>

      {/* Hierarchy */}
      {hierarchy.captain && (
        <div style={{ marginBottom: 12, padding: 10, background: 'rgba(250,204,21,0.08)', borderRadius: 8, border: '1px solid rgba(250,204,21,0.2)', fontSize: 12 }}>
          <span style={{ color: '#facc15' }}>© Captain:</span> {hierarchy.captain.name}
          {hierarchy.viceCaptain && <span style={{ marginLeft: 12, color: '#aaa' }}>Vice: {hierarchy.viceCaptain.name}</span>}
          <div style={{ marginTop: 4, color: '#888' }}>Senior group: {hierarchy.seniorGroup.map((p) => p.name.split(' ').pop()).join(', ')}</div>
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {depth.map((entry) => (
          <div key={entry.position} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 36, fontSize: 12, fontWeight: 600, color: '#60a5fa' }}>{entry.position}</div>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {entry.players.map((p, i) => (
                <div
                  key={i}
                  style={{
                    padding: '3px 8px', fontSize: 11, borderRadius: 4,
                    background: i === 0 ? 'rgba(74,222,128,0.15)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${i === 0 ? 'rgba(74,222,128,0.3)' : 'rgba(255,255,255,0.08)'}`,
                    color: p.overall >= 70 ? '#4ade80' : p.overall >= 55 ? '#e0e0e0' : '#888',
                  }}
                >
                  {p.name.split(' ').pop()} ({p.overall})
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AchievementsPanel() {
  const { league, userTeamId, seasonNumber } = useGameStore();
  if (!league || !userTeamId) return null;
  const team = league.teams.find((t) => t.id === userTeamId);
  if (!team) return null;

  const totalGoals = team.players.reduce((s, p) => s + p.goals, 0);
  const totalApps = team.players.reduce((s, p) => s + p.appearances, 0);

  const achievements = computeAchievements({
    wins: Math.floor(totalApps / 11), // approximate from appearances
    goals: totalGoals,
    cleanSheets: 0,
    unbeatenStreak: 0,
    seasonsPlayed: seasonNumber,
    trophies: 0,
    promotions: 0,
  });

  const unlocked = achievements.filter((a) => a.unlocked).length;

  return (
    <div style={{ padding: '12px 16px', overflowY: 'auto', height: '100%' }}>
      <h3 style={{ margin: '0 0 4px', fontSize: 15 }}>🏅 Achievements</h3>
      <div style={{ fontSize: 12, color: '#888', marginBottom: 12 }}>{unlocked}/{achievements.length} unlocked</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {achievements.map((a) => (
          <div
            key={a.id}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px',
              borderRadius: 6, opacity: a.unlocked ? 1 : 0.4,
              background: a.unlocked ? 'rgba(74,222,128,0.08)' : 'rgba(255,255,255,0.02)',
              border: `1px solid ${a.unlocked ? 'rgba(74,222,128,0.2)' : 'rgba(255,255,255,0.05)'}`,
            }}
          >
            <span style={{ fontSize: 18 }}>{a.icon}</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{a.name}</div>
              <div style={{ fontSize: 11, color: '#888' }}>{a.description}</div>
            </div>
            {a.unlocked && <span style={{ marginLeft: 'auto', color: '#4ade80', fontSize: 14 }}>✓</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
