import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { DEFAULT_REGIONS, ScoutRegion, advanceScoutKnowledge, assignScoutToRegion } from '../simulation/systems';

export function ScoutingNetwork() {
  const { staff } = useGameStore();
  const [regions, setRegions] = useState<ScoutRegion[]>(DEFAULT_REGIONS);
  const [selectedScout, setSelectedScout] = useState<string>('');

  const scouts = staff.filter((s) => s.role === 'scout' || s.role === 'chief_scout');

  const handleAssign = (regionId: string) => {
    if (!selectedScout) return;
    setRegions((prev) => assignScoutToRegion(prev, regionId, selectedScout));
  };

  const handleAdvanceKnowledge = () => {
    setRegions((prev) => advanceScoutKnowledge(prev));
  };

  return (
    <div style={{ padding: '12px 16px', overflowY: 'auto', height: '100%' }}>
      <h3 style={{ margin: '0 0 12px', fontSize: 15 }}>🔍 Scouting Network</h3>

      {/* Scout assignment */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 12, color: '#888', display: 'block', marginBottom: 4 }}>Select scout to assign:</label>
        <select
          value={selectedScout}
          onChange={(e) => setSelectedScout(e.target.value)}
          style={{ padding: '6px 10px', background: '#2a2a3e', color: '#e0e0e0', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 4, fontSize: 12, width: 200 }}
        >
          <option value="">Select scout...</option>
          {scouts.map((s) => (
            <option key={s.id} value={s.id}>{s.name} (Rating: {s.reputation})</option>
          ))}
        </select>
        {scouts.length === 0 && <div style={{ fontSize: 12, color: '#f87171', marginTop: 4 }}>No scouts hired. Hire scouts in the Staff tab.</div>}
      </div>

      {/* Regions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 12, marginBottom: 16 }}>
        {regions.map((region) => (
          <div key={region.id} style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{region.name}</span>
              <span style={{ fontSize: 11, color: region.assignedScoutId ? '#4ade80' : '#888' }}>
                {region.assignedScoutId ? 'Assigned' : 'Unassigned'}
              </span>
            </div>
            <div style={{ fontSize: 11, color: '#888', marginBottom: 8 }}>{region.countries.join(', ')}</div>
            <div style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 2 }}>
                <span>Knowledge</span>
                <span>{region.knowledgeLevel}%</span>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                <div style={{ width: `${region.knowledgeLevel}%`, height: '100%', background: region.knowledgeLevel >= 80 ? '#4ade80' : region.knowledgeLevel >= 50 ? '#fbbf24' : '#f87171', borderRadius: 3, transition: 'width 0.3s' }} />
              </div>
            </div>
            {!region.assignedScoutId && selectedScout && (
              <button onClick={() => handleAssign(region.id)} style={{ padding: '4px 10px', background: 'rgba(74,222,128,0.2)', border: 'none', borderRadius: 4, color: '#4ade80', cursor: 'pointer', fontSize: 11 }}>
                Assign Scout
              </button>
            )}
          </div>
        ))}
      </div>

      <button onClick={handleAdvanceKnowledge} style={{ padding: '8px 16px', background: 'rgba(96,165,250,0.2)', border: 'none', borderRadius: 6, color: '#60a5fa', cursor: 'pointer', fontSize: 13 }}>
        ⏩ Advance Scout Knowledge (1 round)
      </button>
    </div>
  );
}
