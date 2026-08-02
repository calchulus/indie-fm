import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { ATTRIBUTE_GROUPS } from '../types';
import { CompareRadarCharts } from './RadarChart';

export function PlayerComparison() {
  const { league } = useGameStore();
  const [playerA, setPlayerA] = useState('');
  const [playerB, setPlayerB] = useState('');

  if (!league) return null;

  const allPlayers = league.teams.flatMap((t) => t.players.map((p) => ({ ...p, teamName: t.name })));
  const selectedA = allPlayers.find((p) => p.id === playerA);
  const selectedB = allPlayers.find((p) => p.id === playerB);

  const selectStyle: React.CSSProperties = {
    padding: '6px 10px', background: '#2a2a3e', color: '#e0e0e0',
    border: '1px solid rgba(255,255,255,0.15)', borderRadius: 4, fontSize: 12, width: '100%',
  };

  const groups = [
    { label: 'Technical', attrs: ATTRIBUTE_GROUPS.technical },
    { label: 'Mental', attrs: ATTRIBUTE_GROUPS.mental },
    { label: 'Physical', attrs: ATTRIBUTE_GROUPS.physical },
  ] as const;

  const barColor = (val: number, isBetter: boolean) =>
    isBetter ? '#4ade80' : val >= 12 ? '#fbbf24' : '#f87171';

  return (
    <div style={{ padding: '12px 16px', overflowY: 'auto', height: '100%' }}>
      <h3 style={{ margin: '0 0 12px', fontSize: 15 }}>📊 Player Comparison</h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        <select style={selectStyle} value={playerA} onChange={(e) => setPlayerA(e.target.value)}>
          <option value="">Select Player A...</option>
          {allPlayers.slice(0, 100).map((p) => (
            <option key={p.id} value={p.id}>{p.name} ({p.position}, {p.overall}) — {p.teamName}</option>
          ))}
        </select>
        <select style={selectStyle} value={playerB} onChange={(e) => setPlayerB(e.target.value)}>
          <option value="">Select Player B...</option>
          {allPlayers.slice(0, 100).map((p) => (
            <option key={p.id} value={p.id}>{p.name} ({p.position}, {p.overall}) — {p.teamName}</option>
          ))}
        </select>
      </div>

      {selectedA && selectedB && (
        <>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 13 }}>
            <span style={{ fontWeight: 600, color: '#60a5fa' }}>{selectedA.name}</span>
            <span style={{ color: '#888' }}>{selectedA.position} vs {selectedB.position}</span>
            <span style={{ fontWeight: 600, color: '#a78bfa' }}>{selectedB.name}</span>
          </div>

          {/* Overall */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, fontSize: 20, fontWeight: 700 }}>
            <span style={{ color: selectedA.overall >= selectedB.overall ? '#4ade80' : '#888' }}>{selectedA.overall}</span>
            <span style={{ fontSize: 12, color: '#888', alignSelf: 'center' }}>OVERALL</span>
            <span style={{ color: selectedB.overall >= selectedA.overall ? '#4ade80' : '#888' }}>{selectedB.overall}</span>
          </div>

          {/* Radar Chart */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <CompareRadarCharts playerA={selectedA} playerB={selectedB} size={220} />
          </div>

          {/* Attribute groups */}
          {groups.map((group) => (
            <div key={group.label} style={{ marginBottom: 16 }}>
              <h4 style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>{group.label}</h4>
              {group.attrs.map((attr) => {
                const valA = selectedA.attributes[attr];
                const valB = selectedB.attributes[attr];
                return (
                  <div key={attr} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                    <span style={{ width: 20, fontSize: 12, fontWeight: 600, textAlign: 'right', color: barColor(valA, valA >= valB) }}>{valA}</span>
                    <div style={{ flex: 1, display: 'flex', height: 4, borderRadius: 2, overflow: 'hidden', background: 'rgba(255,255,255,0.1)' }}>
                      <div style={{ width: `${(valA / 20) * 50}%`, background: barColor(valA, valA >= valB), marginLeft: 'auto' }} />
                      <div style={{ width: `${(valB / 20) * 50}%`, background: barColor(valB, valB >= valA) }} />
                    </div>
                    <span style={{ width: 20, fontSize: 12, fontWeight: 600, color: barColor(valB, valB >= valA) }}>{valB}</span>
                  </div>
                );
              })}
            </div>
          ))}
        </>
      )}

      {!selectedA && !selectedB && (
        <div style={{ color: '#666', fontSize: 13, textAlign: 'center', padding: 40 }}>
          Select two players to compare their attributes side by side.
        </div>
      )}
    </div>
  );
}
