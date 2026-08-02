import { useGameStore } from '../store/gameStore';
import { getMoraleLabel, computeMoraleReasons } from '../simulation/morale';
import { useState } from 'react';

export function MoralePanel() {
  const { league, userTeamId } = useGameStore();
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);

  if (!league || !userTeamId) return null;
  const userTeam = league.teams.find((t) => t.id === userTeamId);
  if (!userTeam) return null;

  const sorted = [...league.standings].sort((a, b) => b.points - a.points);
  const teamPosition = sorted.findIndex((s) => s.teamId === userTeamId) + 1;

  const playersWithMorale = userTeam.players.map((p, i) => {
    const moraleInfo = getMoraleLabel(p.morale);
    const reasons = computeMoraleReasons(p, {
      isStarter: i < 11,
      recentResults: [],
      contractYearsLeft: p.contractExpiry - 2026,
      teamPosition,
      totalTeams: league.teams.length,
    });
    return { player: p, moraleInfo, reasons, isStarter: i < 11 };
  });

  const selected = playersWithMorale.find((p) => p.player.id === selectedPlayer);

  return (
    <div style={{ padding: '12px 16px', overflowY: 'auto', height: '100%' }}>
      <h3 style={{ margin: '0 0 12px', fontSize: 15 }}>😊 Squad Morale</h3>

      <div style={{ display: 'flex', gap: 16 }}>
        {/* Squad list */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {playersWithMorale.map(({ player, moraleInfo, isStarter }) => (
              <div
                key={player.id}
                onClick={() => setSelectedPlayer(player.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px',
                  borderRadius: 4, cursor: 'pointer', fontSize: 12,
                  background: selectedPlayer === player.id ? 'rgba(96,165,250,0.1)' : 'rgba(255,255,255,0.02)',
                  border: selectedPlayer === player.id ? '1px solid rgba(96,165,250,0.3)' : '1px solid transparent',
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: moraleInfo.color }} />
                <span style={{ fontSize: 11, color: '#60a5fa', width: 28 }}>{player.position}</span>
                <span style={{ flex: 1 }}>{player.name}</span>
                {!isStarter && <span style={{ fontSize: 9, color: '#888' }}>SUB</span>}
                <span style={{ fontSize: 11, color: moraleInfo.color, fontWeight: 600 }}>{moraleInfo.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Detail panel */}
        {selected && (
          <div style={{ width: 280, padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{selected.player.name}</div>
            <div style={{ fontSize: 12, color: selected.moraleInfo.color, marginBottom: 12 }}>
              Morale: {selected.moraleInfo.label} ({selected.player.morale}/10)
            </div>

            <h4 style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', marginBottom: 6 }}>Morale Factors</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {selected.reasons.map((r, i) => (
                <div key={i} style={{ fontSize: 11, padding: '4px 8px', background: 'rgba(255,255,255,0.02)', borderRadius: 4 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 600 }}>{r.factor}</span>
                    <span style={{ color: r.impact > 0 ? '#4ade80' : r.impact < 0 ? '#f87171' : '#888' }}>
                      {r.impact > 0 ? '+' : ''}{r.impact}
                    </span>
                  </div>
                  <div style={{ color: '#888', marginTop: 2 }}>{r.description}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
