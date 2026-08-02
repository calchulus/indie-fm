import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { CREST_OPTIONS, COLOR_PRESETS, generateCrestSVG, ClubCustomization, SKILL_TREES, SkillArchetype, getAvailableNodes, MANAGEMENT_STYLES, PLAYING_BACKGROUNDS, ManagerProfile } from '../simulation/customization';

// --- #4: Club Customization Panel ---
export function ClubCustomizer() {
  const { league, userTeamId, addToast } = useGameStore();
  const [colors, setColors] = useState<ClubCustomization>({
    primaryColor: '#3b82f6',
    secondaryColor: '#ffffff',
    crestStyle: 'shield',
    stadiumName: '',
    nickname: '',
  });

  if (!league || !userTeamId) return null;
  const team = league.teams.find((t) => t.id === userTeamId);
  if (!team) return null;

  const crestSvg = generateCrestSVG(colors, 80);

  const handleSave = () => {
    addToast(`✅ Club identity updated! ${colors.nickname || team.name} — ${colors.stadiumName || team.stadium}`, 'success');
  };

  return (
    <div style={{ padding: '12px 16px', overflowY: 'auto', height: '100%' }}>
      <h3 style={{ margin: '0 0 12px', fontSize: 15 }}>🎨 Club Customization</h3>

      {/* Crest Preview */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
        <div dangerouslySetInnerHTML={{ __html: crestSvg }} />
        <div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{colors.nickname || team.name}</div>
          <div style={{ fontSize: 12, color: '#888' }}>{colors.stadiumName || team.stadium}</div>
        </div>
      </div>

      {/* Crest Style */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 12, color: '#aaa', marginBottom: 6 }}>Crest Style</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {CREST_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setColors((c) => ({ ...c, crestStyle: opt.id }))}
              style={{ padding: '6px 10px', fontSize: 16, borderRadius: 6, cursor: 'pointer', background: colors.crestStyle === opt.id ? 'rgba(96,165,250,0.2)' : 'rgba(255,255,255,0.05)', border: colors.crestStyle === opt.id ? '1px solid #60a5fa' : '1px solid rgba(255,255,255,0.1)' }}
              aria-label={opt.label}
            >
              {opt.icon}
            </button>
          ))}
        </div>
      </div>

      {/* Colors */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 12, color: '#aaa', marginBottom: 6 }}>Primary Color</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {COLOR_PRESETS.map((c) => (
            <button key={c} onClick={() => setColors((prev) => ({ ...prev, primaryColor: c }))} style={{ width: 24, height: 24, borderRadius: 4, background: c, border: colors.primaryColor === c ? '2px solid #fff' : '2px solid transparent', cursor: 'pointer' }} aria-label={`Color ${c}`} />
          ))}
        </div>
      </div>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 12, color: '#aaa', marginBottom: 6 }}>Secondary Color</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {COLOR_PRESETS.map((c) => (
            <button key={c} onClick={() => setColors((prev) => ({ ...prev, secondaryColor: c }))} style={{ width: 24, height: 24, borderRadius: 4, background: c, border: colors.secondaryColor === c ? '2px solid #fff' : '2px solid transparent', cursor: 'pointer' }} aria-label={`Color ${c}`} />
          ))}
        </div>
      </div>

      {/* Text fields */}
      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 12, color: '#aaa', display: 'block', marginBottom: 4 }}>Club Nickname</label>
        <input value={colors.nickname} onChange={(e) => setColors((c) => ({ ...c, nickname: e.target.value }))} placeholder={team.name} style={{ padding: '6px 10px', fontSize: 12, borderRadius: 4, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.3)', color: '#e0e0e0', width: 200 }} />
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 12, color: '#aaa', display: 'block', marginBottom: 4 }}>Stadium Name</label>
        <input value={colors.stadiumName} onChange={(e) => setColors((c) => ({ ...c, stadiumName: e.target.value }))} placeholder={team.stadium} style={{ padding: '6px 10px', fontSize: 12, borderRadius: 4, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.3)', color: '#e0e0e0', width: 200 }} />
      </div>

      <button onClick={handleSave} style={{ padding: '8px 16px', fontSize: 12, background: 'rgba(74,222,128,0.2)', border: 'none', borderRadius: 6, color: '#4ade80', cursor: 'pointer' }}>
        Save Club Identity
      </button>
    </div>
  );
}

// --- #5: Skill Tree Panel ---
export function SkillTreePanel() {
  const { league, userTeamId, addToast } = useGameStore();
  const [selectedPlayer, setSelectedPlayer] = useState<string>('');
  const [archetype, setArchetype] = useState<SkillArchetype>('technical');
  const [unlocked, setUnlocked] = useState<Set<string>>(new Set());
  const [devPoints, setDevPoints] = useState(5);

  if (!league || !userTeamId) return null;
  const team = league.teams.find((t) => t.id === userTeamId);
  if (!team) return null;

  const player = team.players.find((p) => p.id === selectedPlayer);
  const available = getAvailableNodes(archetype, unlocked, devPoints);
  const tree = SKILL_TREES[archetype];

  const handleUnlock = (nodeId: string) => {
    const node = tree.find((n) => n.id === nodeId);
    if (!node || !player) return;
    setUnlocked((prev) => new Set([...prev, nodeId]));
    setDevPoints((p) => p - node.cost);
    addToast(`🌳 ${player.name} unlocked "${node.name}" — ${node.description}`, 'success');
  };

  return (
    <div style={{ padding: '12px 16px', overflowY: 'auto', height: '100%' }}>
      <h3 style={{ margin: '0 0 12px', fontSize: 15 }}>🌳 Player Development Tree</h3>

      {/* Player selector */}
      <div style={{ marginBottom: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
        <select value={selectedPlayer} onChange={(e) => setSelectedPlayer(e.target.value)} aria-label="Select player" style={{ padding: '5px 8px', fontSize: 12, borderRadius: 4, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.3)', color: '#e0e0e0', minWidth: 140 }}>
          <option value="">Select player…</option>
          {team.players.slice(0, 20).map((p) => <option key={p.id} value={p.id}>{p.name} ({p.position}, {p.overall})</option>)}
        </select>
        <span style={{ fontSize: 12, color: '#facc15' }}>⭐ {devPoints} dev points</span>
      </div>

      {/* Archetype tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        {(['pace', 'technical', 'physical', 'mental'] as SkillArchetype[]).map((a) => (
          <button key={a} onClick={() => setArchetype(a)} style={{ padding: '4px 10px', fontSize: 11, borderRadius: 4, cursor: 'pointer', background: archetype === a ? 'rgba(96,165,250,0.2)' : 'rgba(255,255,255,0.05)', border: archetype === a ? '1px solid #60a5fa' : '1px solid rgba(255,255,255,0.1)', color: archetype === a ? '#60a5fa' : '#888' }}>
            {a === 'pace' ? '⚡' : a === 'technical' ? '🎯' : a === 'physical' ? '💪' : '🧠'} {a}
          </button>
        ))}
      </div>

      {/* Skill nodes */}
      {player ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {tree.map((node) => {
            const isUnlocked = unlocked.has(node.id);
            const isAvailable = available.some((n) => n.id === node.id);
            return (
              <div key={node.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', borderRadius: 6, opacity: isUnlocked ? 1 : isAvailable ? 0.9 : 0.4, background: isUnlocked ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.03)', border: `1px solid ${isUnlocked ? 'rgba(74,222,128,0.3)' : 'rgba(255,255,255,0.06)'}` }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 500 }}>
                    {isUnlocked ? '✅' : `T${node.tier}`} {node.name}
                  </div>
                  <div style={{ fontSize: 11, color: '#888' }}>{node.description} • Cost: {node.cost}pt</div>
                </div>
                {!isUnlocked && isAvailable && (
                  <button onClick={() => handleUnlock(node.id)} style={{ padding: '3px 8px', fontSize: 11, background: 'rgba(96,165,250,0.2)', border: 'none', borderRadius: 4, color: '#60a5fa', cursor: 'pointer' }}>
                    Unlock
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ fontSize: 12, color: '#666' }}>Select a player to view their development tree.</div>
      )}
    </div>
  );
}

// --- #6: Manager Profile Panel ---
export function ManagerProfileEditor() {
  const { addToast } = useGameStore();
  const [name, setName] = useState('');
  const [nationality, setNationality] = useState('England');
  const [age, setAge] = useState(38);
  const [background, setBackground] = useState<ManagerProfile['playingBackground']>('semi_pro');
  const [style, setStyle] = useState<ManagerProfile['managementStyle']>('tactician');

  const handleCreate = () => {
    if (!name.trim()) { addToast('❌ Enter a name for your manager.', 'warning'); return; }
    addToast(`✅ Manager created: ${name}, ${nationality}, ${style}. ${MANAGEMENT_STYLES.find((s) => s.id === style)?.bonus}`, 'success');
  };

  return (
    <div style={{ padding: '12px 16px', overflowY: 'auto', height: '100%' }}>
      <h3 style={{ margin: '0 0 12px', fontSize: 15 }}>👤 Manager Profile</h3>

      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 12, color: '#aaa', display: 'block', marginBottom: 4 }}>Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter manager name" style={{ padding: '6px 10px', fontSize: 12, borderRadius: 4, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.3)', color: '#e0e0e0', width: 200 }} />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 12, color: '#aaa', display: 'block', marginBottom: 4 }}>Nationality</label>
        <select value={nationality} onChange={(e) => setNationality(e.target.value)} style={{ padding: '5px 8px', fontSize: 12, borderRadius: 4, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.3)', color: '#e0e0e0' }}>
          {['England', 'Spain', 'Germany', 'Italy', 'France', 'Brazil', 'Argentina', 'Netherlands', 'Portugal', 'Scotland'].map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 12, color: '#aaa', display: 'block', marginBottom: 4 }}>Age: {age}</label>
        <input type="range" min={30} max={65} value={age} onChange={(e) => setAge(Number(e.target.value))} style={{ width: 200 }} aria-label="Manager age" />
      </div>

      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 12, color: '#aaa', marginBottom: 6 }}>Playing Background</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {PLAYING_BACKGROUNDS.map((bg) => (
            <label key={bg.id} style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input type="radio" name="background" checked={background === bg.id} onChange={() => setBackground(bg.id)} />
              {bg.label} <span style={{ color: '#666' }}>(Rep: {bg.reputation})</span>
            </label>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, color: '#aaa', marginBottom: 6 }}>Management Style</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {MANAGEMENT_STYLES.map((s) => (
            <div key={s.id} onClick={() => setStyle(s.id)} style={{ padding: '8px 10px', borderRadius: 6, cursor: 'pointer', background: style === s.id ? 'rgba(96,165,250,0.15)' : 'rgba(255,255,255,0.03)', border: style === s.id ? '1px solid #60a5fa' : '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: 12, fontWeight: 500 }}>{s.label}</div>
              <div style={{ fontSize: 11, color: '#888' }}>{s.description}</div>
              <div style={{ fontSize: 11, color: '#4ade80', marginTop: 2 }}>{s.bonus}</div>
            </div>
          ))}
        </div>
      </div>

      <button onClick={handleCreate} style={{ padding: '8px 16px', fontSize: 12, background: 'rgba(74,222,128,0.2)', border: 'none', borderRadius: 6, color: '#4ade80', cursor: 'pointer' }}>
        Create Manager
      </button>
    </div>
  );
}
