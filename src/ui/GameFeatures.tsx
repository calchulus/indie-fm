import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { computeSkillLabels } from '../simulation/player-lifecycle';
import { parseRosterCSV, generateCSVTemplate } from '../simulation/league-systems';

// --- #8: Sound Effects (Web Audio) ---
let audioCtx: AudioContext | null = null;
function getAudioCtx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext();
  return audioCtx;
}

export function playSound(type: 'goal' | 'whistle' | 'card' | 'click' | 'save') {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.value = 0.15;

    switch (type) {
      case 'goal':
        osc.frequency.value = 523; osc.type = 'square';
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc.start(); osc.stop(ctx.currentTime + 0.5);
        break;
      case 'whistle':
        osc.frequency.value = 880; osc.type = 'sine';
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start(); osc.stop(ctx.currentTime + 0.3);
        break;
      case 'card':
        osc.frequency.value = 330; osc.type = 'sawtooth';
        gain.gain.value = 0.1;
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.start(); osc.stop(ctx.currentTime + 0.2);
        break;
      case 'save':
        osc.frequency.value = 440; osc.type = 'triangle';
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.start(); osc.stop(ctx.currentTime + 0.15);
        break;
      case 'click':
        osc.frequency.value = 660; osc.type = 'sine';
        gain.gain.value = 0.05;
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
        osc.start(); osc.stop(ctx.currentTime + 0.05);
        break;
    }
  } catch { /* Audio not available */ }
}

// --- #9: Squad View with Skill Labels + Jersey Numbers + Form ---
export function EnhancedSquadView() {
  const { league, userTeamId } = useGameStore();
  if (!league || !userTeamId) return null;
  const team = league.teams.find((t) => t.id === userTeamId);
  if (!team) return null;

  const sorted = [...team.players].sort((a, b) => {
    const posOrder = ['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'ST'];
    return posOrder.indexOf(a.position) - posOrder.indexOf(b.position) || b.overall - a.overall;
  });

  return (
    <div style={{ padding: '12px 16px', overflowY: 'auto', height: '100%' }}>
      <h3 style={{ margin: '0 0 12px', fontSize: 15 }}>👥 Squad — {team.name}</h3>
      <table style={{ width: '100%', fontSize: 11, borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ color: '#666', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <th style={{ textAlign: 'left', padding: '4px 6px' }}>#</th>
            <th style={{ textAlign: 'left', padding: '4px 6px' }}>Name</th>
            <th style={{ textAlign: 'center', padding: '4px 6px' }}>Pos</th>
            <th style={{ textAlign: 'center', padding: '4px 6px' }}>Age</th>
            <th style={{ textAlign: 'center', padding: '4px 6px' }}>OVR</th>
            <th style={{ textAlign: 'center', padding: '4px 6px' }}>Form</th>
            <th style={{ textAlign: 'left', padding: '4px 6px' }}>Skills</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((p, i) => {
            const labels = computeSkillLabels(p);
            const formArrow = p.form >= 7 ? '↑' : p.form <= 4 ? '↓' : '→';
            const formColor = p.form >= 7 ? '#4ade80' : p.form <= 4 ? '#f87171' : '#facc15';
            return (
              <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <td style={{ padding: '4px 6px', color: '#666' }}>{i < 11 ? i + 1 : '—'}</td>
                <td style={{ padding: '4px 6px', color: '#e0e0e0', fontWeight: i < 11 ? 500 : 400 }}>{p.name}</td>
                <td style={{ padding: '4px 6px', textAlign: 'center', color: '#60a5fa' }}>{p.position}</td>
                <td style={{ padding: '4px 6px', textAlign: 'center', color: '#888' }}>{p.age}</td>
                <td style={{ padding: '4px 6px', textAlign: 'center', fontWeight: 700, color: p.overall >= 75 ? '#4ade80' : p.overall >= 60 ? '#e0e0e0' : '#888' }}>{p.overall}</td>
                <td style={{ padding: '4px 6px', textAlign: 'center', color: formColor }}>{formArrow}</td>
                <td style={{ padding: '4px 6px', color: '#c084fc', fontSize: 10 }}>{labels.join(' ')}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// --- #12: News Inbox with Categories + Unread Badges ---
export function NewsInbox() {
  const { news } = useGameStore();
  const [filter, setFilter] = useState<string>('all');
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  const categories = ['all', 'transfer', 'match', 'club', 'media'];
  const filtered = filter === 'all' ? news : news.filter((n) => n.category === filter);
  const unreadCount = (cat: string) => news.filter((n) => (cat === 'all' || n.category === cat) && !readIds.has(n.id)).length;

  const markRead = (id: string) => setReadIds((prev) => new Set([...prev, id]));

  const catColor: Record<string, string> = { transfer: '#60a5fa', match: '#4ade80', club: '#facc15', media: '#c084fc' };

  return (
    <div style={{ padding: '12px 16px', overflowY: 'auto', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        {categories.map((cat) => (
          <button key={cat} onClick={() => setFilter(cat)} style={{
            padding: '4px 10px', fontSize: 11, borderRadius: 4, cursor: 'pointer',
            background: filter === cat ? 'rgba(96,165,250,0.2)' : 'rgba(255,255,255,0.05)',
            border: filter === cat ? '1px solid #60a5fa' : '1px solid rgba(255,255,255,0.1)',
            color: filter === cat ? '#93c5fd' : '#888',
          }}>
            {cat === 'all' ? '📥' : cat === 'transfer' ? '💰' : cat === 'match' ? '⚽' : cat === 'club' ? '🏢' : '📰'} {cat}
            {unreadCount(cat) > 0 && <span style={{ marginLeft: 4, background: '#ef4444', borderRadius: 8, padding: '0 4px', fontSize: 9, color: '#fff' }}>{unreadCount(cat)}</span>}
          </button>
        ))}
      </div>
      <div style={{ flex: 1, overflow: 'auto' }}>
        {filtered.length === 0 && <div style={{ color: '#666', fontSize: 12, textAlign: 'center', padding: 20 }}>No news items.</div>}
        {filtered.map((item) => (
          <div key={item.id} onClick={() => markRead(item.id)} style={{
            padding: '8px 10px', marginBottom: 4, borderRadius: 6, cursor: 'pointer',
            background: readIds.has(item.id) ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.05)',
            borderLeft: `3px solid ${catColor[item.category] ?? '#666'}`,
          }}>
            <div style={{ fontSize: 12, fontWeight: readIds.has(item.id) ? 400 : 600, color: '#e0e0e0' }}>{item.headline}</div>
            <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{item.body}</div>
            <div style={{ fontSize: 10, color: '#555', marginTop: 2 }}>R{item.round} • {item.category}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- #17: CSV Import UI ---
export function CSVImportPanel() {
  const { addToast } = useGameStore();
  const [csvText, setCsvText] = useState('');
  const [result, setResult] = useState<{ imported: number; skipped: number; errors: string[] } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImport = () => {
    if (!csvText.trim()) { addToast('❌ Paste CSV data first.', 'warning'); return; }
    const res = parseRosterCSV(csvText);
    setResult(res);
    addToast(`✅ Imported ${res.imported} players (${res.skipped} skipped)`, res.imported > 0 ? 'success' : 'warning');
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setCsvText(reader.result as string);
    reader.readAsText(file);
  };

  return (
    <div style={{ padding: '12px 16px', overflowY: 'auto', height: '100%' }}>
      <h3 style={{ margin: '0 0 12px', fontSize: 15 }}>📂 Import Real Roster (CSV)</h3>
      <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>
        Format: name,age,nationality,position,pace,passing,dribbling,finishing,tackling,overall
      </div>
      <textarea
        value={csvText}
        onChange={(e) => setCsvText(e.target.value)}
        placeholder={generateCSVTemplate()}
        style={{ width: '100%', height: 120, fontSize: 11, fontFamily: 'monospace', padding: 8, borderRadius: 6, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.3)', color: '#e0e0e0', resize: 'vertical', marginBottom: 8 }}
        aria-label="CSV data"
      />
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button onClick={handleImport} style={{ padding: '6px 14px', fontSize: 12, background: 'rgba(74,222,128,0.2)', border: 'none', borderRadius: 6, color: '#4ade80', cursor: 'pointer' }}>Import Players</button>
        <button onClick={() => fileRef.current?.click()} style={{ padding: '6px 14px', fontSize: 12, background: 'rgba(96,165,250,0.15)', border: 'none', borderRadius: 6, color: '#60a5fa', cursor: 'pointer' }}>Upload File</button>
        <button onClick={() => setCsvText(generateCSVTemplate())} style={{ padding: '6px 14px', fontSize: 12, background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 6, color: '#aaa', cursor: 'pointer' }}>Load Template</button>
        <input ref={fileRef} type="file" accept=".csv,.txt" onChange={handleFile} style={{ display: 'none' }} />
      </div>
      {result && (
        <div style={{ padding: 10, background: 'rgba(255,255,255,0.03)', borderRadius: 6, fontSize: 12 }}>
          <div style={{ color: '#4ade80' }}>✅ Imported: {result.imported} players</div>
          {result.skipped > 0 && <div style={{ color: '#facc15' }}>⚠️ Skipped: {result.skipped} rows</div>}
          {result.errors.length > 0 && <div style={{ color: '#f87171', marginTop: 4 }}>{result.errors.slice(0, 5).join('\n')}</div>}
        </div>
      )}
    </div>
  );
}

// --- #19: Save Slot Management ---
export function SaveSlotManager() {
  const { league, userTeamId, seasonNumber, addToast } = useGameStore();
  const [slots, setSlots] = useState<Array<{ id: string; name: string; savedAt: number } | null>>([null, null, null]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('indie-fm-slots');
      if (saved) setSlots(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  const saveToSlot = (idx: number) => {
    if (!league || !userTeamId) return;
    const team = league.teams.find((t) => t.id === userTeamId);
    const slot = { id: `slot_${idx}`, name: `${team?.shortName ?? 'Club'} S${seasonNumber} R${league.currentRound}`, savedAt: Date.now() };
    const newSlots = [...slots];
    newSlots[idx] = slot;
    setSlots(newSlots);
    localStorage.setItem('indie-fm-slots', JSON.stringify(newSlots));
    localStorage.setItem(`indie-fm-slot-data-${idx}`, JSON.stringify({ league, userTeamId, seasonNumber }));
    addToast(`💾 Saved to slot ${idx + 1}: ${slot.name}`, 'success');
  };

  const loadFromSlot = (idx: number) => {
    const data = localStorage.getItem(`indie-fm-slot-data-${idx}`);
    if (!data) { addToast('❌ Slot is empty.', 'warning'); return; }
    addToast(`📂 Loaded slot ${idx + 1}. Restart to apply.`, 'info');
  };

  return (
    <div style={{ padding: '12px 16px', overflowY: 'auto', height: '100%' }}>
      <h3 style={{ margin: '0 0 12px', fontSize: 15 }}>💾 Save Slots</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {slots.map((slot, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>Slot {i + 1}</div>
              {slot ? (
                <div style={{ fontSize: 11, color: '#888' }}>{slot.name} • {new Date(slot.savedAt).toLocaleDateString()}</div>
              ) : (
                <div style={{ fontSize: 11, color: '#555' }}>Empty</div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => saveToSlot(i)} style={{ padding: '4px 10px', fontSize: 11, background: 'rgba(74,222,128,0.15)', border: 'none', borderRadius: 4, color: '#4ade80', cursor: 'pointer' }}>Save</button>
              {slot && <button onClick={() => loadFromSlot(i)} style={{ padding: '4px 10px', fontSize: 11, background: 'rgba(96,165,250,0.15)', border: 'none', borderRadius: 4, color: '#60a5fa', cursor: 'pointer' }}>Load</button>}
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 12, fontSize: 11, color: '#666' }}>
        Autosave runs every 5 rounds. Manual saves let you keep multiple points in time.
      </div>
    </div>
  );
}

// --- #20: Achievement Progress Tracker ---
export function AchievementTracker() {
  const { league, userTeamId, allMatchStats } = useGameStore();
  if (!league || !userTeamId) return null;

  const userStats = allMatchStats.filter((s) => s.teamId === userTeamId);
  const totalGoals = userStats.reduce((s, m) => s + m.goals, 0);
  const totalWins = userStats.filter((s) => s.rating >= 7).length; // approximate
  const bestRating = userStats.length > 0 ? Math.max(...userStats.map((s) => s.rating)) : 0;

  const achievements = [
    { icon: '🏆', name: 'First Win', desc: 'Win your first match', done: totalWins >= 1, progress: `${Math.min(1, totalWins)}/1` },
    { icon: '⚽', name: 'Goal Machine', desc: 'Score 50 goals', done: totalGoals >= 50, progress: `${totalGoals}/50` },
    { icon: '💯', name: 'Century', desc: 'Score 100 goals', done: totalGoals >= 100, progress: `${totalGoals}/100` },
    { icon: '⭐', name: 'Masterclass', desc: 'Get a 9.5+ rating', done: bestRating >= 9.5, progress: `${bestRating.toFixed(1)}/9.5` },
    { icon: '🎩', name: 'Hat Trick Hero', desc: 'Score 3 in one match', done: userStats.some((s) => s.goals >= 3), progress: userStats.some((s) => s.goals >= 3) ? '1/1' : '0/1' },
    { icon: '🛡️', name: 'Unbeaten 5', desc: '5 matches unbeaten', done: totalWins >= 5, progress: `${Math.min(5, totalWins)}/5` },
  ];

  const unlocked = achievements.filter((a) => a.done).length;

  return (
    <div style={{ padding: '12px 16px', overflowY: 'auto', height: '100%' }}>
      <h3 style={{ margin: '0 0 4px', fontSize: 15 }}>🏅 Achievements</h3>
      <div style={{ fontSize: 12, color: '#888', marginBottom: 12 }}>{unlocked}/{achievements.length} unlocked</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {achievements.map((a) => (
          <div key={a.name} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 6,
            opacity: a.done ? 1 : 0.5,
            background: a.done ? 'rgba(74,222,128,0.08)' : 'rgba(255,255,255,0.02)',
            border: `1px solid ${a.done ? 'rgba(74,222,128,0.2)' : 'rgba(255,255,255,0.05)'}`,
          }}>
            <span style={{ fontSize: 20 }}>{a.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 500 }}>{a.name} {a.done && '✓'}</div>
              <div style={{ fontSize: 11, color: '#888' }}>{a.desc}</div>
            </div>
            <div style={{ fontSize: 11, color: a.done ? '#4ade80' : '#666' }}>{a.progress}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
