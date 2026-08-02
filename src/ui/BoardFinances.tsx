import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { createBoardState, createFinances, getBoardMood, isManagerSafe, BoardState, ClubFinances } from '../simulation/board';

export function BoardFinances() {
  const { league, userTeamId } = useGameStore();
  const [board] = useState<BoardState>(() => {
    const team = league?.teams.find((t) => t.id === userTeamId);
    return team ? createBoardState(team, 10) : { confidence: 65, expectations: [], transferBudget: 0, wageBudget: 0, facilityLevel: { training: 3, youth: 3, stadium: 3 }, takeoverOffer: false };
  });
  const [finances] = useState<ClubFinances>(() => {
    const team = league?.teams.find((t) => t.id === userTeamId);
    return team ? createFinances(team) : { balance: 0, records: [], sponsorship: { name: '', annual: 0, yearsLeft: 0 }, ticketPrice: 0, averageAttendance: 0, debt: 0 };
  });

  if (!league || !userTeamId) return null;
  const userTeam = league.teams.find((t) => t.id === userTeamId);
  if (!userTeam) return null;

  const mood = getBoardMood(board);
  const safe = isManagerSafe(board);

  return (
    <div style={{ padding: '12px 16px', overflowY: 'auto', height: '100%' }}>
      <h3 style={{ margin: '0 0 16px', fontSize: 15 }}>🏢 Board & Finances</h3>

      {/* Board Confidence */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: 6, textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: board.confidence >= 60 ? '#4ade80' : board.confidence >= 30 ? '#fbbf24' : '#f87171' }}>
            {board.confidence}%
          </div>
          <div style={{ fontSize: 11, color: '#888' }}>Board Confidence</div>
        </div>
        <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: 6, textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 600, color: '#e0e0e0' }}>{mood}</div>
          <div style={{ fontSize: 11, color: '#888' }}>Board Mood</div>
        </div>
        <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: 6, textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 600, color: safe ? '#4ade80' : '#f87171' }}>{safe ? 'Secure' : 'At Risk'}</div>
          <div style={{ fontSize: 11, color: '#888' }}>Job Security</div>
        </div>
      </div>

      {/* Expectations */}
      <h4 style={{ fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Board Expectations</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
        {board.expectations.map((exp, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, padding: '6px 10px', background: 'rgba(255,255,255,0.02)', borderRadius: 4 }}>
            <span style={{ color: exp.priority === 'critical' ? '#f87171' : exp.priority === 'important' ? '#fbbf24' : '#888', fontSize: 10, textTransform: 'uppercase', width: 60 }}>
              {exp.priority}
            </span>
            <span>{exp.target}</span>
            <span style={{ marginLeft: 'auto' }}>{exp.met ? '✅' : '⬜'}</span>
          </div>
        ))}
      </div>

      {/* Finances */}
      <h4 style={{ fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Club Finances</h4>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
        <FinCard label="Balance" value={`£${(finances.balance / 1_000_000).toFixed(1)}M`} />
        <FinCard label="Transfer Budget" value={`£${(board.transferBudget / 1_000_000).toFixed(1)}M`} />
        <FinCard label="Wage Budget" value={`£${(board.wageBudget / 1_000_000).toFixed(1)}M`} />
        <FinCard label="Sponsorship" value={`${finances.sponsorship.name} (£${(finances.sponsorship.annual / 1_000_000).toFixed(1)}M/yr)`} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
        <FinCard label="Ticket Price" value={`£${finances.ticketPrice}`} />
        <FinCard label="Avg Attendance" value={finances.averageAttendance.toLocaleString()} />
        <FinCard label="Debt" value={`£${(finances.debt / 1_000_000).toFixed(1)}M`} />
      </div>

      {/* Facilities */}
      <h4 style={{ fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Facilities</h4>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        <FacilityBar label="Training Ground" level={board.facilityLevel.training} />
        <FacilityBar label="Youth Academy" level={board.facilityLevel.youth} />
        <FacilityBar label="Stadium" level={board.facilityLevel.stadium} />
      </div>
    </div>
  );
}

function FinCard({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 6 }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: '#e0e0e0' }}>{value}</div>
      <div style={{ fontSize: 10, color: '#888', marginTop: 2 }}>{label}</div>
    </div>
  );
}

function FacilityBar({ label, level }: { label: string; level: number }) {
  return (
    <div style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 6 }}>
      <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>{label}</div>
      <div style={{ display: 'flex', gap: 3 }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} style={{ flex: 1, height: 8, borderRadius: 2, background: i <= level ? '#4ade80' : 'rgba(255,255,255,0.1)' }} />
        ))}
      </div>
      <div style={{ fontSize: 10, color: '#888', marginTop: 3 }}>Level {level}/5</div>
    </div>
  );
}
