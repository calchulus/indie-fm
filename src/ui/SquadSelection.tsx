import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { Position } from '../types';

export function SquadSelection() {
  const { matchHome, matchAway, userTeamId } = useGameStore();
  const [confirmed, setConfirmed] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  if (!matchHome || !matchAway || !userTeamId) return null;

  const userTeam = matchHome.id === userTeamId ? matchHome : matchAway;
  const opponent = matchHome.id === userTeamId ? matchAway : matchHome;
  const isHome = matchHome.id === userTeamId;

  const squad = userTeam.players;
  const currentXI = selectedIds.length === 11
    ? selectedIds.map((id) => squad.find((p) => p.id === id)!).filter(Boolean)
    : squad.slice(0, 11);

  const bench = squad.filter((p) => !currentXI.some((xi) => xi.id === p.id));

  const togglePlayer = (playerId: string) => {
    if (confirmed) return;
    setSelectedIds((prev) => {
      if (prev.includes(playerId)) return prev.filter((id) => id !== playerId);
      if (prev.length >= 11) return prev;
      return [...prev, playerId];
    });
  };

  const handleConfirm = () => {
    setConfirmed(true);
    useGameStore.getState().addToast('✅ Team confirmed! Good luck.', 'success');
  };

  const posColor = (pos: Position) => {
    switch (pos) {
      case 'GK': return '#fbbf24';
      case 'CB': case 'LB': case 'RB': return '#60a5fa';
      case 'CDM': case 'CM': case 'CAM': return '#4ade80';
      default: return '#f87171';
    }
  };

  return (
    <div style={{ padding: '12px 16px', overflowY: 'auto', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ margin: 0, fontSize: 15 }}>
          📋 Team Selection — {isHome ? 'Home' : 'Away'} vs {opponent.name}
        </h3>
        {!confirmed && (
          <button
            onClick={handleConfirm}
            disabled={selectedIds.length > 0 && selectedIds.length !== 11}
            style={{
              padding: '8px 16px', borderRadius: 6, border: 'none', cursor: 'pointer',
              background: selectedIds.length > 0 && selectedIds.length !== 11 ? 'rgba(255,255,255,0.1)' : 'rgba(74,222,128,0.3)',
              color: '#e0e0e0', fontSize: 13, fontWeight: 600,
            }}
          >
            Confirm XI {selectedIds.length > 0 && selectedIds.length !== 11 ? `(${selectedIds.length}/11)` : ''}
          </button>
        )}
        {confirmed && <span style={{ color: '#4ade80', fontWeight: 600 }}>✅ Confirmed</span>}
      </div>

      {/* Formation info */}
      <div style={{ fontSize: 12, color: '#888', marginBottom: 12 }}>
        Formation: <strong style={{ color: '#e0e0e0' }}>{userTeam.tactics.formation}</strong> •
        Mentality: <strong style={{ color: '#e0e0e0' }}>{userTeam.tactics.mentality}</strong> •
        Opponent: <strong style={{ color: opponent.colors.primary }}>{opponent.name}</strong> ({opponent.tactics.formation})
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Starting XI */}
        <div>
          <h4 style={{ fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
            Starting XI
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {currentXI.map((p) => (
              <div key={p.id} style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '5px 8px',
                background: 'rgba(74,222,128,0.05)', borderRadius: 4,
                border: '1px solid rgba(74,222,128,0.15)',
              }}>
                <span style={{ fontSize: 11, color: posColor(p.position), fontWeight: 600, width: 28 }}>{p.position}</span>
                <span style={{ fontSize: 12, flex: 1 }}>{p.name}</span>
                <span style={{ fontSize: 11, color: '#888' }}>{p.overall}</span>
                <FitnessDot fitness={p.fitness} />
              </div>
            ))}
          </div>
        </div>

        {/* Bench */}
        <div>
          <h4 style={{ fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
            Bench ({bench.length})
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {bench.map((p) => (
              <div key={p.id} onClick={() => togglePlayer(p.id)} style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '5px 8px',
                background: selectedIds.includes(p.id) ? 'rgba(96,165,250,0.1)' : 'rgba(255,255,255,0.02)',
                borderRadius: 4, cursor: confirmed ? 'default' : 'pointer',
                border: selectedIds.includes(p.id) ? '1px solid rgba(96,165,250,0.3)' : '1px solid transparent',
                opacity: confirmed ? 0.6 : 1,
              }}>
                <span style={{ fontSize: 11, color: posColor(p.position), fontWeight: 600, width: 28 }}>{p.position}</span>
                <span style={{ fontSize: 12, flex: 1 }}>{p.name}</span>
                <span style={{ fontSize: 11, color: '#888' }}>{p.overall}</span>
                <FitnessDot fitness={p.fitness} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function FitnessDot({ fitness }: { fitness: number }) {
  const color = fitness >= 85 ? '#4ade80' : fitness >= 65 ? '#fbbf24' : '#f87171';
  return <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block' }} title={`Fitness: ${fitness}%`} />;
}
