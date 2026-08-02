import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { generateFreeAgents, offerTrial, evaluateTrialPerformance, shouldOfferContractAfterTrial, TrialOffer } from '../simulation/systems-3';
import { Player } from '../types';

interface TrialEntry {
  offer: TrialOffer;
  player: Player;
  result?: number;
}

export function TrialSystem() {
  const { league, userTeamId, addToast, signSpecificFreeAgent } = useGameStore();
  const [candidates, setCandidates] = useState<Player[]>([]);
  const [trials, setTrials] = useState<TrialEntry[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [duration, setDuration] = useState(4);

  if (!league || !userTeamId) return null;
  const team = league.teams.find((t) => t.id === userTeamId);
  if (!team) return null;

  const search = () => setCandidates(generateFreeAgents(8));

  const startTrial = () => {
    const player = candidates.find((p) => p.id === selectedId);
    if (!player) return;
    const offer = offerTrial(player, team, duration);
    setTrials((prev) => [...prev, { offer: { ...offer, status: 'accepted' }, player }]);
    setCandidates((prev) => prev.filter((x) => x.id !== selectedId));
    setSelectedId('');
    addToast(`🧪 ${player.name} started a ${duration}-round trial.`, 'info');
  };

  const evaluate = (idx: number) => {
    const entry = trials[idx];
    const rating = evaluateTrialPerformance(entry.player);
    const recommend = shouldOfferContractAfterTrial(rating);
    setTrials((prev) => prev.map((t, i) => i === idx ? { ...t, offer: { ...t.offer, status: 'completed' as const, performanceRating: rating }, result: rating } : t));
    addToast(
      recommend
        ? `✅ ${entry.player.name} trial: ${rating}/10 — Recommend contract!`
        : `❌ ${entry.player.name} trial: ${rating}/10 — Not good enough.`,
      recommend ? 'success' : 'warning',
    );
  };

  const signAfterTrial = (idx: number) => {
    const entry = trials[idx];
    signSpecificFreeAgent(entry.player);
    setTrials((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div style={{ padding: '12px 16px', overflowY: 'auto', height: '100%' }}>
      <h3 style={{ margin: '0 0 12px', fontSize: 15 }}>🧪 Trial System</h3>

      {/* Find trialists */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
        <button
          onClick={search}
          aria-label="Search for trial candidates"
          style={{ padding: '6px 14px', fontSize: 12, background: 'rgba(96,165,250,0.2)', border: 'none', borderRadius: 6, color: '#60a5fa', cursor: 'pointer' }}
        >
          Find Trialists
        </button>
      </div>

      {candidates.length > 0 && (
        <div style={{ padding: 12, background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              aria-label="Select trialist"
              style={{ padding: '5px 8px', fontSize: 12, borderRadius: 4, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.3)', color: '#e0e0e0', minWidth: 140 }}
            >
              <option value="">Select player…</option>
              {candidates.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.position}, OVR {p.overall})</option>)}
            </select>
            <label style={{ fontSize: 11, color: '#aaa', display: 'flex', alignItems: 'center', gap: 4 }}>
              Duration:
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                aria-label="Trial duration"
                style={{ padding: '3px 6px', fontSize: 11, borderRadius: 4, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.3)', color: '#e0e0e0' }}
              >
                {[2, 4, 6, 8].map((d) => <option key={d} value={d}>{d} rounds</option>)}
              </select>
            </label>
            <button
              onClick={startTrial}
              disabled={!selectedId}
              aria-label="Offer trial"
              style={{ padding: '5px 12px', fontSize: 12, background: selectedId ? 'rgba(74,222,128,0.2)' : 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 4, color: selectedId ? '#4ade80' : '#555', cursor: selectedId ? 'pointer' : 'default' }}
            >
              Offer Trial
            </button>
          </div>
        </div>
      )}

      {/* Active/completed trials */}
      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: '#aaa' }}>Trials ({trials.length})</div>
      {trials.length === 0 && <div style={{ fontSize: 12, color: '#666' }}>No active trials.</div>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {trials.map((entry, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: 6, border: '1px solid rgba(255,255,255,0.06)' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{entry.player.name}</div>
              <div style={{ fontSize: 11, color: '#888' }}>
                {entry.player.position} • OVR {entry.player.overall} • {entry.offer.duration} rnd trial
                {entry.result != null && <span style={{ color: entry.result >= 6.5 ? '#4ade80' : '#f87171' }}> • Score: {entry.result}/10</span>}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {entry.offer.status === 'accepted' && (
                <button
                  onClick={() => evaluate(idx)}
                  aria-label={`Evaluate ${entry.player.name}'s trial`}
                  style={{ padding: '4px 10px', fontSize: 11, background: 'rgba(96,165,250,0.2)', border: 'none', borderRadius: 4, color: '#60a5fa', cursor: 'pointer' }}
                >
                  Evaluate
                </button>
              )}
              {entry.offer.status === 'completed' && entry.result != null && entry.result >= 6.5 && (
                <button
                  onClick={() => signAfterTrial(idx)}
                  aria-label={`Sign ${entry.player.name} after trial`}
                  style={{ padding: '4px 10px', fontSize: 11, background: 'rgba(74,222,128,0.2)', border: 'none', borderRadius: 4, color: '#4ade80', cursor: 'pointer' }}
                >
                  Offer Contract
                </button>
              )}
              {entry.offer.status === 'completed' && (
                <button
                  onClick={() => setTrials((prev) => prev.filter((_, i) => i !== idx))}
                  aria-label={`Dismiss ${entry.player.name}`}
                  style={{ padding: '4px 10px', fontSize: 11, background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 4, color: '#888', cursor: 'pointer' }}
                >
                  Dismiss
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
