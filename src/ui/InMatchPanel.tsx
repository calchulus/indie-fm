import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { getSuggestedSubs, TouchlineShout, getShoutEffect, getHalfTimeTalkOptions } from '../simulation/inmatch';

export function InMatchPanel() {
  const { matchState, matchHome, matchAway, userTeamId, applyShout, applySub } = useGameStore();
  const [subsUsed, setSubsUsed] = useState(0);
  const [shoutsUsed, setShoutsUsed] = useState(0);

  if (!matchState || !matchHome || !matchAway) return null;

  const isUserHome = matchHome.id === userTeamId;
  const userTeam = isUserHome ? matchHome : matchAway;
  const scoreDiff = isUserHome
    ? matchState.homeScore - matchState.awayScore
    : matchState.awayScore - matchState.homeScore;

  const suggestions = getSuggestedSubs(userTeam, matchState);
  const halfTimeOptions = getHalfTimeTalkOptions(scoreDiff);
  const isHalfTime = matchState.status === 'half_time';

  const shouts: TouchlineShout[] = ['encourage', 'demand_more', 'push_forward', 'sit_deeper', 'get_stuck_in', 'waste_time'];

  const handleShout = (shout: TouchlineShout) => {
    if (shoutsUsed >= 3) return;
    const effect = getShoutEffect(shout);
    setShoutsUsed((s) => s + 1);
    applyShout(shout.replace(/_/g, ' '), effect.attackMod, effect.defendMod, effect.duration);
  };

  const handleSub = (offId: string, onId: string) => {
    if (subsUsed >= 5) return;
    setSubsUsed((s) => s + 1);
    applySub(offId, onId);
  };

  const handleTeamTalk = (optionId: string) => {
    const option = halfTimeOptions.find((o) => o.id === optionId);
    if (option) {
      applyShout(option.label, option.attackEffect, 1.0, 45);
    }
  };

  const btnStyle: React.CSSProperties = {
    padding: '5px 10px',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: 4,
    background: 'rgba(255,255,255,0.08)',
    color: '#e0e0e0',
    cursor: 'pointer',
    fontSize: 12,
  };

  return (
    <div style={{
      position: 'absolute',
      bottom: 12,
      left: 12,
      right: 12,
      display: 'flex',
      gap: 12,
      alignItems: 'flex-end',
      pointerEvents: 'none',
    }}>
      {/* Shouts */}
      <div style={{ background: 'rgba(0,0,0,0.85)', borderRadius: 8, padding: '8px 12px', pointerEvents: 'auto' }}>
        <div style={{ fontSize: 10, color: '#888', marginBottom: 4, textTransform: 'uppercase' }}>
          Touchline ({3 - shoutsUsed} left)
        </div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {shouts.map((s) => (
            <button key={s} style={{ ...btnStyle, opacity: shoutsUsed >= 3 ? 0.4 : 1 }} onClick={() => handleShout(s)} disabled={shoutsUsed >= 3}>
              {s.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Subs */}
      {suggestions.length > 0 && matchState.status !== 'full_time' && (
        <div style={{ background: 'rgba(0,0,0,0.85)', borderRadius: 8, padding: '8px 12px', pointerEvents: 'auto' }}>
          <div style={{ fontSize: 10, color: '#888', marginBottom: 4, textTransform: 'uppercase' }}>
            Suggested Subs ({5 - subsUsed} left)
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {suggestions.slice(0, 3).map((s) => (
              <button key={s.off.id} style={btnStyle} onClick={() => handleSub(s.off.id, s.on.id)} disabled={subsUsed >= 5}>
                {s.off.name.split(' ').pop()} → {s.on.name.split(' ').pop()} <span style={{ color: '#888' }}>({s.reason})</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Half-time team talk */}
      {isHalfTime && (
        <div style={{ background: 'rgba(0,0,0,0.9)', borderRadius: 8, padding: '10px 14px', pointerEvents: 'auto', border: '1px solid rgba(96,165,250,0.3)' }}>
          <div style={{ fontSize: 11, color: '#60a5fa', marginBottom: 6, fontWeight: 600 }}>Half-Time Team Talk</div>
          <div style={{ display: 'flex', gap: 6 }}>
            {halfTimeOptions.map((opt) => (
              <button key={opt.id} style={{ ...btnStyle, borderColor: 'rgba(96,165,250,0.3)' }} onClick={() => handleTeamTalk(opt.id)} title={opt.description}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
