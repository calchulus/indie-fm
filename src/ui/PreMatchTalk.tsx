import { useState } from 'react';
import { useGameStore } from '../store/gameStore';

interface TeamTalkOption {
  id: string;
  label: string;
  description: string;
  moraleEffect: number;
  attackEffect: number;
  defendEffect: number;
  tone: 'positive' | 'neutral' | 'aggressive' | 'calm';
}

const PRE_MATCH_TALKS: TeamTalkOption[] = [
  { id: 'inspire', label: 'Inspire', description: 'Rally the troops with an emotional speech', moraleEffect: 2, attackEffect: 1.05, defendEffect: 1.0, tone: 'positive' },
  { id: 'focused', label: 'Stay Focused', description: 'Remind them of the game plan', moraleEffect: 0, attackEffect: 1.0, defendEffect: 1.05, tone: 'calm' },
  { id: 'demand', label: 'Demand Excellence', description: 'Set high standards, no excuses', moraleEffect: -1, attackEffect: 1.1, defendEffect: 1.05, tone: 'aggressive' },
  { id: 'relaxed', label: 'Keep It Light', description: 'Reduce pressure, play freely', moraleEffect: 1, attackEffect: 1.05, defendEffect: 0.95, tone: 'positive' },
  { id: 'tactical', label: 'Tactical Briefing', description: 'Go over opponent weaknesses in detail', moraleEffect: 0, attackEffect: 1.08, defendEffect: 1.03, tone: 'neutral' },
  { id: 'intimidate', label: 'Fire Them Up', description: 'Use anger as fuel, aggressive approach', moraleEffect: -1, attackEffect: 1.12, defendEffect: 0.95, tone: 'aggressive' },
];

export function PreMatchTalk() {
  const { matchState, matchHome, matchAway, userTeamId } = useGameStore();
  const [selected, setSelected] = useState<string | null>(null);
  const [delivered, setDelivered] = useState(false);

  if (!matchState || !matchHome || !matchAway || matchState.status !== 'pre_match') return null;

  const userTeam = matchHome.id === userTeamId ? matchHome : matchAway;
  const opponent = matchHome.id === userTeamId ? matchAway : matchHome;

  const handleDeliver = (talk: TeamTalkOption) => {
    setSelected(talk.id);
    setDelivered(true);
    useGameStore.getState().addToast(`🗣️ Team talk: "${talk.label}" — ${talk.description}`, 'info');
  };

  const toneColor = (tone: string) => {
    switch (tone) {
      case 'positive': return '#4ade80';
      case 'aggressive': return '#f87171';
      case 'calm': return '#60a5fa';
      default: return '#fbbf24';
    }
  };

  return (
    <div style={{ padding: '12px 16px', overflowY: 'auto', height: '100%' }}>
      <h3 style={{ margin: '0 0 12px', fontSize: 15 }}>🗣️ Pre-Match Team Talk</h3>

      <div style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
        <span style={{ color: userTeam.colors.primary, fontWeight: 600 }}>{userTeam.name}</span>
        <span style={{ color: '#888' }}> vs </span>
        <span style={{ color: opponent.colors.primary, fontWeight: 600 }}>{opponent.name}</span>
        <div style={{ fontSize: 11, color: '#888', marginTop: 4 }}>Choose your approach before kickoff. This affects team morale and performance.</div>
      </div>

      {delivered ? (
        <div style={{ textAlign: 'center', padding: 20 }}>
          <div style={{ fontSize: 14, color: '#4ade80', fontWeight: 600 }}>
            ✅ Talk delivered: "{PRE_MATCH_TALKS.find((t) => t.id === selected)?.label}"
          </div>
          <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
            The squad is ready. Press Play to start the match.
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
          {PRE_MATCH_TALKS.map((talk) => (
            <button
              key={talk.id}
              onClick={() => handleDeliver(talk)}
              style={{
                padding: '12px 14px', textAlign: 'left', cursor: 'pointer',
                background: selected === talk.id ? 'rgba(96,165,250,0.15)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${selected === talk.id ? 'rgba(96,165,250,0.3)' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: 8, color: '#e0e0e0',
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 600, color: toneColor(talk.tone), marginBottom: 4 }}>{talk.label}</div>
              <div style={{ fontSize: 11, color: '#888' }}>{talk.description}</div>
              <div style={{ fontSize: 10, color: '#666', marginTop: 6 }}>
                Morale: {talk.moraleEffect > 0 ? '+' : ''}{talk.moraleEffect} •
                Atk: {talk.attackEffect > 1 ? '+' : ''}{Math.round((talk.attackEffect - 1) * 100)}% •
                Def: {talk.defendEffect > 1 ? '+' : ''}{Math.round((talk.defendEffect - 1) * 100)}%
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
