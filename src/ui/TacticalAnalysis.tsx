import { useGameStore } from '../store/gameStore';
import { Team } from '../types';

export function TacticalAnalysis() {
  const { matchHome, matchAway, userTeamId } = useGameStore();

  if (!matchHome || !matchAway) {
    return <div style={{ padding: 20, color: '#888', textAlign: 'center' }}>Start a match to see tactical analysis.</div>;
  }

  const userTeam = matchHome.id === userTeamId ? matchHome : matchAway;
  const opponent = matchHome.id === userTeamId ? matchAway : matchHome;

  const analysis = analyzeMatchup(userTeam, opponent);

  return (
    <div style={{ padding: '12px 16px', overflowY: 'auto', height: '100%' }}>
      <h3 style={{ margin: '0 0 12px', fontSize: 15 }}>🧠 Tactical Analysis</h3>

      {/* Formation matchup */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: userTeam.colors.primary }}>{userTeam.tactics.formation}</div>
          <div style={{ fontSize: 11, color: '#888' }}>{userTeam.name}</div>
        </div>
        <div style={{ fontSize: 14, color: '#888' }}>vs</div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: opponent.colors.primary }}>{opponent.tactics.formation}</div>
          <div style={{ fontSize: 11, color: '#888' }}>{opponent.name}</div>
        </div>
      </div>

      {/* Strengths and weaknesses */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        <div style={{ padding: '12px', background: 'rgba(74,222,128,0.05)', borderRadius: 8, border: '1px solid rgba(74,222,128,0.15)' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#4ade80', marginBottom: 6 }}>✅ Your Advantages</div>
          {analysis.advantages.map((a, i) => (
            <div key={i} style={{ fontSize: 11, color: '#aaa', marginBottom: 3 }}>• {a}</div>
          ))}
        </div>
        <div style={{ padding: '12px', background: 'rgba(248,113,113,0.05)', borderRadius: 8, border: '1px solid rgba(248,113,113,0.15)' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#f87171', marginBottom: 6 }}>⚠️ Their Advantages</div>
          {analysis.disadvantages.map((d, i) => (
            <div key={i} style={{ fontSize: 11, color: '#aaa', marginBottom: 3 }}>• {d}</div>
          ))}
        </div>
      </div>

      {/* Tactical recommendations */}
      <h4 style={{ fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Recommendations</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {analysis.recommendations.map((r, i) => (
          <div key={i} style={{ padding: '8px 12px', background: 'rgba(96,165,250,0.05)', borderRadius: 6, fontSize: 12, color: '#93c5fd' }}>
            💡 {r}
          </div>
        ))}
      </div>

      {/* Style comparison */}
      <h4 style={{ fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: 1, margin: '16px 0 8px' }}>Style Comparison</h4>
      <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ color: '#888', textAlign: 'left' }}>
            <th style={{ padding: '4px 8px' }}>Attribute</th>
            <th style={{ padding: '4px 8px', color: userTeam.colors.primary }}>You</th>
            <th style={{ padding: '4px 8px', color: opponent.colors.primary }}>Opponent</th>
          </tr>
        </thead>
        <tbody>
          <StyleRow label="Mentality" a={userTeam.tactics.mentality} b={opponent.tactics.mentality} />
          <StyleRow label="Pressing" a={userTeam.tactics.pressing} b={opponent.tactics.pressing} />
          <StyleRow label="Tempo" a={userTeam.tactics.tempo} b={opponent.tactics.tempo} />
          <StyleRow label="Width" a={userTeam.tactics.width} b={opponent.tactics.width} />
          <StyleRow label="Def. Line" a={`${userTeam.tactics.defensiveLine}%`} b={`${opponent.tactics.defensiveLine}%`} />
        </tbody>
      </table>
    </div>
  );
}

function StyleRow({ label, a, b }: { label: string; a: string; b: string }) {
  return (
    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <td style={{ padding: '4px 8px', color: '#888' }}>{label}</td>
      <td style={{ padding: '4px 8px', textTransform: 'capitalize' }}>{a}</td>
      <td style={{ padding: '4px 8px', textTransform: 'capitalize' }}>{b}</td>
    </tr>
  );
}

interface MatchupAnalysis {
  advantages: string[];
  disadvantages: string[];
  recommendations: string[];
}

function analyzeMatchup(user: Team, opponent: Team): MatchupAnalysis {
  const advantages: string[] = [];
  const disadvantages: string[] = [];
  const recommendations: string[] = [];

  const userAtk = avgAttr(user, ['finishing', 'offTheBall', 'composure']);
  const oppAtk = avgAttr(opponent, ['finishing', 'offTheBall', 'composure']);
  const userDef = avgAttr(user, ['marking', 'tackling', 'positioning']);
  const oppDef = avgAttr(opponent, ['marking', 'tackling', 'positioning']);
  const userPace = avgAttr(user, ['pace', 'acceleration']);
  const oppPace = avgAttr(opponent, ['pace', 'acceleration']);
  const userMid = avgAttr(user, ['passing', 'vision', 'technique']);
  const oppMid = avgAttr(opponent, ['passing', 'vision', 'technique']);

  if (userAtk > oppDef + 1) advantages.push('Your attack outclasses their defense');
  if (userMid > oppMid + 1) advantages.push('Midfield control advantage');
  if (userPace > oppPace + 1) advantages.push('Pace advantage on the break');
  if (userDef > oppAtk + 1) advantages.push('Solid defense against their attack');

  if (oppAtk > userDef + 1) disadvantages.push('Their attack could exploit your defense');
  if (oppMid > userMid + 1) disadvantages.push('They may dominate midfield');
  if (oppPace > userPace + 1) disadvantages.push('Their pace could trouble you on the counter');
  if (oppDef > userAtk + 1) disadvantages.push('Their defense is hard to break down');

  if (oppDef > userAtk) recommendations.push('Try playing wider to stretch their defense');
  if (oppMid > userMid) recommendations.push('Consider pressing higher to disrupt their build-up');
  if (oppPace > userPace) recommendations.push('Drop your defensive line deeper to negate their pace');
  if (userAtk > oppDef) recommendations.push('Play direct balls in behind their defense');
  if (userMid > oppMid) recommendations.push('Control possession and be patient in build-up');
  if (recommendations.length === 0) recommendations.push('Evenly matched — stick to your game plan');

  if (advantages.length === 0) advantages.push('Evenly matched in most areas');
  if (disadvantages.length === 0) disadvantages.push('No major weaknesses to exploit');

  return { advantages, disadvantages, recommendations };
}

function avgAttr(team: Team, keys: string[]): number {
  const starters = team.players.slice(0, 11);
  const vals = starters.map((p) => {
    const attrs = p.attributes as unknown as Record<string, number>;
    return keys.reduce((s, k) => s + (attrs[k] ?? 0), 0) / keys.length;
  });
  return vals.reduce((s, v) => s + v, 0) / vals.length;
}
