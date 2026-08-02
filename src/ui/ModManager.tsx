import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { serializeLeague, deserializeMod, validateMod, MOD_SCHEMA_EXAMPLE } from '../simulation/mods';

export function ModManager() {
  const { league } = useGameStore();
  const [output, setOutput] = useState<string | null>(null);
  const [importText, setImportText] = useState('');
  const [showSchema, setShowSchema] = useState(false);

  if (!league) return null;

  const handleExport = () => {
    const json = serializeLeague(league);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${league.name.replace(/\s+/g, '_')}_mod.json`;
    a.click();
    URL.revokeObjectURL(url);
    setOutput(`✅ Exported "${league.name}" as mod file`);
  };

  const handleImport = () => {
    if (!importText.trim()) {
      setOutput('❌ Paste mod JSON first');
      return;
    }
    const result = deserializeMod(importText);
    if (!result.success || !result.mod) {
      setOutput(`❌ ${result.error}`);
      return;
    }
    const errors = validateMod(result.mod);
    if (errors.length > 0) {
      setOutput(`⚠️ Validation warnings:\n${errors.slice(0, 10).join('\n')}`);
      return;
    }
    setOutput(`✅ Mod "${result.mod.manifest.name}" v${result.mod.manifest.version} validated successfully. Full import coming in next update.`);
  };

  const btnStyle: React.CSSProperties = {
    padding: '8px 16px',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: 4,
    background: 'rgba(255,255,255,0.08)',
    color: '#e0e0e0',
    cursor: 'pointer',
    fontSize: 13,
  };

  return (
    <div style={{ padding: '12px 16px', overflowY: 'auto', height: '100%' }}>
      <h3 style={{ margin: '0 0 16px', fontSize: 15 }}>Mod Manager</h3>

      {output && (
        <div style={{
          padding: '10px 14px',
          marginBottom: 16,
          background: 'rgba(255,255,255,0.05)',
          borderRadius: 6,
          fontSize: 13,
          whiteSpace: 'pre-wrap',
        }}>
          {output}
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <button style={{ ...btnStyle, background: 'rgba(74,222,128,0.2)' }} onClick={handleExport}>
          📦 Export Current League as Mod
        </button>
        <button style={btnStyle} onClick={() => setShowSchema(!showSchema)}>
          {showSchema ? 'Hide' : 'Show'} Mod Schema
        </button>
      </div>

      {showSchema && (
        <pre style={{
          padding: 12,
          background: 'rgba(0,0,0,0.4)',
          borderRadius: 6,
          fontSize: 11,
          overflow: 'auto',
          maxHeight: 300,
          marginBottom: 24,
          color: '#aaa',
        }}>
          {MOD_SCHEMA_EXAMPLE}
        </pre>
      )}

      <h4 style={{ fontSize: 13, color: '#aaa', marginBottom: 8 }}>Import Mod (paste JSON)</h4>
      <textarea
        value={importText}
        onChange={(e) => setImportText(e.target.value)}
        placeholder="Paste mod JSON here..."
        style={{
          width: '100%',
          height: 150,
          padding: 10,
          background: '#1e1e2e',
          color: '#e0e0e0',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: 6,
          fontSize: 12,
          fontFamily: 'monospace',
          resize: 'vertical',
          marginBottom: 12,
        }}
      />
      <button style={btnStyle} onClick={handleImport}>
        🔍 Validate & Import
      </button>

      <div style={{ marginTop: 32, padding: '12px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 6, fontSize: 12, color: '#888' }}>
        <strong style={{ color: '#e0e0e0' }}>Mod system roadmap:</strong>
        <ul style={{ margin: '8px 0 0', paddingLeft: 20, lineHeight: 1.8 }}>
          <li>✅ Export league/teams/players as JSON</li>
          <li>✅ Import & validate mod packages</li>
          <li>✅ Schema documentation</li>
          <li>⬜ Full mod import (replace/merge into active game)</li>
          <li>⬜ Mod manager with enable/disable, load order</li>
          <li>⬜ Scripting hooks (custom match events via JS sandbox)</li>
          <li>⬜ Community mod repository</li>
        </ul>
      </div>
    </div>
  );
}
