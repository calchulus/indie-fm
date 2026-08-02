import { useGameStore } from '../store/gameStore';
import { Team } from '../types';

interface Prediction {
  teamId: string;
  name: string;
  strength: number;
  predictedPosition: number;
  titleOdds: number;
  top4Chance: number;
  relegationChance: number;
}

export function SeasonPreview() {
  const { league, userTeamId } = useGameStore();

  if (!league) return null;

  const predictions = computePredictions(league.teams);
  const userPrediction = predictions.find((p) => p.teamId === userTeamId);

  return (
    <div style={{ padding: '12px 16px', overflowY: 'auto', height: '100%' }}>
      <h3 style={{ margin: '0 0 12px', fontSize: 15 }}>🔮 Season Preview & Predictions</h3>

      {/* User's prediction */}
      {userPrediction && (
        <div style={{ padding: '14px', background: 'rgba(96,165,250,0.08)', borderRadius: 8, border: '1px solid rgba(96,165,250,0.2)', marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Your Season Outlook</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, fontSize: 12 }}>
            <div>
              <div style={{ color: '#888' }}>Predicted Finish</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#e0e0e0' }}>{userPrediction.predictedPosition}{getOrdinal(userPrediction.predictedPosition)}</div>
            </div>
            <div>
              <div style={{ color: '#888' }}>Title Chance</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: userPrediction.titleOdds > 20 ? '#4ade80' : '#fbbf24' }}>{userPrediction.titleOdds}%</div>
            </div>
            <div>
              <div style={{ color: '#888' }}>Relegation Risk</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: userPrediction.relegationChance > 30 ? '#f87171' : '#4ade80' }}>{userPrediction.relegationChance}%</div>
            </div>
          </div>
        </div>
      )}

      {/* Title contenders */}
      <h4 style={{ fontSize: 12, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>🏆 Title Contenders</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
        {predictions.filter((p) => p.titleOdds > 5).slice(0, 5).map((p) => (
          <div key={p.teamId} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: 4 }}>
            <span style={{ fontSize: 12, flex: 1, color: p.teamId === userTeamId ? '#60a5fa' : '#e0e0e0', fontWeight: p.teamId === userTeamId ? 600 : 400 }}>{p.name}</span>
            <div style={{ width: 100, height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
              <div style={{ width: `${p.titleOdds}%`, height: '100%', background: '#fbbf24', borderRadius: 3 }} />
            </div>
            <span style={{ fontSize: 11, color: '#fbbf24', width: 35, textAlign: 'right' }}>{p.titleOdds}%</span>
          </div>
        ))}
      </div>

      {/* Relegation battle */}
      <h4 style={{ fontSize: 12, color: '#f87171', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>⚠️ Relegation Candidates</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
        {predictions.filter((p) => p.relegationChance > 20).sort((a, b) => b.relegationChance - a.relegationChance).slice(0, 5).map((p) => (
          <div key={p.teamId} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: 4 }}>
            <span style={{ fontSize: 12, flex: 1, color: p.teamId === userTeamId ? '#60a5fa' : '#e0e0e0' }}>{p.name}</span>
            <div style={{ width: 100, height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
              <div style={{ width: `${p.relegationChance}%`, height: '100%', background: '#f87171', borderRadius: 3 }} />
            </div>
            <span style={{ fontSize: 11, color: '#f87171', width: 35, textAlign: 'right' }}>{p.relegationChance}%</span>
          </div>
        ))}
      </div>

      {/* Full predicted table */}
      <h4 style={{ fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Predicted Final Table</h4>
      <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ color: '#888', textAlign: 'left' }}>
            <th style={{ padding: '4px 8px' }}>#</th>
            <th style={{ padding: '4px 8px' }}>Team</th>
            <th style={{ padding: '4px 8px' }}>Strength</th>
            <th style={{ padding: '4px 8px' }}>Title %</th>
            <th style={{ padding: '4px 8px' }}>Top 4 %</th>
            <th style={{ padding: '4px 8px' }}>Rel. %</th>
          </tr>
        </thead>
        <tbody>
          {predictions.map((p) => (
            <tr key={p.teamId} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: p.teamId === userTeamId ? 'rgba(96,165,250,0.08)' : undefined }}>
              <td style={{ padding: '3px 8px', color: p.predictedPosition <= 4 ? '#4ade80' : p.predictedPosition >= 18 ? '#f87171' : '#888' }}>{p.predictedPosition}</td>
              <td style={{ padding: '3px 8px', fontWeight: p.teamId === userTeamId ? 600 : 400 }}>{p.name}</td>
              <td style={{ padding: '3px 8px', color: '#888' }}>{p.strength}</td>
              <td style={{ padding: '3px 8px', color: '#fbbf24' }}>{p.titleOdds}%</td>
              <td style={{ padding: '3px 8px', color: '#4ade80' }}>{p.top4Chance}%</td>
              <td style={{ padding: '3px 8px', color: '#f87171' }}>{p.relegationChance}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function computePredictions(teams: Team[]): Prediction[] {
  const strengths = teams.map((t) => {
    const starters = t.players.slice(0, 11);
    const avg = starters.reduce((s, p) => s + p.overall, 0) / starters.length;
    return { team: t, strength: Math.round(avg * 10) / 10 };
  }).sort((a, b) => b.strength - a.strength);

  const totalStrength = strengths.reduce((s, t) => s + t.strength, 0);

  return strengths.map((s, i) => {
    const share = s.strength / totalStrength;
    const titleOdds = Math.min(85, Math.round(share * teams.length * 100 / 3));
    const top4Chance = Math.min(95, Math.round((1 - i / teams.length) * 80 + share * 200));
    const relegationChance = Math.max(0, Math.round((i / teams.length - 0.6) * 200));

    return {
      teamId: s.team.id,
      name: s.team.name,
      strength: s.strength,
      predictedPosition: i + 1,
      titleOdds: Math.max(0, titleOdds),
      top4Chance: Math.max(0, top4Chance),
      relegationChance: Math.max(0, relegationChance),
    };
  });
}

function getOrdinal(n: number): string {
  if (n === 1) return 'st';
  if (n === 2) return 'nd';
  if (n === 3) return 'rd';
  return 'th';
}
