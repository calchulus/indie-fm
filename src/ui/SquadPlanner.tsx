import { useGameStore } from '../store/gameStore';
import { Position } from '../types';

interface DepthEntry {
  position: Position;
  players: Array<{ id: string; name: string; overall: number; age: number; fitness: number }>;
  needed: boolean;
  quality: 'strong' | 'adequate' | 'weak' | 'missing';
}

export function SquadPlanner() {
  const { league, userTeamId } = useGameStore();

  if (!league || !userTeamId) return null;
  const userTeam = league.teams.find((t) => t.id === userTeamId);
  if (!userTeam) return null;

  const requiredPositions: Position[] = ['GK', 'CB', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CM', 'LW', 'RW', 'ST'];
  const depthChart: DepthEntry[] = [];

  const posGroups: Record<string, typeof userTeam.players> = {};
  for (const p of userTeam.players) {
    if (!posGroups[p.position]) posGroups[p.position] = [];
    posGroups[p.position].push(p);
  }

  const allPositions: Position[] = ['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'ST'];
  for (const pos of allPositions) {
    const players = (posGroups[pos] ?? []).sort((a, b) => b.overall - a.overall);
    const needed = requiredPositions.filter((rp) => rp === pos).length;
    const topQuality = players[0]?.overall ?? 0;
    const quality: DepthEntry['quality'] = players.length === 0 ? 'missing' : topQuality >= 70 ? 'strong' : topQuality >= 50 ? 'adequate' : 'weak';

    depthChart.push({
      position: pos,
      players: players.map((p) => ({ id: p.id, name: p.name, overall: p.overall, age: p.age, fitness: p.fitness })),
      needed: players.length < needed,
      quality,
    });
  }

  const gaps = depthChart.filter((d) => d.needed || d.quality === 'weak' || d.quality === 'missing');
  const avgAge = Math.round(userTeam.players.reduce((s, p) => s + p.age, 0) / userTeam.players.length);
  const avgOvr = Math.round(userTeam.players.reduce((s, p) => s + p.overall, 0) / userTeam.players.length * 10) / 10;

  const qualityColor = (q: string) => q === 'strong' ? '#4ade80' : q === 'adequate' ? '#fbbf24' : q === 'weak' ? '#fb923c' : '#f87171';

  return (
    <div style={{ padding: '12px 16px', overflowY: 'auto', height: '100%' }}>
      <h3 style={{ margin: '0 0 12px', fontSize: 15 }}>📋 Squad Planner</h3>

      {/* Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
        <div style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: 6, textAlign: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 700 }}>{userTeam.players.length}</div>
          <div style={{ fontSize: 10, color: '#888' }}>Squad Size</div>
        </div>
        <div style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: 6, textAlign: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 700 }}>{avgOvr}</div>
          <div style={{ fontSize: 10, color: '#888' }}>Avg OVR</div>
        </div>
        <div style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: 6, textAlign: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 700 }}>{avgAge}</div>
          <div style={{ fontSize: 10, color: '#888' }}>Avg Age</div>
        </div>
        <div style={{ padding: '10px', background: gaps.length > 0 ? 'rgba(248,113,113,0.05)' : 'rgba(74,222,128,0.05)', borderRadius: 6, textAlign: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: gaps.length > 0 ? '#f87171' : '#4ade80' }}>{gaps.length}</div>
          <div style={{ fontSize: 10, color: '#888' }}>Gaps to Fill</div>
        </div>
      </div>

      {/* Recruitment targets */}
      {gaps.length > 0 && (
        <div style={{ marginBottom: 16, padding: '10px 14px', background: 'rgba(251,191,36,0.05)', borderRadius: 8, border: '1px solid rgba(251,191,36,0.15)' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#fbbf24', marginBottom: 6 }}>🎯 Recruitment Priorities</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {gaps.map((g) => (
              <span key={g.position} style={{ fontSize: 11, padding: '3px 10px', background: 'rgba(251,191,36,0.1)', borderRadius: 4, color: '#fbbf24' }}>
                {g.position} ({g.quality === 'missing' ? 'No cover' : g.quality === 'weak' ? 'Needs upgrade' : 'Needs depth'})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Depth chart */}
      <h4 style={{ fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Depth Chart</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {depthChart.map((entry) => (
          <div key={entry.position} style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#60a5fa', width: 30 }}>{entry.position}</span>
              <span style={{ fontSize: 11, color: qualityColor(entry.quality), fontWeight: 600, textTransform: 'capitalize' }}>{entry.quality}</span>
              <span style={{ fontSize: 11, color: '#888' }}>({entry.players.length} player{entry.players.length !== 1 ? 's' : ''})</span>
              {entry.needed && <span style={{ fontSize: 10, color: '#f87171' }}>⚠️ Needs reinforcement</span>}
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {entry.players.map((p, i) => (
                <span key={p.id} style={{
                  fontSize: 11, padding: '2px 8px', borderRadius: 3,
                  background: i === 0 ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.05)',
                  border: i === 0 ? '1px solid rgba(74,222,128,0.2)' : '1px solid transparent',
                }}>
                  {p.name.split(' ').pop()} ({p.overall}) {p.age}y
                </span>
              ))}
              {entry.players.length === 0 && <span style={{ fontSize: 11, color: '#f87171' }}>No players</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
