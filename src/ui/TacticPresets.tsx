import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { Tactics } from '../types';

interface TacticPreset {
  id: string;
  name: string;
  tactics: Tactics;
}

const DEFAULT_PRESETS: TacticPreset[] = [
  { id: 'preset_tiki_taka', name: 'Tiki-Taka', tactics: { formation: '4-3-3', mentality: 'attacking', pressing: 'high', tempo: 'slow', width: 'narrow', defensiveLine: 65 } },
  { id: 'preset_contra', name: 'Counter Attack', tactics: { formation: '4-5-1', mentality: 'defensive', pressing: 'low', tempo: 'fast', width: 'wide', defensiveLine: 30 } },
  { id: 'preset_gegenpress', name: 'Gegenpress', tactics: { formation: '4-2-3-1', mentality: 'attacking', pressing: 'high', tempo: 'fast', width: 'normal', defensiveLine: 70 } },
  { id: 'preset_park_bus', name: 'Park the Bus', tactics: { formation: '5-4-1', mentality: 'defensive', pressing: 'low', tempo: 'slow', width: 'narrow', defensiveLine: 20 } },
  { id: 'preset_wing', name: 'Wing Play', tactics: { formation: '4-4-2', mentality: 'balanced', pressing: 'medium', tempo: 'normal', width: 'wide', defensiveLine: 50 } },
];

export function TacticPresets() {
  const { league, userTeamId } = useGameStore();
  const [customPresets, setCustomPresets] = useState<TacticPreset[]>([]);
  const [presetName, setPresetName] = useState('');

  if (!league || !userTeamId) return null;
  const userTeam = league.teams.find((t) => t.id === userTeamId);
  if (!userTeam) return null;

  const allPresets = [...DEFAULT_PRESETS, ...customPresets];

  const applyPreset = (preset: TacticPreset) => {
    const updatedTeams = league.teams.map((t) =>
      t.id === userTeamId ? { ...t, tactics: { ...preset.tactics } } : t
    );
    useGameStore.setState({ league: { ...league, teams: updatedTeams } });
    useGameStore.getState().addToast(`📋 Applied "${preset.name}" tactic preset`, 'success');
  };

  const saveCurrent = () => {
    if (!presetName.trim()) return;
    const newPreset: TacticPreset = {
      id: `custom_${Date.now()}`,
      name: presetName.trim(),
      tactics: { ...userTeam.tactics },
    };
    setCustomPresets((prev) => [...prev, newPreset]);
    setPresetName('');
    useGameStore.getState().addToast(`💾 Saved tactic preset "${newPreset.name}"`, 'info');
  };

  const btnStyle: React.CSSProperties = {
    padding: '6px 12px', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 4,
    background: 'rgba(255,255,255,0.08)', color: '#e0e0e0', cursor: 'pointer', fontSize: 12,
  };

  return (
    <div style={{ padding: '12px 16px', overflowY: 'auto', height: '100%' }}>
      <h3 style={{ margin: '0 0 12px', fontSize: 15 }}>📋 Tactical Presets</h3>

      {/* Save current */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input
          style={{ padding: '6px 10px', background: '#2a2a3e', color: '#e0e0e0', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 4, fontSize: 12, flex: 1 }}
          placeholder="Name for current tactics..."
          value={presetName}
          onChange={(e) => setPresetName(e.target.value)}
        />
        <button style={{ ...btnStyle, background: 'rgba(74,222,128,0.2)' }} onClick={saveCurrent}>💾 Save Current</button>
      </div>

      {/* Preset cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
        {allPresets.map((preset) => (
          <div key={preset.id} style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{preset.name}</div>
            <div style={{ fontSize: 11, color: '#888', lineHeight: 1.6 }}>
              <div>Formation: <strong style={{ color: '#e0e0e0' }}>{preset.tactics.formation}</strong></div>
              <div>Mentality: <strong style={{ color: '#e0e0e0' }}>{preset.tactics.mentality}</strong></div>
              <div>Pressing: <strong style={{ color: '#e0e0e0' }}>{preset.tactics.pressing}</strong> • Tempo: <strong style={{ color: '#e0e0e0' }}>{preset.tactics.tempo}</strong></div>
              <div>Width: <strong style={{ color: '#e0e0e0' }}>{preset.tactics.width}</strong> • Line: <strong style={{ color: '#e0e0e0' }}>{preset.tactics.defensiveLine}%</strong></div>
            </div>
            <button style={{ ...btnStyle, marginTop: 8, width: '100%', background: 'rgba(96,165,250,0.15)' }} onClick={() => applyPreset(preset)}>
              Apply
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
