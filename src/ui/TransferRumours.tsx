import { useState, useMemo } from 'react';
import { useGameStore } from '../store/gameStore';
import { generateTransferRumours, getLikelihoodColor, getLikelihoodLabel } from '../simulation/rumours';

export function TransferRumours() {
  const { league, userTeamId } = useGameStore();
  const [refreshKey, setRefreshKey] = useState(0);

  const rumours = useMemo(() => {
    if (!league || !userTeamId) return [];
    return generateTransferRumours(league, userTeamId, 10);
  }, [league, userTeamId, refreshKey]);

  if (!league) return null;

  return (
    <div style={{ padding: '12px 16px', overflowY: 'auto', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ margin: 0, fontSize: 15 }}>📰 Transfer Rumours</h3>
        <button
          onClick={() => setRefreshKey((k) => k + 1)}
          style={{ padding: '4px 12px', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 4, background: 'rgba(255,255,255,0.08)', color: '#e0e0e0', cursor: 'pointer', fontSize: 12 }}
        >
          🔄 Refresh
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {rumours.map((r) => (
          <div key={r.id} style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 6, borderLeft: `3px solid ${getLikelihoodColor(r.likelihood)}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>
                {r.playerName} <span style={{ color: '#888', fontWeight: 400 }}>({r.playerPosition})</span>
              </span>
              <span style={{ fontSize: 11, color: getLikelihoodColor(r.likelihood) }}>{getLikelihoodLabel(r.likelihood)}</span>
            </div>
            <div style={{ fontSize: 12, color: '#aaa' }}>
              {r.fromClub} → {r.toClub} • {r.fee}
            </div>
            <div style={{ fontSize: 10, color: '#666', marginTop: 4 }}>Source: {r.source}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
