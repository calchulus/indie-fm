import { useGameStore } from '../store/gameStore';
import { FORMATIONS } from '../simulation/formations';

// Floating quick-tactics panel — always visible during a match.
// One-click formation/mentality/pressing changes without leaving the Match tab.
export function QuickTactics() {
  const { matchState, matchHome, matchAway, userTeamId, applyShout } = useGameStore();

  if (!matchState || !matchHome || !matchAway || !userTeamId) return null;
  // Hide touchline bar when match is finished
  if (matchState.status === 'full_time' || matchState.status === 'pre_match') return null;
  const isUserHome = matchHome.id === userTeamId;
  const team = isUserHome ? matchHome : matchAway;
  const { formation, mentality, pressing } = team.tactics;

  const setTeam = (updater: (t: typeof team) => typeof team) => {
    const updated = updater(team);
    useGameStore.setState(isUserHome ? { matchHome: updated } : { matchAway: updated });
  };

  const btn = (active: boolean): React.CSSProperties => ({
    padding: '3px 8px', fontSize: 10, borderRadius: 4, cursor: 'pointer',
    background: active ? 'rgba(96,165,250,0.3)' : 'rgba(255,255,255,0.06)',
    border: active ? '1px solid #60a5fa' : '1px solid rgba(255,255,255,0.1)',
    color: active ? '#93c5fd' : '#888',
    transition: 'all 0.15s',
  });

  return (
    <div style={{
      position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)',
      background: 'rgba(15,15,25,0.9)', borderRadius: 10, padding: '8px 12px',
      border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)',
      display: 'flex', gap: 14, alignItems: 'center', zIndex: 10, flexWrap: 'wrap',
      boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
    }}>
      {/* Formation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 10, color: '#666', fontWeight: 600 }}>FORM</span>
        <select
          value={formation}
          onChange={(e) => { setTeam((t) => ({ ...t, tactics: { ...t.tactics, formation: e.target.value as any } })); }}
          aria-label="Formation"
          style={{ padding: '3px 6px', fontSize: 11, borderRadius: 4, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.4)', color: '#e0e0e0', cursor: 'pointer' }}
        >
          {FORMATIONS.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
        </select>
      </div>

      {/* Mentality */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={{ fontSize: 10, color: '#666', fontWeight: 600 }}>MENT</span>
        {(['defensive', 'balanced', 'attacking'] as const).map((m) => (
          <button key={m} style={btn(mentality === m)} onClick={() => { setTeam((t) => ({ ...t, tactics: { ...t.tactics, mentality: m } })); }}>
            {m === 'defensive' ? '🛡' : m === 'balanced' ? '⚖' : '⚔'}
          </button>
        ))}
      </div>

      {/* Pressing */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={{ fontSize: 10, color: '#666', fontWeight: 600 }}>PRESS</span>
        {(['low', 'medium', 'high'] as const).map((p) => (
          <button key={p} style={btn(pressing === p)} onClick={() => { setTeam((t) => ({ ...t, tactics: { ...t.tactics, pressing: p } })); }}>
            {p === 'low' ? '▁' : p === 'medium' ? '▄' : '█'}
          </button>
        ))}
      </div>

      {/* Quick shouts */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={{ fontSize: 10, color: '#666', fontWeight: 600 }}>SHOUT</span>
        <button style={btn(false)} onClick={() => applyShout('Push Forward!', 1.15, 0.9, 5)} title="Push Forward">⬆</button>
        <button style={btn(false)} onClick={() => applyShout('Sit Deeper', 0.85, 1.2, 8)} title="Sit Deeper">⬇</button>
        <button style={btn(false)} onClick={() => applyShout('Encourage', 1.05, 1.0, 5)} title="Encourage">👏</button>
      </div>
    </div>
  );
}
