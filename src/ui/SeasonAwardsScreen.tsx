import { useGameStore } from '../store/gameStore';
import { computeSeasonAwards } from '../simulation/awards';
import { useMemo } from 'react';

export function SeasonAwardsScreen() {
  const { league, seasonComplete } = useGameStore();

  const awards = useMemo(() => {
    if (!league || !seasonComplete) return null;
    return computeSeasonAwards(league);
  }, [league, seasonComplete]);

  if (!awards) {
    return (
      <div style={{ padding: 20, color: '#888', textAlign: 'center' }}>
        Complete a season to see end-of-season awards.
      </div>
    );
  }

  return (
    <div style={{ padding: '12px 16px', overflowY: 'auto', height: '100%' }}>
      <h3 style={{ margin: '0 0 16px', fontSize: 15 }}>🏆 End of Season Awards</h3>

      {/* Main Awards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        <AwardCard
          icon="⭐"
          label="Player of the Season"
          value={awards.playerOfTheSeason?.name ?? '—'}
          sub={awards.playerOfTheSeason ? `${awards.playerOfTheSeason.team} • Rating: ${awards.playerOfTheSeason.rating}` : ''}
        />
        <AwardCard
          icon="👟"
          label="Golden Boot"
          value={awards.goldenBoot?.name ?? '—'}
          sub={awards.goldenBoot ? `${awards.goldenBoot.team} • ${awards.goldenBoot.goals} goals` : ''}
        />
        <AwardCard
          icon="🎯"
          label="Most Assists"
          value={awards.mostAssists?.name ?? '—'}
          sub={awards.mostAssists ? `${awards.mostAssists.team} • ${awards.mostAssists.assists} assists` : ''}
        />
        <AwardCard
          icon="🌟"
          label="Young Player of the Season"
          value={awards.youngPlayerOfTheSeason?.name ?? '—'}
          sub={awards.youngPlayerOfTheSeason ? `${awards.youngPlayerOfTheSeason.team} • Age ${awards.youngPlayerOfTheSeason.age}` : ''}
        />
        <AwardCard
          icon="🛡️"
          label="Best Defense"
          value={awards.bestDefense?.team ?? '—'}
          sub={awards.bestDefense ? `${awards.bestDefense.conceded} goals conceded` : ''}
        />
        <AwardCard
          icon="⚔️"
          label="Best Attack"
          value={awards.bestAttack?.team ?? '—'}
          sub={awards.bestAttack ? `${awards.bestAttack.scored} goals scored` : ''}
        />
      </div>

      {/* Team of the Season */}
      <h4 style={{ fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
        Team of the Season
      </h4>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
        {awards.teamOfTheSeason.map((p) => (
          <div key={p.position + p.name} style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px',
            background: 'rgba(255,255,255,0.03)', borderRadius: 4,
          }}>
            <span style={{ fontSize: 11, color: '#60a5fa', fontWeight: 600, width: 30 }}>{p.position}</span>
            <span style={{ fontSize: 12, flex: 1 }}>{p.name}</span>
            <span style={{ fontSize: 11, color: '#888' }}>{p.team}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#4ade80' }}>{p.overall}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AwardCard({ icon, label, value, sub }: { icon: string; label: string; value: string; sub: string }) {
  return (
    <div style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, textAlign: 'center' }}>
      <div style={{ fontSize: 24, marginBottom: 4 }}>{icon}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#e0e0e0' }}>{value}</div>
      <div style={{ fontSize: 10, color: '#888', marginTop: 2 }}>{label}</div>
      {sub && <div style={{ fontSize: 10, color: '#666', marginTop: 2 }}>{sub}</div>}
    </div>
  );
}
