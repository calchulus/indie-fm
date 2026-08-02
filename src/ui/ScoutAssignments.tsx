import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { advanceScoutKnowledge, getKnowledgeLabel, ScoutAssignment } from '../simulation/season-systems';

export function ScoutAssignments() {
  const { league, userTeamId, scoutAssignments } = useGameStore();
  const [targetPlayerId, setTargetPlayerId] = useState('');

  if (!league || !userTeamId) return null;
  const userTeam = league.teams.find((t) => t.id === userTeamId);
  if (!userTeam) return null;

  // Players from other teams that can be scouted
  const otherPlayers = league.teams
    .filter((t) => t.id !== userTeamId)
    .flatMap((t) => t.players.slice(0, 11).map((p) => ({ ...p, clubName: t.name })))
    .sort((a, b) => b.overall - a.overall)
    .slice(0, 30);

  const handleAssign = () => {
    if (!targetPlayerId) return;
    const existing = scoutAssignments.find((a) => a.targetPlayerId === targetPlayerId);
    if (existing) return; // Already assigned

    const newAssignment: ScoutAssignment = {
      scoutId: `scout_${Date.now()}`,
      targetPlayerId,
      roundsAssigned: 0,
      knowledge: 10,
    };
    useGameStore.setState({ scoutAssignments: [...scoutAssignments, newAssignment] });
    useGameStore.getState().addToast('🔍 Scout assigned. Knowledge will improve each round.', 'info');
    setTargetPlayerId('');
  };

  const handleAdvanceAll = () => {
    const updated = scoutAssignments.map((a) => advanceScoutKnowledge(a));
    useGameStore.setState({ scoutAssignments: updated });
    const completed = updated.filter((a) => a.knowledge >= 100);
    if (completed.length > 0) {
      useGameStore.getState().addToast(`🔍 ${completed.length} scout report(s) complete!`, 'success');
    }
  };

  const getPlayerName = (id: string) => {
    for (const t of league.teams) {
      const p = t.players.find((pl) => pl.id === id);
      if (p) return `${p.name} (${t.name})`;
    }
    return 'Unknown';
  };

  const btnStyle: React.CSSProperties = {
    padding: '6px 14px', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 4,
    background: 'rgba(74,222,128,0.2)', color: '#e0e0e0', cursor: 'pointer', fontSize: 12,
  };

  return (
    <div style={{ padding: '12px 16px', overflowY: 'auto', height: '100%' }}>
      <h3 style={{ margin: '0 0 12px', fontSize: 15 }}>🔍 Scout Assignments</h3>

      {/* Assign new scout */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <select
          value={targetPlayerId}
          onChange={(e) => setTargetPlayerId(e.target.value)}
          style={{ flex: 1, padding: '6px 10px', background: '#2a2a3e', color: '#e0e0e0', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 4, fontSize: 12 }}
        >
          <option value="">Select player to scout...</option>
          {otherPlayers.map((p) => (
            <option key={p.id} value={p.id}>{p.name} ({p.position}, OVR {p.overall}) — {p.clubName}</option>
          ))}
        </select>
        <button style={btnStyle} onClick={handleAssign} disabled={!targetPlayerId}>Assign Scout</button>
      </div>

      {/* Active assignments */}
      <h4 style={{ fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
        Active Assignments ({scoutAssignments.length})
      </h4>

      {scoutAssignments.length === 0 && (
        <div style={{ fontSize: 12, color: '#666', marginBottom: 16 }}>No active scout assignments. Assign a scout above.</div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
        {scoutAssignments.map((a) => {
          const knowledgeLabel = getKnowledgeLabel(a.knowledge);
          return (
            <div key={a.targetPlayerId} style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 500 }}>{getPlayerName(a.targetPlayerId)}</span>
                <span style={{ fontSize: 11, color: a.knowledge >= 100 ? '#4ade80' : '#fbbf24' }}>{knowledgeLabel}</span>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                <div style={{ width: `${a.knowledge}%`, height: '100%', background: a.knowledge >= 100 ? '#4ade80' : '#60a5fa', borderRadius: 3, transition: 'width 0.3s' }} />
              </div>
              <div style={{ fontSize: 10, color: '#888', marginTop: 2 }}>
                {a.knowledge}% knowledge • {a.roundsAssigned} rounds assigned
              </div>
            </div>
          );
        })}
      </div>

      {scoutAssignments.length > 0 && (
        <button style={btnStyle} onClick={handleAdvanceAll}>⏩ Advance Scout Knowledge (simulates 1 round)</button>
      )}
    </div>
  );
}
