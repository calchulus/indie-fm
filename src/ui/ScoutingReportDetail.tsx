import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { Player } from '../types';
import { RadarChart } from './RadarChart';
import { getTraitSummary } from '../simulation/traits';
import { isWonderkid, getWonderkidRating, createDevelopmentArc, projectPeak } from '../simulation/development-arcs';

export function ScoutingReportDetail() {
  const { league } = useGameStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (!league) return null;

  const allPlayers = league.teams.flatMap((t) => t.players.map((p) => ({ ...p, teamName: t.name, teamId: t.id })));
  const selected = allPlayers.find((p) => p.id === selectedId);

  const getStrengths = (p: Player): string[] => {
    const attrs = p.attributes as unknown as Record<string, number>;
    return Object.entries(attrs)
      .filter(([, v]) => v >= 15)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([k, v]) => `${formatAttr(k)} (${v}/20)`);
  };

  const getWeaknesses = (p: Player): string[] => {
    const attrs = p.attributes as unknown as Record<string, number>;
    return Object.entries(attrs)
      .filter(([, v]) => v <= 6)
      .sort((a, b) => a[1] - b[1])
      .slice(0, 4)
      .map(([k, v]) => `${formatAttr(k)} (${v}/20)`);
  };

  const getRecommendation = (p: Player): { text: string; color: string } => {
    if (isWonderkid(p)) return { text: '🌟 Exceptional talent — sign immediately', color: '#a78bfa' };
    if (p.overall >= 75) return { text: '✅ Would improve the first team', color: '#4ade80' };
    if (p.overall >= 60) return { text: '👍 Good squad depth option', color: '#fbbf24' };
    if (p.overall >= 45) return { text: '⚠️ Backup / rotation option only', color: '#fb923c' };
    return { text: '❌ Below required standard', color: '#f87171' };
  };

  return (
    <div style={{ padding: '12px 16px', overflowY: 'auto', height: '100%' }}>
      <h3 style={{ margin: '0 0 12px', fontSize: 15 }}>🔍 Scouting Report</h3>

      {/* Player selector */}
      <select
        style={{ width: '100%', padding: '8px 10px', background: '#2a2a3e', color: '#e0e0e0', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 4, fontSize: 12, marginBottom: 16 }}
        value={selectedId ?? ''}
        onChange={(e) => setSelectedId(e.target.value || null)}
      >
        <option value="">Select a player to scout...</option>
        {allPlayers.slice(0, 150).map((p) => (
          <option key={p.id} value={p.id}>{p.name} ({p.position}, OVR {p.overall}) — {p.teamName}</option>
        ))}
      </select>

      {selected && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* Left: Overview + Radar */}
          <div>
            <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>{selected.name}</div>
                  <div style={{ fontSize: 12, color: '#888' }}>{selected.position} • {selected.age}y • {selected.nationality} • {selected.teamName}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: selected.overall >= 75 ? '#4ade80' : selected.overall >= 60 ? '#fbbf24' : '#f87171' }}>{selected.overall}</div>
                  <div style={{ fontSize: 10, color: '#888' }}>OVR</div>
                </div>
              </div>
              {isWonderkid(selected) && (
                <div style={{ fontSize: 11, color: '#a78bfa', marginBottom: 4 }}>🌟 Wonderkid (Rating: {getWonderkidRating(selected)}/100)</div>
              )}
              <div style={{ fontSize: 11, color: '#888' }}>
                PA: {Math.round(selected.potentialAbility / 10)} • Value: £{(selected.value / 1_000_000).toFixed(1)}M • Wage: £{(selected.wage / 1000).toFixed(0)}k/w
              </div>
            </div>

            <RadarChart player={selected} size={200} color="#60a5fa" />

            {/* Development projection */}
            {(() => {
              const arc = createDevelopmentArc(selected);
              const proj = projectPeak(selected, arc);
              return (
                <div style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 6, fontSize: 11, marginTop: 8 }}>
                  <span style={{ color: '#888' }}>Phase: </span><span style={{ color: '#e0e0e0', textTransform: 'capitalize' }}>{arc.phase}</span>
                  <span style={{ color: '#888', marginLeft: 12 }}>Projected peak: </span>
                  <span style={{ color: '#4ade80' }}>{proj.projectedOverall} (age {proj.peakAge})</span>
                </div>
              );
            })()}
          </div>

          {/* Right: Strengths, Weaknesses, Traits, Recommendation */}
          <div>
            {/* Recommendation */}
            {(() => {
              const rec = getRecommendation(selected);
              return (
                <div style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, marginBottom: 12, borderLeft: `3px solid ${rec.color}` }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: rec.color }}>{rec.text}</div>
                </div>
              );
            })()}

            {/* Strengths */}
            <div style={{ marginBottom: 12 }}>
              <h4 style={{ fontSize: 11, color: '#4ade80', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Strengths</h4>
              {getStrengths(selected).length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {getStrengths(selected).map((s, i) => (
                    <div key={i} style={{ fontSize: 12, padding: '3px 8px', background: 'rgba(74,222,128,0.05)', borderRadius: 3 }}>✓ {s}</div>
                  ))}
                </div>
              ) : <div style={{ fontSize: 12, color: '#888' }}>No standout attributes</div>}
            </div>

            {/* Weaknesses */}
            <div style={{ marginBottom: 12 }}>
              <h4 style={{ fontSize: 11, color: '#f87171', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Weaknesses</h4>
              {getWeaknesses(selected).length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {getWeaknesses(selected).map((w, i) => (
                    <div key={i} style={{ fontSize: 12, padding: '3px 8px', background: 'rgba(248,113,113,0.05)', borderRadius: 3 }}>✗ {w}</div>
                  ))}
                </div>
              ) : <div style={{ fontSize: 12, color: '#888' }}>No significant weaknesses</div>}
            </div>

            {/* Traits */}
            {selected.traits.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <h4 style={{ fontSize: 11, color: '#60a5fa', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Playing Style</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {selected.traits.map((t, i) => (
                    <span key={i} style={{ fontSize: 11, padding: '2px 8px', background: 'rgba(96,165,250,0.1)', borderRadius: 3, color: '#93c5fd' }}>{t}</span>
                  ))}
                </div>
                {getTraitSummary(selected).length > 0 && (
                  <div style={{ fontSize: 11, color: '#888', marginTop: 4 }}>Effects: {getTraitSummary(selected).join(', ')}</div>
                )}
              </div>
            )}

            {/* Key info */}
            <div style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 6, fontSize: 11 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                <span>Foot: <strong>{selected.footedness}</strong></span>
                <span>Height: <strong>{selected.height}cm</strong></span>
                <span>Form: <strong>{selected.form}/10</strong></span>
                <span>Fitness: <strong>{selected.fitness}%</strong></span>
                <span>Morale: <strong>{selected.morale}/10</strong></span>
                <span>Contract: <strong>{selected.contractExpiry}</strong></span>
              </div>
            </div>
          </div>
        </div>
      )}

      {!selected && (
        <div style={{ color: '#666', fontSize: 13, textAlign: 'center', padding: 40 }}>
          Select a player above to generate a detailed scouting report.
        </div>
      )}
    </div>
  );
}

function formatAttr(key: string): string {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());
}
