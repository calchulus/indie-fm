import { useGameStore } from '../store/gameStore';
import { computeXG, computeHeatMap, computePassNetwork, computePPDA } from '../simulation/analytics';

export function DataHub() {
  const matchState = useGameStore((s) => s.matchState);
  const matchHome = useGameStore((s) => s.matchHome);
  const matchAway = useGameStore((s) => s.matchAway);

  if (!matchState || !matchHome || !matchAway) {
    return <div style={{ padding: 20, color: '#888' }}>Play a match to see analytics data.</div>;
  }

  const xg = computeXG(matchState);
  const ppdaHome = computePPDA(matchState, matchState.homeTeamId);
  const ppdaAway = computePPDA(matchState, matchState.awayTeamId);
  const passNet = computePassNetwork(matchState, matchState.homeTeamId);

  const playerName = (id: string) => {
    const p = matchHome.players.find((pl) => pl.id === id) ?? matchAway.players.find((pl) => pl.id === id);
    return p?.name.split(' ').pop() ?? '?';
  };

  return (
    <div style={{ padding: '12px 16px', overflowY: 'auto', height: '100%' }}>
      <h3 style={{ margin: '0 0 16px', fontSize: 15 }}>📊 Data Hub</h3>

      {/* xG Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        <StatBox label="Home xG" value={String(xg.homeXG)} color={matchHome.colors.primary} />
        <StatBox label="Away xG" value={String(xg.awayXG)} color={matchAway.colors.primary} />
        <StatBox label="Home PPDA" value={String(ppdaHome)} color="#60a5fa" />
        <StatBox label="Away PPDA" value={String(ppdaAway)} color="#fbbf24" />
      </div>

      {/* xG Shot Timeline */}
      <h4 style={{ fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>xG Shot Timeline</h4>
      <div style={{ position: 'relative', height: 80, background: 'rgba(255,255,255,0.03)', borderRadius: 6, marginBottom: 20, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: 'rgba(255,255,255,0.1)' }} />
        {xg.shots.map((shot, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: `${(shot.minute / 90) * 100}%`,
            bottom: shot.teamId === matchState.homeTeamId ? '55%' : undefined,
            top: shot.teamId !== matchState.homeTeamId ? '55%' : undefined,
            width: Math.max(4, shot.xg * 30),
            height: Math.max(4, shot.xg * 30),
            borderRadius: '50%',
            background: shot.isGoal ? '#fbbf24' : shot.teamId === matchState.homeTeamId ? matchHome.colors.primary : matchAway.colors.primary,
            opacity: shot.isGoal ? 1 : 0.6,
            transform: 'translateX(-50%)',
            border: shot.isGoal ? '2px solid #fff' : 'none',
          }} title={`${shot.minute}' xG: ${shot.xg} ${shot.isGoal ? '⚽ GOAL' : ''}`} />
        ))}
        <span style={{ position: 'absolute', top: 4, left: 8, fontSize: 10, color: matchHome.colors.primary }}>{matchHome.shortName}</span>
        <span style={{ position: 'absolute', bottom: 4, left: 8, fontSize: 10, color: matchAway.colors.primary }}>{matchAway.shortName}</span>
      </div>

      {/* Pass Network */}
      <h4 style={{ fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Pass Network — {matchHome.shortName}</h4>
      <div style={{ marginBottom: 20 }}>
        <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ color: '#888', textAlign: 'left' }}>
              <th style={{ padding: '4px 8px' }}>Player</th>
              <th style={{ padding: '4px 8px' }}>Touches</th>
              <th style={{ padding: '4px 8px' }}>Avg Position</th>
            </tr>
          </thead>
          <tbody>
            {passNet.nodes.sort((a, b) => b.touches - a.touches).slice(0, 11).map((node) => (
              <tr key={node.playerId} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '3px 8px' }}>{playerName(node.playerId)}</td>
                <td style={{ padding: '3px 8px', fontWeight: 600 }}>{node.touches}</td>
                <td style={{ padding: '3px 8px', color: '#888' }}>({Math.round(node.avgX)}, {Math.round(node.avgY)})</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Top Pass Pairs */}
      <h4 style={{ fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Top Passing Combinations</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {passNet.links.slice(0, 8).map((link, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
            <span style={{ width: 160 }}>{playerName(link.from)} → {playerName(link.to)}</span>
            <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3 }}>
              <div style={{ width: `${(link.count / (passNet.links[0]?.count ?? 1)) * 100}%`, height: '100%', background: matchHome.colors.primary, borderRadius: 3 }} />
            </div>
            <span style={{ color: '#888', minWidth: 20 }}>{link.count}</span>
          </div>
        ))}
      </div>

      {/* Heat Map (simplified grid) */}
      <h4 style={{ fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: 1, margin: '20px 0 8px' }}>Positional Heat Map (top player)</h4>
      {passNet.nodes.length > 0 && (() => {
        const topPlayer = passNet.nodes.sort((a, b) => b.touches - a.touches)[0];
        const heat = computeHeatMap(matchState.playerPositions, topPlayer.playerId);
        return (
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${heat.maxX}, 1fr)`, gap: 1, width: 300 }}>
            {heat.grid.flat().map((val, i) => (
              <div key={i} style={{
                aspectRatio: '1',
                background: `rgba(74, 222, 128, ${val * 0.8})`,
                borderRadius: 2,
              }} />
            ))}
          </div>
        );
      })()}
    </div>
  );
}

function StatBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 6, textAlign: 'center' }}>
      <div style={{ fontSize: 20, fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{label}</div>
    </div>
  );
}
