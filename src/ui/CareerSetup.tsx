import { useState } from 'react';
import { useGameStore } from '../store/gameStore';

export function CareerSetup() {
  const { league, startCareer } = useGameStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (!league) return null;

  const selectedTeam = league.teams.find((t) => t.id === selectedId);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#1a1a2e' }}>
      <div style={{ maxWidth: 600, width: '100%', padding: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#4ade80', marginBottom: 4, textAlign: 'center' }}>⚽ Indie FM</h1>
        <p style={{ fontSize: 13, color: '#888', textAlign: 'center', marginBottom: 24 }}>Choose your club to begin your managerial career</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 8, marginBottom: 20, maxHeight: 320, overflow: 'auto' }}>
          {league.teams.map((t) => {
            const avgOvr = Math.round(t.players.slice(0, 11).reduce((s, p) => s + p.overall, 0) / 11 * 10) / 10;
            return (
              <button
                key={t.id}
                onClick={() => setSelectedId(t.id)}
                style={{
                  padding: '10px 12px', textAlign: 'left', cursor: 'pointer', borderRadius: 6,
                  border: selectedId === t.id ? `2px solid ${t.colors.primary}` : '1px solid rgba(255,255,255,0.1)',
                  background: selectedId === t.id ? 'rgba(96,165,250,0.1)' : 'rgba(255,255,255,0.03)',
                  color: '#e0e0e0',
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{t.name}</div>
                <div style={{ fontSize: 11, color: '#888' }}>Rep {t.reputation} • OVR {avgOvr} • £{(t.budget / 1_000_000).toFixed(0)}M</div>
              </button>
            );
          })}
        </div>

        {selectedTeam && (
          <div style={{ padding: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, marginBottom: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6, color: selectedTeam.colors.primary }}>{selectedTeam.name}</div>
            <div style={{ fontSize: 12, color: '#aaa', lineHeight: 1.6 }}>
              {selectedTeam.city} • {selectedTeam.stadium} ({selectedTeam.capacity.toLocaleString()})<br />
              Budget: £{(selectedTeam.budget / 1_000_000).toFixed(1)}M • Reputation: {selectedTeam.reputation}/100<br />
              Squad: {selectedTeam.players.length} players • Formation: {selectedTeam.tactics.formation}
            </div>
            <div style={{ fontSize: 12, color: '#fbbf24', marginTop: 8 }}>
              Board expects: {selectedTeam.reputation >= 70 ? 'Title challenge' : selectedTeam.reputation >= 50 ? 'Top half finish' : 'Avoid relegation'}
            </div>
          </div>
        )}

        <button
          onClick={() => selectedId && startCareer(selectedId)}
          disabled={!selectedId}
          style={{
            width: '100%', padding: '12px', borderRadius: 6, border: 'none', cursor: selectedId ? 'pointer' : 'default',
            background: selectedId ? 'rgba(74,222,128,0.3)' : 'rgba(255,255,255,0.05)',
            color: selectedId ? '#4ade80' : '#666', fontSize: 14, fontWeight: 600,
          }}
        >
          {selectedId ? `Start Career at ${selectedTeam?.name}` : 'Select a club to continue'}
        </button>
      </div>
    </div>
  );
}
