import { useGameStore } from '../store/gameStore';

export function ClubVision() {
  const { league, userTeamId, board, seasonNumber } = useGameStore();

  if (!league || !userTeamId || !board) return null;
  const userTeam = league.teams.find((t) => t.id === userTeamId);
  if (!userTeam) return null;

  const visionItems = generateVision(userTeam.reputation, board.confidence, seasonNumber);

  return (
    <div style={{ padding: '12px 16px', overflowY: 'auto', height: '100%' }}>
      <h3 style={{ margin: '0 0 16px', fontSize: 15 }}>🏛️ Club Vision</h3>

      {/* Club identity */}
      <div style={{ padding: '16px', background: 'rgba(96,165,250,0.05)', borderRadius: 8, border: '1px solid rgba(96,165,250,0.15)', marginBottom: 16 }}>
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{userTeam.name}</div>
        <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>
          {userTeam.city} • {userTeam.stadium} ({userTeam.capacity.toLocaleString()} capacity) • Reputation: {userTeam.reputation}/100
        </div>
        <div style={{ fontSize: 13, color: '#aaa', lineHeight: 1.6 }}>
          {getClubPhilosophy(userTeam.reputation)}
        </div>
      </div>

      {/* Board objectives */}
      <h4 style={{ fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Board Objectives (Season {seasonNumber})</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
        {board.expectations.map((exp, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
            background: 'rgba(255,255,255,0.03)', borderRadius: 6,
            borderLeft: `3px solid ${exp.priority === 'critical' ? '#f87171' : exp.priority === 'important' ? '#fbbf24' : '#888'}`,
          }}>
            <span style={{ fontSize: 10, color: exp.priority === 'critical' ? '#f87171' : exp.priority === 'important' ? '#fbbf24' : '#888', textTransform: 'uppercase', width: 60 }}>{exp.priority}</span>
            <span style={{ flex: 1, fontSize: 13 }}>{exp.target}</span>
            <span>{exp.met ? '✅' : '⬜'}</span>
          </div>
        ))}
      </div>

      {/* Long-term vision */}
      <h4 style={{ fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Long-Term Vision</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {visionItems.map((item, i) => (
          <div key={i} style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 500 }}>{item.title}</span>
              <span style={{ fontSize: 11, color: item.timeline === 'Short-term' ? '#4ade80' : item.timeline === 'Medium-term' ? '#fbbf24' : '#60a5fa' }}>{item.timeline}</span>
            </div>
            <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>{item.description}</div>
          </div>
        ))}
      </div>

      {/* Financial targets */}
      <h4 style={{ fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: 1, margin: '16px 0 8px' }}>Financial Targets</h4>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
        <div style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: 6 }}>
          <div style={{ fontSize: 12, color: '#888' }}>Transfer Budget</div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>£{(board.transferBudget / 1_000_000).toFixed(1)}M</div>
        </div>
        <div style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: 6 }}>
          <div style={{ fontSize: 12, color: '#888' }}>Wage Budget</div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>£{(board.wageBudget / 1_000_000).toFixed(1)}M</div>
        </div>
        <div style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: 6 }}>
          <div style={{ fontSize: 12, color: '#888' }}>Facilities</div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Training {board.facilityLevel.training}/5 • Youth {board.facilityLevel.youth}/5</div>
        </div>
        <div style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: 6 }}>
          <div style={{ fontSize: 12, color: '#888' }}>Board Confidence</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: board.confidence >= 60 ? '#4ade80' : '#fbbf24' }}>{board.confidence}%</div>
        </div>
      </div>
    </div>
  );
}

interface VisionItem {
  title: string;
  description: string;
  timeline: 'Short-term' | 'Medium-term' | 'Long-term';
}

function generateVision(reputation: number, confidence: number, season: number): VisionItem[] {
  const items: VisionItem[] = [];

  if (reputation >= 70) {
    items.push({ title: 'Win the League', description: 'The board expects a title challenge every season.', timeline: 'Short-term' });
    items.push({ title: 'Continental Success', description: 'Progress to the latter stages of continental competition.', timeline: 'Medium-term' });
  } else if (reputation >= 50) {
    items.push({ title: 'Top Half Finish', description: 'Consistently finish in the top half of the table.', timeline: 'Short-term' });
    items.push({ title: 'Push for Top 4', description: 'Build a squad capable of challenging for European places.', timeline: 'Medium-term' });
  } else {
    items.push({ title: 'Avoid Relegation', description: 'Establish the club as a stable top-flight side.', timeline: 'Short-term' });
    items.push({ title: 'Mid-Table Security', description: 'Build towards consistent mid-table finishes.', timeline: 'Medium-term' });
  }

  items.push({ title: 'Develop Youth', description: 'Integrate academy graduates into the first team squad.', timeline: 'Long-term' });
  items.push({ title: 'Financial Sustainability', description: 'Maintain a healthy balance sheet while investing in the squad.', timeline: 'Long-term' });

  if (confidence >= 70) {
    items.push({ title: 'Facility Expansion', description: 'The board is open to discussions about upgrading facilities.', timeline: 'Medium-term' });
  }

  if (season >= 3) {
    items.push({ title: 'Establish a Legacy', description: 'Build a dynasty — sustained success over multiple seasons.', timeline: 'Long-term' });
  }

  return items;
}

function getClubPhilosophy(reputation: number): string {
  if (reputation >= 75) return 'A club with a proud history and global following. The board demands excellence — nothing less than trophies will satisfy the fans.';
  if (reputation >= 55) return 'An ambitious club with a passionate fanbase. The board wants to see progress towards the top of the table and attractive football.';
  if (reputation >= 35) return 'A club with potential and a loyal following. The board values stability and gradual improvement, with an eye on developing young talent.';
  return 'A club fighting to establish itself. The board prioritizes survival and building foundations for the future.';
}
