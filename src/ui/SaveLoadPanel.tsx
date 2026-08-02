import { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { listSaves, saveGame, loadGame, deleteSave, exportSaveToFile, importSaveFromFile, SaveSlot } from '../simulation/saveload';

export function SaveLoadPanel() {
  const { league, userTeamId } = useGameStore();
  const [saves, setSaves] = useState<SaveSlot[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  const refreshSaves = async () => {
    try {
      const slots = await listSaves();
      setSaves(slots);
    } catch {
      setSaves([]);
    }
  };

  useEffect(() => {
    refreshSaves();
  }, []);

  if (!league) return null;

  const development = { injuries: [], suspensions: [] };

  const handleSave = async () => {
    try {
      await saveGame(league, userTeamId!, development);
      setMessage('✅ Game saved');
      await refreshSaves();
    } catch (e) {
      setMessage(`❌ Save failed: ${(e as Error).message}`);
    }
  };

  const handleLoad = async (saveId: string) => {
    try {
      const data = await loadGame(saveId);
      if (data) {
        useGameStore.setState({
          league: data.league,
          userTeamId: data.userTeamId,
          matchState: null,
          matchHome: null,
          matchAway: null,
          isSimulating: false,
          seasonComplete: false,
        });
        setMessage('✅ Game loaded');
      }
    } catch (e) {
      setMessage(`❌ Load failed: ${(e as Error).message}`);
    }
  };

  const handleDelete = async (saveId: string) => {
    try {
      await deleteSave(saveId);
      setMessage('🗑️ Save deleted');
      await refreshSaves();
    } catch (e) {
      setMessage(`❌ Delete failed: ${(e as Error).message}`);
    }
  };

  const handleExportFile = () => {
    const json = exportSaveToFile(league, userTeamId!, development);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `indie_fm_save_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage('✅ Save exported to file');
  };

  const handleImportFile = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const text = await file.text();
      const result = importSaveFromFile(text);
      if (result.success && result.data) {
        useGameStore.setState({
          league: result.data.league,
          userTeamId: result.data.userTeamId,
          matchState: null,
          matchHome: null,
          matchAway: null,
          isSimulating: false,
          seasonComplete: false,
        });
        setMessage('✅ Save imported from file');
      } else {
        setMessage(`❌ ${result.error}`);
      }
    };
    input.click();
  };

  const btnStyle: React.CSSProperties = {
    padding: '6px 14px',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: 4,
    background: 'rgba(255,255,255,0.08)',
    color: '#e0e0e0',
    cursor: 'pointer',
    fontSize: 13,
  };

  return (
    <div style={{ padding: '12px 16px', overflowY: 'auto', height: '100%' }}>
      <h3 style={{ margin: '0 0 16px', fontSize: 15 }}>Save / Load</h3>

      {message && (
        <div style={{ padding: '8px 12px', marginBottom: 16, background: 'rgba(255,255,255,0.05)', borderRadius: 6, fontSize: 13 }}>
          {message}
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <button style={{ ...btnStyle, background: 'rgba(74,222,128,0.2)' }} onClick={handleSave}>
          💾 Save Game
        </button>
        <button style={btnStyle} onClick={handleExportFile}>
          📤 Export to File
        </button>
        <button style={btnStyle} onClick={handleImportFile}>
          📥 Import from File
        </button>
      </div>

      <h4 style={{ fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
        Saved Games ({saves.length})
      </h4>

      {saves.length === 0 && (
        <div style={{ color: '#666', fontSize: 13 }}>No saves yet. Click "Save Game" to create one.</div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {saves.map((save) => (
          <div key={save.id} style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '10px 14px',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: 6,
            border: '1px solid rgba(255,255,255,0.08)',
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{save.name}</div>
              <div style={{ fontSize: 11, color: '#888' }}>
                {save.userTeamName} • {new Date(save.timestamp).toLocaleString()}
              </div>
            </div>
            <button style={btnStyle} onClick={() => handleLoad(save.id)}>Load</button>
            <button style={{ ...btnStyle, borderColor: 'rgba(248,113,113,0.3)' }} onClick={() => handleDelete(save.id)}>🗑️</button>
          </div>
        ))}
      </div>
    </div>
  );
}
