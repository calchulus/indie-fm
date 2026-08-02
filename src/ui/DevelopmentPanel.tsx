import { useGameStore } from '../store/gameStore';
import { isWonderkid, getWonderkidRating, createDevelopmentArc, projectPeak, getDevelopmentPhase } from '../simulation/development-arcs';

export function DevelopmentPanel() {
  const { league, userTeamId } = useGameStore();

  if (!league || !userTeamId) return null;
  const userTeam = league.teams.find((t) => t.id === userTeamId);
  if (!userTeam) return null;

  const playersWithArcs = userTeam.players.map((p) => {
    const arc = createDevelopmentArc(p);
    const projection = projectPeak(p, arc);
    const wonderkid = isWonderkid(p);
    const wonderkidRating = getWonderkidRating(p);
    const phase = getDevelopmentPhase(p.age, p.potentialAbility, p.currentAbility);
    return { player: p, arc, projection, wonderkid, wonderkidRating, phase };
  });

  const wonderkids = playersWithArcs.filter((p) => p.wonderkid).sort((a, b) => b.wonderkidRating - a.wonderkidRating);
  const declining = playersWithArcs.filter((p) => p.phase === 'declining');

  const phaseColor = (phase: string) => {
    switch (phase) {
      case 'wonderkid': return '#a78bfa';
      case 'emerging': return '#4ade80';
      case 'prime': return '#60a5fa';
      case 'veteran': return '#fbbf24';
      case 'declining': return '#f87171';
      default: return '#888';
    }
  };

  const phaseIcon = (phase: string) => {
    switch (phase) {
      case 'wonderkid': return '🌟';
      case 'emerging': return '📈';
      case 'prime': return '💪';
      case 'veteran': return '🎖️';
      case 'declining': return '📉';
      default: return '•';
    }
  };

  return (
    <div style={{ padding: '12px 16px', overflowY: 'auto', height: '100%' }}>
      <h3 style={{ margin: '0 0 12px', fontSize: 15 }}>📈 Player Development</h3>

      {/* Wonderkids */}
      {wonderkids.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <h4 style={{ fontSize: 12, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
            🌟 Wonderkids ({wonderkids.length})
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {wonderkids.map(({ player, projection, wonderkidRating }) => (
              <div key={player.id} style={{
                padding: '8px 12px', background: 'rgba(167,139,250,0.08)', borderRadius: 6,
                border: '1px solid rgba(167,139,250,0.2)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{player.name}</span>
                  <span style={{ fontSize: 11, color: '#a78bfa' }}>Wonderkid Rating: {wonderkidRating}/100</span>
                </div>
                <div style={{ display: 'flex', gap: 16, fontSize: 11, color: '#888', marginTop: 4 }}>
                  <span>Age: {player.age}</span>
                  <span>Current: {player.overall}</span>
                  <span>PA: {Math.round(player.potentialAbility / 10)}</span>
                  <span style={{ color: '#4ade80' }}>Projected peak: {projection.projectedOverall} (age {projection.peakAge})</span>
                </div>
                <div style={{ marginTop: 4, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                  <div style={{
                    width: `${(player.currentAbility / player.potentialAbility) * 100}%`,
                    height: '100%', background: 'linear-gradient(90deg, #a78bfa, #4ade80)', borderRadius: 2,
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full squad development overview */}
      <h4 style={{ fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
        Squad Development Overview
      </h4>
      <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ color: '#888', textAlign: 'left' }}>
            <th style={{ padding: '4px 8px' }}>Pos</th>
            <th style={{ padding: '4px 8px' }}>Name</th>
            <th style={{ padding: '4px 8px' }}>Age</th>
            <th style={{ padding: '4px 8px' }}>Phase</th>
            <th style={{ padding: '4px 8px' }}>OVR</th>
            <th style={{ padding: '4px 8px' }}>Peak</th>
            <th style={{ padding: '4px 8px' }}>Growth</th>
          </tr>
        </thead>
        <tbody>
          {playersWithArcs.slice(0, 16).map(({ player, arc, projection, phase }) => (
            <tr key={player.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <td style={{ padding: '3px 8px', color: '#60a5fa' }}>{player.position}</td>
              <td style={{ padding: '3px 8px' }}>{player.name}</td>
              <td style={{ padding: '3px 8px', color: '#888' }}>{player.age}</td>
              <td style={{ padding: '3px 8px' }}>
                <span style={{ color: phaseColor(phase), fontSize: 11 }}>
                  {phaseIcon(phase)} {phase}
                </span>
              </td>
              <td style={{ padding: '3px 8px', fontWeight: 600 }}>{player.overall}</td>
              <td style={{ padding: '3px 8px', color: '#4ade80' }}>{projection.projectedOverall}</td>
              <td style={{ padding: '3px 8px', color: arc.growthRate > 0 ? '#4ade80' : arc.growthRate < 0 ? '#f87171' : '#888' }}>
                {arc.growthRate > 0 ? `+${arc.growthRate}` : arc.growthRate}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Declining players warning */}
      {declining.length > 0 && (
        <div style={{ marginTop: 16, padding: '8px 12px', background: 'rgba(248,113,113,0.08)', borderRadius: 6, fontSize: 12, color: '#fca5a5' }}>
          ⚠️ {declining.length} player(s) in decline phase — consider squad refresh: {declining.map((d) => d.player.name.split(' ').pop()).join(', ')}
        </div>
      )}
    </div>
  );
}
