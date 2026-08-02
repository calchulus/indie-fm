import { useGameStore } from '../store/gameStore';
import { Formation, TeamMentality, PressingIntensity, TempoSetting, WidthSetting, Tactics } from '../types';
import { getFormationSlots } from '../simulation/tactics';

const FORMATIONS: Formation[] = ['4-4-2', '4-3-3', '3-5-2', '4-2-3-1', '5-3-2', '4-1-4-1', '3-4-3', '4-4-1-1', '4-5-1', '5-4-1', '4-3-3-att', '4-2-4', '3-4-1-2', '4-1-2-1-2', '5-2-3', '4-6-0', '4-2-2-2', '3-3-4'];
const MENTALITIES: TeamMentality[] = ['defensive', 'balanced', 'attacking'];
const PRESSING: PressingIntensity[] = ['low', 'medium', 'high'];
const TEMPO: TempoSetting[] = ['slow', 'normal', 'fast'];
const WIDTH: WidthSetting[] = ['narrow', 'normal', 'wide'];

export function TacticsEditor() {
  const { league, userTeamId } = useGameStore();

  if (!league) return null;
  const userTeam = league.teams.find((t) => t.id === userTeamId);
  if (!userTeam) return null;

  const tactics = userTeam.tactics;

  const updateTactics = (partial: Partial<Tactics>) => {
    userTeam.tactics = { ...userTeam.tactics, ...partial };
    useGameStore.setState({ league: { ...league } });
  };

  const slots = getFormationSlots(tactics.formation);

  const selectStyle: React.CSSProperties = {
    padding: '6px 10px',
    background: '#2a2a3e',
    color: '#e0e0e0',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: 4,
    fontSize: 13,
    width: '100%',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 11,
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
    display: 'block',
  };

  return (
    <div style={{ padding: '12px 16px', overflowY: 'auto', height: '100%' }}>
      <h3 style={{ margin: '0 0 16px', fontSize: 15, color: '#e0e0e0' }}>Tactics — {userTeam.name}</h3>

      {/* Formation pitch diagram */}
      <div style={{
        position: 'relative',
        width: 280,
        height: 400,
        background: '#2d8a4e',
        borderRadius: 8,
        margin: '0 auto 24px',
        border: '2px solid rgba(255,255,255,0.3)',
        overflow: 'hidden',
      }}>
        {/* Pitch markings */}
        <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: 'rgba(255,255,255,0.3)' }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 60, height: 60, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.3)' }} />
        <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: 120, height: 50, border: '1px solid rgba(255,255,255,0.3)', borderBottom: 'none' }} />
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 120, height: 50, border: '1px solid rgba(255,255,255,0.3)', borderTop: 'none' }} />

        {slots.map((slot, i) => {
          const player = userTeam.players[i];
          const xPct = (slot.baseY / 68) * 100;
          const yPct = 100 - (slot.baseX / 105) * 100;
          return (
            <div key={i} style={{
              position: 'absolute',
              left: `${xPct}%`,
              top: `${yPct}%`,
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
            }}>
              <div style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: userTeam.colors.primary,
                border: '2px solid white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 9,
                fontWeight: 700,
                color: '#fff',
                margin: '0 auto',
              }}>
                {slot.role.slice(0, 2).toUpperCase()}
              </div>
              <div style={{ fontSize: 8, color: '#fff', marginTop: 2, textShadow: '0 1px 2px rgba(0,0,0,0.8)', maxWidth: 50, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {player?.name.split(' ').pop() ?? '?'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Controls */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, maxWidth: 500 }}>
        <div>
          <label style={labelStyle}>Formation</label>
          <select
            style={selectStyle}
            value={tactics.formation}
            onChange={(e) => updateTactics({ formation: e.target.value as Formation })}
          >
            {FORMATIONS.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>

        <div>
          <label style={labelStyle}>Mentality</label>
          <select
            style={selectStyle}
            value={tactics.mentality}
            onChange={(e) => updateTactics({ mentality: e.target.value as TeamMentality })}
          >
            {MENTALITIES.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        <div>
          <label style={labelStyle}>Pressing</label>
          <select
            style={selectStyle}
            value={tactics.pressing}
            onChange={(e) => updateTactics({ pressing: e.target.value as PressingIntensity })}
          >
            {PRESSING.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        <div>
          <label style={labelStyle}>Tempo</label>
          <select
            style={selectStyle}
            value={tactics.tempo}
            onChange={(e) => updateTactics({ tempo: e.target.value as TempoSetting })}
          >
            {TEMPO.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div>
          <label style={labelStyle}>Width</label>
          <select
            style={selectStyle}
            value={tactics.width}
            onChange={(e) => updateTactics({ width: e.target.value as WidthSetting })}
          >
            {WIDTH.map((w) => <option key={w} value={w}>{w}</option>)}
          </select>
        </div>

        <div>
          <label style={labelStyle}>Defensive Line: {tactics.defensiveLine}%</label>
          <input
            type="range"
            min={20}
            max={80}
            value={tactics.defensiveLine}
            onChange={(e) => updateTactics({ defensiveLine: Number(e.target.value) })}
            style={{ width: '100%', accentColor: '#60a5fa' }}
          />
        </div>
      </div>

      {/* Tactical summary */}
      <div style={{ marginTop: 20, padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 6, fontSize: 12, color: '#aaa' }}>
        <strong style={{ color: '#e0e0e0' }}>Style summary:</strong>{' '}
        {tactics.mentality === 'attacking' ? 'Push forward, high risk/reward. ' : tactics.mentality === 'defensive' ? 'Sit deep, absorb pressure, counter. ' : 'Balanced approach. '}
        {tactics.pressing === 'high' ? 'Aggressive press to win ball high. ' : tactics.pressing === 'low' ? 'Drop off, stay compact. ' : 'Measured pressing. '}
        {tactics.tempo === 'fast' ? 'Quick transitions, direct play. ' : tactics.tempo === 'slow' ? 'Patient build-up, retain possession. ' : 'Standard tempo. '}
        {tactics.width === 'wide' ? 'Stretch play wide. ' : tactics.width === 'narrow' ? 'Play through the middle. ' : 'Balanced width. '}
      </div>
    </div>
  );
}
