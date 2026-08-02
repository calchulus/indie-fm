import { useGameStore } from '../store/gameStore';
import { computeMatchStats, getShotMap } from '../simulation/stats';

export function MatchStatsPanel() {
  const matchState = useGameStore((s) => s.matchState);
  const matchHome = useGameStore((s) => s.matchHome);
  const matchAway = useGameStore((s) => s.matchAway);

  if (!matchState || !matchHome || !matchAway) return null;

  const stats = computeMatchStats(matchState);
  const shotMap = getShotMap(matchState);

  const rows: Array<{ label: string; home: number | string; away: number | string }> = [
    { label: 'Possession', home: `${Math.round(stats.possession.home)}%`, away: `${Math.round(stats.possession.away)}%` },
    { label: 'Shots', home: stats.shots.home, away: stats.shots.away },
    { label: 'On Target', home: stats.shotsOnTarget.home, away: stats.shotsOnTarget.away },
    { label: 'Corners', home: stats.corners.home, away: stats.corners.away },
    { label: 'Fouls', home: stats.fouls.home, away: stats.fouls.away },
    { label: 'Passes', home: stats.passes.home, away: stats.passes.away },
    { label: 'Tackles', home: stats.tackles.home, away: stats.tackles.away },
  ];

  return (
    <div style={{ padding: '12px 16px', overflowY: 'auto', height: '100%' }}>
      <h3 style={{ margin: '0 0 16px', fontSize: 15 }}>Match Stats</h3>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 13, fontWeight: 600 }}>
        <span style={{ color: matchHome.colors.primary }}>{matchHome.shortName}</span>
        <span style={{ color: matchAway.colors.primary }}>{matchAway.shortName}</span>
      </div>

      {rows.map((row) => {
        const homeNum = typeof row.home === 'string' ? parseFloat(row.home) : row.home;
        const awayNum = typeof row.away === 'string' ? parseFloat(row.away) : row.away;
        const total = homeNum + awayNum || 1;
        const homePct = (homeNum / total) * 100;

        return (
          <div key={row.label} style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}>
              <span style={{ fontWeight: 600 }}>{row.home}</span>
              <span style={{ color: '#888' }}>{row.label}</span>
              <span style={{ fontWeight: 600 }}>{row.away}</span>
            </div>
            <div style={{ display: 'flex', height: 4, borderRadius: 2, overflow: 'hidden', background: 'rgba(255,255,255,0.1)' }}>
              <div style={{ width: `${homePct}%`, background: matchHome.colors.primary }} />
              <div style={{ width: `${100 - homePct}%`, background: matchAway.colors.primary }} />
            </div>
          </div>
        );
      })}

      {/* Shot map */}
      <h4 style={{ fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: 1, margin: '24px 0 8px' }}>
        Shot Map
      </h4>
      <div style={{
        position: 'relative',
        width: '100%',
        height: 160,
        background: '#2d8a4e',
        borderRadius: 6,
        border: '1px solid rgba(255,255,255,0.2)',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', width: 1, background: 'rgba(255,255,255,0.3)' }} />
        {shotMap.map((shot, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: `${(shot.x / 105) * 100}%`,
            top: `${(shot.y / 68) * 100}%`,
            width: shot.isGoal ? 10 : 7,
            height: shot.isGoal ? 10 : 7,
            borderRadius: '50%',
            transform: 'translate(-50%, -50%)',
            background: shot.isGoal
              ? '#fbbf24'
              : shot.isOnTarget
                ? (shot.teamId === matchState.homeTeamId ? matchHome.colors.primary : matchAway.colors.primary)
                : 'rgba(255,255,255,0.4)',
            border: shot.isGoal ? '2px solid #fff' : '1px solid rgba(255,255,255,0.5)',
          }} title={`${shot.minute}' ${shot.isGoal ? 'GOAL' : shot.isOnTarget ? 'On target' : 'Off target'}`} />
        ))}
      </div>
      <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 11, color: '#888' }}>
        <span>🟡 Goal</span>
        <span>● On target</span>
        <span style={{ opacity: 0.5 }}>● Off target</span>
      </div>
    </div>
  );
}
