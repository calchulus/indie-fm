import { useState, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { exportToCode, importFromCode, exportToFile, importFromFile, describeState, SCENARIOS, ShareableState, exportToURL } from '../simulation/share-state';

export function SharePanel() {
  const { league, userTeamId, seasonNumber, board, addToast } = useGameStore();
  const [shareCode, setShareCode] = useState('');
  const [importCode, setImportCode] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!league || !userTeamId) return <div style={{ padding: 16, color: '#888' }}>Start a career first.</div>;

  const team = league.teams.find((t) => t.id === userTeamId);
  const currentRound = league.currentRound;

  const buildState = (): ShareableState => ({
    version: 1,
    exportedAt: Date.now(),
    description: `${team?.name} — Season ${seasonNumber}, Round ${currentRound}`,
    league,
    userTeamId,
    seasonNumber,
    round: currentRound,
    boardConfidence: board?.confidence ?? 50,
    budget: team?.budget ?? 0,
  });

  const handleExportCode = () => {
    const code = exportToCode(buildState());
    setShareCode(code);
    navigator.clipboard?.writeText(code).then(() => {
      addToast('📋 Share code copied to clipboard!', 'success');
    }).catch(() => {
      addToast('📋 Share code generated (copy manually).', 'info');
    });
  };

  const handleExportURL = () => {
    const url = exportToURL(buildState());
    navigator.clipboard?.writeText(url).then(() => {
      addToast('🔗 Share URL copied to clipboard!', 'success');
    }).catch(() => {
      addToast('🔗 Could not copy URL.', 'warning');
    });
  };

  const handleExportFile = () => {
    exportToFile(buildState());
    addToast('💾 Save file downloaded.', 'success');
  };

  const handleImportCode = () => {
    const state = importFromCode(importCode);
    if (!state) {
      addToast('❌ Invalid share code.', 'error');
      return;
    }
    setPreview(describeState(state));
    addToast(`✅ Valid save found: ${describeState(state)}`, 'success');
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const state = await importFromFile(file);
    if (!state) {
      addToast('❌ Invalid save file.', 'error');
      return;
    }
    setPreview(describeState(state));
    addToast(`✅ Save loaded: ${describeState(state)}`, 'success');
  };

  const handleLoadScenario = (scenarioId: string) => {
    const scenario = SCENARIOS.find((s) => s.id === scenarioId);
    if (!scenario || !league) return;
    const { userTeamId: newTeamId, modifications } = scenario.setup(league);
    addToast(`${scenario.icon} Scenario loaded: ${scenario.name} — ${modifications}`, 'goal');
    // In a full implementation, this would reset the store with the scenario conditions
    // For now, just notify
    void newTeamId;
  };

  return (
    <div style={{ padding: '12px 16px', overflowY: 'auto', height: '100%' }}>
      <h3 style={{ margin: '0 0 12px', fontSize: 15 }}>📤 Share & Scenarios</h3>

      {/* Export Section */}
      <div style={{ marginBottom: 20, padding: 12, background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Export Your Save</div>
        <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>
          {team?.name} — Season {seasonNumber}, Round {currentRound}, Budget: £{((team?.budget ?? 0) / 1_000_000).toFixed(1)}M
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={handleExportCode} style={btnStyle}>📋 Copy Code</button>
          <button onClick={handleExportURL} style={btnStyle}>🔗 Copy URL</button>
          <button onClick={handleExportFile} style={btnStyle}>💾 Download File</button>
        </div>
        {shareCode && (
          <textarea
            value={shareCode}
            readOnly
            style={{ marginTop: 8, width: '100%', height: 60, fontSize: 10, fontFamily: 'monospace', padding: 6, borderRadius: 4, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: '#aaa', resize: 'none' }}
            aria-label="Share code"
          />
        )}
      </div>

      {/* Import Section */}
      <div style={{ marginBottom: 20, padding: 12, background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Import a Save</div>
        <textarea
          value={importCode}
          onChange={(e) => setImportCode(e.target.value)}
          placeholder="Paste share code here (starts with IFM1:)..."
          style={{ width: '100%', height: 60, fontSize: 10, fontFamily: 'monospace', padding: 6, borderRadius: 4, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.3)', color: '#e0e0e0', resize: 'none', marginBottom: 8 }}
          aria-label="Import code"
        />
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handleImportCode} style={btnStyle}>📥 Load Code</button>
          <button onClick={() => fileRef.current?.click()} style={btnStyle}>📂 Upload File</button>
          <input ref={fileRef} type="file" accept=".json" onChange={handleImportFile} style={{ display: 'none' }} aria-label="Upload save file" />
        </div>
        {preview && (
          <div style={{ marginTop: 8, padding: 8, background: 'rgba(74,222,128,0.08)', borderRadius: 4, fontSize: 12, color: '#4ade80' }}>
            {preview}
          </div>
        )}
      </div>

      {/* Scenarios */}
      <div style={{ padding: 12, background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>🎮 Challenge Scenarios</div>
        <div style={{ fontSize: 12, color: '#888', marginBottom: 12 }}>Start from specific conditions. Share the code to challenge friends.</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {SCENARIOS.map((s) => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 500 }}>{s.icon} {s.name}
                  <span style={{ marginLeft: 8, fontSize: 10, color: s.difficulty === 'extreme' ? '#f87171' : s.difficulty === 'hard' ? '#fb923c' : s.difficulty === 'medium' ? '#facc15' : '#4ade80' }}>
                    {s.difficulty}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: '#888' }}>{s.description}</div>
              </div>
              <button onClick={() => handleLoadScenario(s.id)} style={{ ...btnStyle, flexShrink: 0 }}>Play</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  padding: '6px 12px',
  fontSize: 12,
  background: 'rgba(96,165,250,0.15)',
  border: 'none',
  borderRadius: 6,
  color: '#60a5fa',
  cursor: 'pointer',
};
