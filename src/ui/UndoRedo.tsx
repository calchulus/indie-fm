import { useState, useCallback } from 'react';
import { useGameStore } from '../store/gameStore';
import { createHistory, pushHistory, undo, redo, HistoryStack } from '../simulation/code-quality';

interface TacticsSnapshot {
  formation: string;
  mentality: string;
  pressing: string;
}

export function UndoRedo() {
  const { league, userTeamId, matchHome, matchAway, addToast } = useGameStore();
  const [history, setHistory] = useState<HistoryStack<TacticsSnapshot> | null>(null);

  const getTeam = useCallback(() => {
    if (matchHome && matchAway && userTeamId) {
      return matchHome.id === userTeamId ? matchHome : matchAway;
    }
    if (league && userTeamId) {
      return league.teams.find((t) => t.id === userTeamId);
    }
    return null;
  }, [league, userTeamId, matchHome, matchAway]);

  const team = getTeam();
  if (!team) return null;

  const currentSnapshot: TacticsSnapshot = {
    formation: team.tactics.formation,
    mentality: team.tactics.mentality,
    pressing: team.tactics.pressing,
  };

  const snapshot = () => {
    if (!history) {
      setHistory(createHistory(currentSnapshot));
    } else {
      setHistory(pushHistory(history, currentSnapshot));
    }
    addToast('📌 Tactics snapshot saved.', 'info');
  };

  const handleUndo = () => {
    if (!history || history.past.length === 0) return;
    const newHistory = undo(history);
    setHistory(newHistory);
    addToast(`↩️ Reverted to: ${newHistory.present.formation} / ${newHistory.present.mentality}`, 'info');
  };

  const handleRedo = () => {
    if (!history || history.future.length === 0) return;
    const newHistory = redo(history);
    setHistory(newHistory);
    addToast(`↪️ Re-applied: ${newHistory.present.formation} / ${newHistory.present.mentality}`, 'info');
  };

  const canUndo = history != null && history.past.length > 0;
  const canRedo = history != null && history.future.length > 0;
  const depth = history?.past.length ?? 0;

  return (
    <div style={{ padding: '12px 16px', overflowY: 'auto', height: '100%' }}>
      <h3 style={{ margin: '0 0 12px', fontSize: 15 }}>↩️ Tactics Undo/Redo</h3>

      <div style={{ padding: 12, background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', marginBottom: 12 }}>
        <div style={{ fontSize: 12, color: '#aaa', marginBottom: 8 }}>Current Tactics</div>
        <div style={{ fontSize: 13, marginBottom: 4 }}>Formation: <strong>{currentSnapshot.formation}</strong></div>
        <div style={{ fontSize: 13, marginBottom: 4 }}>Mentality: <strong>{currentSnapshot.mentality}</strong></div>
        <div style={{ fontSize: 13, marginBottom: 8 }}>Pressing: <strong>{currentSnapshot.pressing}</strong></div>
        <button
          onClick={snapshot}
          aria-label="Save tactics snapshot"
          style={{ padding: '6px 14px', fontSize: 12, background: 'rgba(96,165,250,0.2)', border: 'none', borderRadius: 6, color: '#60a5fa', cursor: 'pointer' }}
        >
          📌 Save Snapshot
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
        <button
          onClick={handleUndo}
          disabled={!canUndo}
          aria-label="Undo tactics change"
          style={{ padding: '6px 14px', fontSize: 12, background: canUndo ? 'rgba(250,204,21,0.2)' : 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 6, color: canUndo ? '#facc15' : '#555', cursor: canUndo ? 'pointer' : 'default' }}
        >
          ↩️ Undo
        </button>
        <button
          onClick={handleRedo}
          disabled={!canRedo}
          aria-label="Redo tactics change"
          style={{ padding: '6px 14px', fontSize: 12, background: canRedo ? 'rgba(250,204,21,0.2)' : 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 6, color: canRedo ? '#facc15' : '#555', cursor: canRedo ? 'pointer' : 'default' }}
        >
          ↪️ Redo
        </button>
        <span style={{ fontSize: 11, color: '#666' }}>History depth: {depth}</span>
      </div>

      {history && history.past.length > 0 && (
        <div style={{ fontSize: 12, color: '#888' }}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>History:</div>
          {history.past.map((h, i) => (
            <div key={i} style={{ padding: '2px 0' }}>{i + 1}. {h.formation} / {h.mentality} / {h.pressing}</div>
          ))}
        </div>
      )}
    </div>
  );
}
