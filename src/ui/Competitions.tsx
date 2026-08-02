import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { createCup, simulateCupRound, CupCompetition } from '../simulation/cups';
import { createPyramid, PyramidConfig } from '../simulation/divisions';

export function Competitions() {
  const { league } = useGameStore();
  const [subTab, setSubTab] = useState<'cup' | 'divisions' | 'international'>('cup');
  const [cup, setCup] = useState<CupCompetition | null>(null);
  const [pyramid] = useState<PyramidConfig>(() => createPyramid(20, 3));

  if (!league) return null;

  const teamName = (id: string) => league.teams.find((t) => t.id === id)?.shortName ?? id.slice(0, 3).toUpperCase();

  const handleCreateCup = () => {
    const teamIds = league.teams.map((t) => t.id);
    setCup(createCup('Indie FA Cup', teamIds));
  };

  const handleSimCupRound = () => {
    if (!cup || cup.winnerId) return;
    const { cup: updated } = simulateCupRound(cup, league.teams);
    setCup(updated);
  };

  const tabBtn = (active: boolean): React.CSSProperties => ({
    padding: '6px 14px', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 4,
    background: active ? 'rgba(96,165,250,0.3)' : 'rgba(255,255,255,0.08)',
    color: '#e0e0e0', cursor: 'pointer', fontSize: 13,
  });

  const btnStyle: React.CSSProperties = {
    padding: '6px 14px', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 4,
    background: 'rgba(74,222,128,0.2)', color: '#e0e0e0', cursor: 'pointer', fontSize: 13,
  };

  return (
    <div style={{ padding: '12px 16px', overflowY: 'auto', height: '100%' }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button style={tabBtn(subTab === 'cup')} onClick={() => setSubTab('cup')}>🏆 Cup</button>
        <button style={tabBtn(subTab === 'divisions')} onClick={() => setSubTab('divisions')}>📊 Divisions</button>
        <button style={tabBtn(subTab === 'international')} onClick={() => setSubTab('international')}>🌍 International</button>
      </div>

      {subTab === 'cup' && (
        <div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
            {!cup && <button style={btnStyle} onClick={handleCreateCup}>Create FA Cup</button>}
            {cup && !cup.winnerId && <button style={btnStyle} onClick={handleSimCupRound}>▶ Sim Next Round</button>}
            {cup?.winnerId && <span style={{ color: '#4ade80', fontWeight: 700 }}>🏆 Winner: {teamName(cup.winnerId)}</span>}
          </div>

          {cup && cup.rounds.map((round, ri) => (
            <div key={ri} style={{ marginBottom: 16 }}>
              <h4 style={{ fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>{round.name}</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 6 }}>
                {round.fixtures.filter((f) => f.awayTeamId).map((f) => (
                  <div key={f.id} style={{ fontSize: 12, padding: '4px 8px', background: 'rgba(255,255,255,0.03)', borderRadius: 4 }}>
                    {teamName(f.homeTeamId)} <strong>{f.played ? `${f.homeGoals}-${f.awayGoals}` : 'vs'}</strong> {teamName(f.awayTeamId)}
                    {f.penalties && <span style={{ color: '#fbbf24' }}> (pen {f.penalties.home}-{f.penalties.away})</span>}
                    {f.winnerId && <span style={{ color: '#4ade80' }}> ✓</span>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {subTab === 'divisions' && (
        <div>
          <h4 style={{ fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>League Pyramid</h4>
          {pyramid.divisions.map((div) => (
            <div key={div.id} style={{ marginBottom: 16, padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 6 }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{div.name} <span style={{ color: '#888', fontSize: 11 }}>Tier {div.tier}</span></div>
              <div style={{ fontSize: 12, color: '#888' }}>{div.league.teams.length} teams • Round {div.league.currentRound}</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 6, fontSize: 11 }}>
                <span style={{ color: '#4ade80' }}>↑ Promotion: {pyramid.promotionSlots}</span>
                <span style={{ color: '#fbbf24' }}>⚡ Playoffs: {pyramid.playoffSlots}</span>
                <span style={{ color: '#f87171' }}>↓ Relegation: {pyramid.relegationSlots}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {subTab === 'international' && (
        <div>
          <h4 style={{ fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>International Football</h4>
          <div style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 6, marginBottom: 12 }}>
            <div style={{ fontSize: 13, color: '#aaa' }}>
              International squads are generated from your league's players based on nationality.
              Continental competitions use club teams in a group stage + knockout format.
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            <div style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: 6 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>🌍 Continental Cup</div>
              <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>Group stage (4 groups of 4) → Knockout rounds</div>
            </div>
            <div style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: 6 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>🏴 National Teams</div>
              <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>Friendlies & qualifiers between nations</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
