import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { generateInternationalSquads, generateInternationalFixtures, InternationalSquad, InternationalFixture } from '../simulation/international';

export function InternationalManagement() {
  const { league } = useGameStore();
  const [squads] = useState<InternationalSquad[]>(() => league ? generateInternationalSquads(league.teams) : []);
  const [selectedNation, setSelectedNation] = useState<string>('');
  const [fixtures, setFixtures] = useState<InternationalFixture[]>([]);
  const [subTab, setSubTab] = useState<'squads' | 'fixtures' | 'rankings'>('squads');

  if (!league) return null;

  const selectedSquad = squads.find((s) => s.nationId === selectedNation);

  const handleGenerateFixtures = () => {
    if (squads.length < 2) return;
    const newFixtures = generateInternationalFixtures(squads, 'friendly');
    setFixtures(newFixtures);
  };

  const tabBtn = (active: boolean): React.CSSProperties => ({
    padding: '6px 14px', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 4,
    background: active ? 'rgba(96,165,250,0.3)' : 'rgba(255,255,255,0.08)',
    color: '#e0e0e0', cursor: 'pointer', fontSize: 13,
  });

  const nationName = (id: string) => squads.find((s) => s.nationId === id)?.nationName ?? '?';

  return (
    <div style={{ padding: '12px 16px', overflowY: 'auto', height: '100%' }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button style={tabBtn(subTab === 'squads')} onClick={() => setSubTab('squads')}>🌍 Squads</button>
        <button style={tabBtn(subTab === 'fixtures')} onClick={() => setSubTab('fixtures')}>📅 Fixtures</button>
        <button style={tabBtn(subTab === 'rankings')} onClick={() => setSubTab('rankings')}>📊 Rankings</button>
      </div>

      {subTab === 'squads' && (
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            {squads.map((s) => (
              <button key={s.nationId} onClick={() => setSelectedNation(s.nationId)} style={{
                ...tabBtn(selectedNation === s.nationId), fontSize: 12, padding: '4px 10px',
              }}>
                {s.nationName} ({s.players.length})
              </button>
            ))}
          </div>

          {selectedSquad && (
            <div>
              <h4 style={{ fontSize: 13, color: '#e0e0e0', marginBottom: 8 }}>
                {selectedSquad.nationName} — FIFA #{selectedSquad.fifaRanking} — Manager: {selectedSquad.manager}
              </h4>
              <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ color: '#888', textAlign: 'left' }}>
                    <th style={{ padding: '4px 8px' }}>Pos</th>
                    <th style={{ padding: '4px 8px' }}>Name</th>
                    <th style={{ padding: '4px 8px' }}>Age</th>
                    <th style={{ padding: '4px 8px' }}>OVR</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedSquad.players.map((p) => (
                    <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '3px 8px', color: '#60a5fa' }}>{p.position}</td>
                      <td style={{ padding: '3px 8px' }}>{p.name}</td>
                      <td style={{ padding: '3px 8px', color: '#888' }}>{p.age}</td>
                      <td style={{ padding: '3px 8px', fontWeight: 600 }}>{p.overall}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {!selectedSquad && <div style={{ color: '#666', fontSize: 13 }}>Select a nation to view their squad.</div>}
        </div>
      )}

      {subTab === 'fixtures' && (
        <div>
          <button onClick={handleGenerateFixtures} style={{ ...tabBtn(false), marginBottom: 12, background: 'rgba(74,222,128,0.2)' }}>
            🔄 Generate International Fixtures
          </button>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {fixtures.map((f) => (
              <div key={f.id} style={{ display: 'flex', alignItems: 'center', padding: '6px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: 4, fontSize: 12 }}>
                <span style={{ flex: 1, textAlign: 'right' }}>{nationName(f.homeNationId)}</span>
                <span style={{ width: 50, textAlign: 'center', fontWeight: 600 }}>
                  {f.played ? `${f.homeGoals}-${f.awayGoals}` : 'vs'}
                </span>
                <span style={{ flex: 1 }}>{nationName(f.awayNationId)}</span>
                <span style={{ fontSize: 10, color: '#888', marginLeft: 8 }}>{f.competition}</span>
              </div>
            ))}
            {fixtures.length === 0 && <div style={{ color: '#666', fontSize: 13 }}>No fixtures generated yet.</div>}
          </div>
        </div>
      )}

      {subTab === 'rankings' && (
        <div>
          <h4 style={{ fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>FIFA Rankings</h4>
          <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ color: '#888', textAlign: 'left' }}>
                <th style={{ padding: '4px 8px' }}>#</th>
                <th style={{ padding: '4px 8px' }}>Nation</th>
                <th style={{ padding: '4px 8px' }}>Squad Size</th>
                <th style={{ padding: '4px 8px' }}>Avg OVR</th>
              </tr>
            </thead>
            <tbody>
              {[...squads].sort((a, b) => a.fifaRanking - b.fifaRanking).map((s) => {
                const avgOvr = Math.round(s.players.reduce((sum, p) => sum + p.overall, 0) / s.players.length);
                return (
                  <tr key={s.nationId} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '4px 8px', fontWeight: 600 }}>{s.fifaRanking}</td>
                    <td style={{ padding: '4px 8px' }}>{s.nationName}</td>
                    <td style={{ padding: '4px 8px', color: '#888' }}>{s.players.length}</td>
                    <td style={{ padding: '4px 8px', color: '#4ade80' }}>{avgOvr}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
