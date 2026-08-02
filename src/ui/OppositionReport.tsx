import { useGameStore } from '../store/gameStore';
import { getFormGuide } from '../simulation/season';

export function OppositionReport() {
  const { matchHome, matchAway, userTeamId, league } = useGameStore();

  if (!matchHome || !matchAway || !userTeamId || !league) return null;

  const opponent = matchHome.id === userTeamId ? matchAway : matchHome;
  const isHome = matchHome.id === userTeamId;

  const topPlayers = [...opponent.players]
    .sort((a, b) => b.overall - a.overall)
    .slice(0, 5);

  const form = getFormGuide(league, opponent.id, 5);
  const avgOverall = Math.round(opponent.players.slice(0, 11).reduce((s, p) => s + p.overall, 0) / 11);
  const avgAge = (opponent.players.slice(0, 11).reduce((s, p) => s + p.age, 0) / 11).toFixed(1);

  const posColor = (pos: string) => {
    if (pos === 'GK') return '#fbbf24';
    if (['CB', 'LB', 'RB'].includes(pos)) return '#60a5fa';
    if (['CDM', 'CM', 'CAM'].includes(pos)) return '#4ade80';
    return '#f87171';
  };

  return (
    <div style={{ padding: '12px 16px', overflowY: 'auto', height: '100%' }}>
      <h3 style={{ margin: '0 0 12px', fontSize: 15 }}>
        📋 Opposition Report: {opponent.name}
      </h3>

      {/* Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
        <StatBox label="Formation" value={opponent.tactics.formation} />
        <StatBox label="Mentality" value={opponent.tactics.mentality} />
        <StatBox label="Avg OVR" value={String(avgOverall)} />
        <StatBox label="Avg Age" value={avgAge} />
      </div>

      {/* Form */}
      <div style={{ marginBottom: 16 }}>
        <h4 style={{ fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Recent Form</h4>
        <div style={{ display: 'flex', gap: 4 }}>
          {form.map((r, i) => (
            <span key={i} style={{
              width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 4, fontSize: 11, fontWeight: 700,
              background: r === 'W' ? 'rgba(74,222,128,0.3)' : r === 'D' ? 'rgba(251,191,36,0.3)' : 'rgba(248,113,113,0.3)',
              color: r === 'W' ? '#4ade80' : r === 'D' ? '#fbbf24' : '#f87171',
            }}>{r}</span>
          ))}
          {form.length === 0 && <span style={{ color: '#666', fontSize: 12 }}>No matches played yet</span>}
        </div>
      </div>

      {/* Key Players */}
      <h4 style={{ fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Key Players</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 16 }}>
        {topPlayers.map((p) => (
          <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'rgba(255,255,255,0.03)', borderRadius: 4 }}>
            <span style={{ fontSize: 11, color: posColor(p.position), fontWeight: 600, width: 28 }}>{p.position}</span>
            <span style={{ fontSize: 12, flex: 1 }}>{p.name}</span>
            <span style={{ fontSize: 11, color: '#888' }}>{p.age}y</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: p.overall >= 70 ? '#4ade80' : '#fbbf24' }}>{p.overall}</span>
          </div>
        ))}
      </div>

      {/* Tactical notes */}
      <h4 style={{ fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Tactical Tendencies</h4>
      <div style={{ fontSize: 12, color: '#aaa', lineHeight: 1.8 }}>
        <div>• Pressing: <strong>{opponent.tactics.pressing}</strong> — {opponent.tactics.pressing === 'high' ? 'expect aggressive closing down' : opponent.tactics.pressing === 'low' ? 'they sit deep and absorb pressure' : 'balanced approach'}</div>
        <div>• Tempo: <strong>{opponent.tactics.tempo}</strong> — {opponent.tactics.tempo === 'fast' ? 'quick transitions, direct play' : opponent.tactics.tempo === 'slow' ? 'patient build-up, possession-based' : 'standard rhythm'}</div>
        <div>• Width: <strong>{opponent.tactics.width}</strong> — {opponent.tactics.width === 'wide' ? 'stretches play, uses full-backs' : opponent.tactics.width === 'narrow' ? 'plays through the middle' : 'balanced width'}</div>
        <div>• Defensive line: <strong>{opponent.tactics.defensiveLine}%</strong> — {opponent.tactics.defensiveLine > 60 ? 'high line, vulnerable to balls in behind' : opponent.tactics.defensiveLine < 40 ? 'deep block, hard to break down' : 'standard line height'}</div>
      </div>

      {/* Venue */}
      <div style={{ marginTop: 16, padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 6, fontSize: 12, color: '#888' }}>
        {isHome ? `🏟️ Home advantage at ${matchHome.stadium} (${matchHome.capacity.toLocaleString()} capacity)` : `✈️ Away at ${opponent.stadium} (${opponent.capacity.toLocaleString()} capacity)`}
      </div>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ padding: '8px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: 6, textAlign: 'center' }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#e0e0e0', textTransform: 'capitalize' }}>{value}</div>
      <div style={{ fontSize: 10, color: '#888', marginTop: 2 }}>{label}</div>
    </div>
  );
}
