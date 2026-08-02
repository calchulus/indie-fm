import { useState } from 'react';
import { CHALLENGE_MODES, UI_THEMES } from '../simulation/club';
import { applyThemeToDocument } from '../theme';
import { insertCustomClub } from '../simulation/challenges';
import { useGameStore } from '../store/gameStore';

export function GameModes() {
  const [subTab, setSubTab] = useState<'create' | 'challenges' | 'themes'>('challenges');
  const [clubName, setClubName] = useState('My Custom FC');
  const [clubCity, setClubCity] = useState('Hometown');
  const [clubStadium, setClubStadium] = useState('Custom Park');
  const [clubCapacity, setClubCapacity] = useState(25000);
  const [clubBudget, setClubBudget] = useState(10_000_000);
  const [created, setCreated] = useState(false);
  const [activeTheme, setActiveTheme] = useState('dark');

  const tabBtn = (active: boolean): React.CSSProperties => ({
    padding: '6px 14px', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 4,
    background: active ? 'rgba(96,165,250,0.3)' : 'rgba(255,255,255,0.08)',
    color: '#e0e0e0', cursor: 'pointer', fontSize: 13,
  });

  const inputStyle: React.CSSProperties = {
    padding: '6px 10px', background: '#2a2a3e', color: '#e0e0e0',
    border: '1px solid rgba(255,255,255,0.15)', borderRadius: 4, fontSize: 13, width: '100%',
  };

  const handleCreate = () => {
    const { league } = useGameStore.getState();
    if (!league) return;
    const { league: updatedLeague, newTeamId } = insertCustomClub(
      league, clubName, clubCity, clubStadium, clubCapacity, clubBudget,
      { primary: '#e63946', secondary: '#ffffff' },
    );
    useGameStore.setState({ league: updatedLeague, userTeamId: newTeamId });
    useGameStore.getState().addToast(`✅ "${clubName}" created and inserted into the league!`, 'success');
    setCreated(true);
  };

  return (
    <div style={{ padding: '12px 16px', overflowY: 'auto', height: '100%' }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button style={tabBtn(subTab === 'challenges')} onClick={() => setSubTab('challenges')}>🎯 Challenges</button>
        <button style={tabBtn(subTab === 'create')} onClick={() => setSubTab('create')}>🆕 Create-a-Club</button>
        <button style={tabBtn(subTab === 'themes')} onClick={() => setSubTab('themes')}>🎨 Themes</button>
      </div>

      {subTab === 'challenges' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {CHALLENGE_MODES.map((c) => (
            <div key={c.id} style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{c.name}</span>
                <span style={{ fontSize: 11, color: c.completed ? '#4ade80' : '#888' }}>{c.completed ? '✅ Complete' : 'Active'}</span>
              </div>
              <div style={{ fontSize: 12, color: '#aaa', marginTop: 4 }}>{c.description}</div>
              <div style={{ fontSize: 12, marginTop: 6 }}>
                {c.constraints.map((con, i) => (
                  <span key={i} style={{ display: 'inline-block', padding: '2px 8px', marginRight: 6, background: 'rgba(248,113,113,0.1)', borderRadius: 3, fontSize: 11, color: '#fca5a5' }}>
                    {con.description}
                  </span>
                ))}
              </div>
              <div style={{ fontSize: 12, color: '#4ade80', marginTop: 6 }}>🎯 Target: {c.target}</div>
            </div>
          ))}
        </div>
      )}

      {subTab === 'create' && (
        <div style={{ maxWidth: 400 }}>
          <h4 style={{ fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Create Your Club</h4>
          {created ? (
            <div style={{ padding: '12px', background: 'rgba(74,222,128,0.1)', borderRadius: 6, color: '#4ade80' }}>
              ✅ "{clubName}" created! Squad of 16 generated. (Full integration coming — club would replace a team in the league.)
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div><label style={{ fontSize: 11, color: '#888', display: 'block', marginBottom: 4 }}>Club Name</label><input style={inputStyle} value={clubName} onChange={(e) => setClubName(e.target.value)} /></div>
              <div><label style={{ fontSize: 11, color: '#888', display: 'block', marginBottom: 4 }}>City</label><input style={inputStyle} value={clubCity} onChange={(e) => setClubCity(e.target.value)} /></div>
              <div><label style={{ fontSize: 11, color: '#888', display: 'block', marginBottom: 4 }}>Stadium Name</label><input style={inputStyle} value={clubStadium} onChange={(e) => setClubStadium(e.target.value)} /></div>
              <div><label style={{ fontSize: 11, color: '#888', display: 'block', marginBottom: 4 }}>Capacity</label><input style={inputStyle} type="number" value={clubCapacity} onChange={(e) => setClubCapacity(Number(e.target.value))} /></div>
              <div><label style={{ fontSize: 11, color: '#888', display: 'block', marginBottom: 4 }}>Budget (£)</label><input style={inputStyle} type="number" value={clubBudget} onChange={(e) => setClubBudget(Number(e.target.value))} /></div>
              <button style={{ ...tabBtn(true), padding: '10px', fontSize: 14 }} onClick={handleCreate}>⚽ Create Club</button>
            </div>
          )}
        </div>
      )}

      {subTab === 'themes' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          {UI_THEMES.map((theme) => (
            <div key={theme.id} onClick={() => { setActiveTheme(theme.id); applyThemeToDocument(theme); }} style={{
              padding: '14px', borderRadius: 8, cursor: 'pointer',
              background: theme.colors.background, border: `2px solid ${activeTheme === theme.id ? theme.colors.primary : 'rgba(255,255,255,0.1)'}`,
            }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: theme.colors.text }}>{theme.name}</div>
              <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                {[theme.colors.primary, theme.colors.secondary, theme.colors.accent, theme.colors.success, theme.colors.danger].map((c, i) => (
                  <div key={i} style={{ width: 20, height: 20, borderRadius: 4, background: c }} />
                ))}
              </div>
              {activeTheme === theme.id && <div style={{ fontSize: 11, color: theme.colors.primary, marginTop: 6 }}>✓ Active</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
