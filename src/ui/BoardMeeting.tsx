import { useGameStore } from '../store/gameStore';

export function BoardMeeting() {
  const { league, userTeamId, board, finances, requestBudget, requestFacility } = useGameStore();

  if (!league || !userTeamId || !board || !finances) return null;
  const userTeam = league.teams.find((t) => t.id === userTeamId);
  if (!userTeam) return null;

  const moodLabel = board.confidence >= 80 ? 'Delighted' : board.confidence >= 60 ? 'Pleased' : board.confidence >= 40 ? 'Neutral' : board.confidence >= 20 ? 'Concerned' : 'Furious';
  const moodColor = board.confidence >= 60 ? '#4ade80' : board.confidence >= 40 ? '#fbbf24' : '#f87171';

  const btnStyle: React.CSSProperties = {
    padding: '8px 16px', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 6,
    background: 'rgba(255,255,255,0.08)', color: '#e0e0e0', cursor: 'pointer', fontSize: 13,
  };

  return (
    <div style={{ padding: '12px 16px', overflowY: 'auto', height: '100%' }}>
      <h3 style={{ margin: '0 0 16px', fontSize: 15 }}>🏢 Board Meeting</h3>

      {/* Board confidence */}
      <div style={{ padding: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Board Confidence</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: moodColor }}>{board.confidence}% — {moodLabel}</span>
        </div>
        <div style={{ height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
          <div style={{ width: `${board.confidence}%`, height: '100%', background: moodColor, borderRadius: 4, transition: 'width 0.3s' }} />
        </div>
      </div>

      {/* Expectations */}
      <div style={{ marginBottom: 16 }}>
        <h4 style={{ fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Board Expectations</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {board.expectations.map((exp, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 10px', background: 'rgba(255,255,255,0.02)', borderRadius: 4, fontSize: 12 }}>
              <span style={{ color: exp.priority === 'critical' ? '#f87171' : exp.priority === 'important' ? '#fbbf24' : '#888', fontSize: 10, textTransform: 'uppercase', width: 60 }}>{exp.priority}</span>
              <span style={{ flex: 1 }}>{exp.target}</span>
              <span>{exp.met ? '✅' : '⬜'}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Requests */}
      <h4 style={{ fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Make Requests</h4>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
        <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: 6 }}>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>💰 Request Budget (+£5M)</div>
          <div style={{ fontSize: 11, color: '#888', marginBottom: 8 }}>Current: £{(board.transferBudget / 1_000_000).toFixed(1)}M</div>
          <button style={btnStyle} onClick={() => requestBudget(5_000_000)}>Request</button>
        </div>

        {(['training', 'youth', 'stadium'] as const).map((facility) => (
          <div key={facility} style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: 6 }}>
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4, textTransform: 'capitalize' }}>🏗️ Upgrade {facility}</div>
            <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>Level {board.facilityLevel[facility]}/5</div>
            <div style={{ display: 'flex', gap: 2, marginBottom: 8 }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} style={{ flex: 1, height: 6, borderRadius: 2, background: i <= board.facilityLevel[facility] ? '#4ade80' : 'rgba(255,255,255,0.1)' }} />
              ))}
            </div>
            <button style={btnStyle} onClick={() => requestFacility(facility)} disabled={board.facilityLevel[facility] >= 5}>
              {board.facilityLevel[facility] >= 5 ? 'Max Level' : 'Request Upgrade'}
            </button>
          </div>
        ))}
      </div>

      {/* Finances summary */}
      <h4 style={{ fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: 1, margin: '16px 0 8px' }}>Financial Summary</h4>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        <div style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: 6, textAlign: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#4ade80' }}>£{(finances.balance / 1_000_000).toFixed(1)}M</div>
          <div style={{ fontSize: 10, color: '#888' }}>Balance</div>
        </div>
        <div style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: 6, textAlign: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 700 }}>£{(finances.sponsorship.annual / 1_000_000).toFixed(1)}M/yr</div>
          <div style={{ fontSize: 10, color: '#888' }}>Sponsorship ({finances.sponsorship.name})</div>
        </div>
        <div style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: 6, textAlign: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 700 }}>{finances.averageAttendance.toLocaleString()}</div>
          <div style={{ fontSize: 10, color: '#888' }}>Avg Attendance</div>
        </div>
      </div>
    </div>
  );
}
