import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { generateScout, generateReport, getStarDisplay, estimateValue, scoutPlayerPool, Scout, ScoutReport } from '../simulation/scouting';

export function ScoutingScreen() {
  const { league, userTeamId } = useGameStore();
  const [scouts] = useState<Scout[]>(() => [generateScout('England'), generateScout('Brazil'), generateScout('France')]);
  const [reports, setReports] = useState<ScoutReport[]>([]);
  const [scouting, setScouting] = useState(false);

  if (!league || !userTeamId) return null;

  const pool = scoutPlayerPool(league.teams, userTeamId);

  const handleScout = () => {
    setScouting(true);
    const newReports: ScoutReport[] = [];
    const targets = pool.sort(() => Math.random() - 0.5).slice(0, 8);
    for (const player of targets) {
      const scout = scouts[Math.floor(Math.random() * scouts.length)];
      const knowledge = 30 + Math.random() * 60;
      newReports.push(generateReport(player, scout, knowledge, league.currentRound));
    }
    setReports((prev) => [...newReports, ...prev].slice(0, 30));
    setScouting(false);
  };

  const playerName = (id: string) => {
    for (const t of league.teams) {
      const p = t.players.find((pl) => pl.id === id);
      if (p) return p;
    }
    return null;
  };

  const btnStyle: React.CSSProperties = {
    padding: '6px 14px', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 4,
    background: 'rgba(74,222,128,0.2)', color: '#e0e0e0', cursor: 'pointer', fontSize: 13,
  };

  return (
    <div style={{ padding: '12px 16px', overflowY: 'auto', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
        <h3 style={{ margin: 0, fontSize: 15 }}>🔍 Scouting Network</h3>
        <button style={btnStyle} onClick={handleScout} disabled={scouting}>
          {scouting ? 'Scouting...' : '🔎 Scout Players'}
        </button>
      </div>

      {/* Scouts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
        {scouts.map((s) => (
          <div key={s.id} style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 6 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{s.name}</div>
            <div style={{ fontSize: 11, color: '#888' }}>{s.nationality} • £{(s.wage / 1000).toFixed(0)}k/w</div>
            <div style={{ fontSize: 11, marginTop: 4 }}>
              <span style={{ color: '#60a5fa' }}>Ability: {s.judgingAbility}/20</span> • <span style={{ color: '#a78bfa' }}>Potential: {s.judgingPotential}/20</span>
            </div>
          </div>
        ))}
      </div>

      {/* Reports */}
      <h4 style={{ fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Scout Reports ({reports.length})</h4>
      {reports.length === 0 && <div style={{ color: '#666', fontSize: 13 }}>Click "Scout Players" to generate reports.</div>}
      <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ color: '#888', textAlign: 'left' }}>
            <th style={{ padding: '6px 8px' }}>Player</th>
            <th style={{ padding: '6px 8px' }}>Pos</th>
            <th style={{ padding: '6px 8px' }}>CA</th>
            <th style={{ padding: '6px 8px' }}>PA</th>
            <th style={{ padding: '6px 8px' }}>Knowledge</th>
            <th style={{ padding: '6px 8px' }}>Est. Value</th>
            <th style={{ padding: '6px 8px' }}>Verdict</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((r) => {
            const player = playerName(r.playerId);
            if (!player) return null;
            const est = estimateValue(player, r.knowledge);
            return (
              <tr key={r.playerId + r.scoutId} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '4px 8px' }}>{player.name}</td>
                <td style={{ padding: '4px 8px', color: '#60a5fa' }}>{player.position}</td>
                <td style={{ padding: '4px 8px', color: '#fbbf24' }}>{getStarDisplay(r.currentAbilityStars)}</td>
                <td style={{ padding: '4px 8px', color: '#a78bfa' }}>{getStarDisplay(r.potentialAbilityStars)}</td>
                <td style={{ padding: '4px 8px' }}>{r.knowledge}%</td>
                <td style={{ padding: '4px 8px' }}>£{(est.min / 1_000_000).toFixed(1)}-{(est.max / 1_000_000).toFixed(1)}M</td>
                <td style={{ padding: '4px 8px', color: r.recommended ? '#4ade80' : '#888' }}>{r.recommended ? '✓ Rec' : '—'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
