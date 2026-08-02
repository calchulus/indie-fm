import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { generateDefaultBackroom, getRoleLabel, getCoachingQuality, getScoutingQuality, getMedicalQuality, StaffMember } from '../simulation/staff';
import { createTrainingState, getFamiliarityLabel, getTrainingLoadWarning } from '../simulation/training';

export function StaffTraining() {
  const { league, userTeamId } = useGameStore();
  const [staff] = useState<StaffMember[]>(() => generateDefaultBackroom());
  const [training] = useState(() => createTrainingState());
  const [subTab, setSubTab] = useState<'staff' | 'training'>('staff');

  if (!league || !userTeamId) return null;
  const userTeam = league.teams.find((t) => t.id === userTeamId);
  if (!userTeam) return null;

  const atkQ = getCoachingQuality(staff, 'attacking');
  const defQ = getCoachingQuality(staff, 'defending');
  const fitQ = getCoachingQuality(staff, 'fitness');
  const tacQ = getCoachingQuality(staff, 'tactical');
  const techQ = getCoachingQuality(staff, 'technical');
  const scoutQ = getScoutingQuality(staff);
  const medQ = getMedicalQuality(staff);
  const warning = getTrainingLoadWarning(userTeam.players);

  const tabBtn = (active: boolean): React.CSSProperties => ({
    padding: '6px 14px', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 4,
    background: active ? 'rgba(96,165,250,0.3)' : 'rgba(255,255,255,0.08)',
    color: '#e0e0e0', cursor: 'pointer', fontSize: 13,
  });

  return (
    <div style={{ padding: '12px 16px', overflowY: 'auto', height: '100%' }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button style={tabBtn(subTab === 'staff')} onClick={() => setSubTab('staff')}>👔 Staff</button>
        <button style={tabBtn(subTab === 'training')} onClick={() => setSubTab('training')}>🏋️ Training</button>
      </div>

      {subTab === 'staff' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
            <QualityCard label="Attacking" value={atkQ} />
            <QualityCard label="Defending" value={defQ} />
            <QualityCard label="Fitness" value={fitQ} />
            <QualityCard label="Tactical" value={tacQ} />
            <QualityCard label="Technical" value={techQ} />
            <QualityCard label="Scouting" value={scoutQ} />
            <QualityCard label="Medical" value={medQ} />
          </div>

          <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ color: '#888', textAlign: 'left' }}>
                <th style={{ padding: '6px 8px' }}>Role</th>
                <th style={{ padding: '6px 8px' }}>Name</th>
                <th style={{ padding: '6px 8px' }}>Age</th>
                <th style={{ padding: '6px 8px' }}>Wage</th>
                <th style={{ padding: '6px 8px' }}>Key Attr</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((s) => (
                <tr key={s.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '4px 8px', color: '#60a5fa' }}>{getRoleLabel(s.role)}</td>
                  <td style={{ padding: '4px 8px' }}>{s.name}</td>
                  <td style={{ padding: '4px 8px', color: '#888' }}>{s.age}</td>
                  <td style={{ padding: '4px 8px' }}>£{(s.wage / 1000).toFixed(0)}k/w</td>
                  <td style={{ padding: '4px 8px', color: '#4ade80' }}>{getTopAttr(s)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {subTab === 'training' && (
        <>
          {warning && <div style={{ padding: '8px 12px', marginBottom: 12, background: 'rgba(251,191,36,0.1)', borderRadius: 6, fontSize: 13, color: '#fbbf24' }}>{warning}</div>}

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <div>
              <span style={{ fontSize: 11, color: '#888', textTransform: 'uppercase' }}>Tactical Familiarity</span>
              <div style={{ fontSize: 18, fontWeight: 700, color: training.familiarity >= 70 ? '#4ade80' : '#fbbf24' }}>
                {Math.round(training.familiarity)}% — {getFamiliarityLabel(training.familiarity)}
              </div>
            </div>
            <div>
              <span style={{ fontSize: 11, color: '#888', textTransform: 'uppercase' }}>Intensity</span>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{training.intensity}</div>
            </div>
          </div>

          <h4 style={{ fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Weekly Schedule</h4>
          <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ color: '#888', textAlign: 'left' }}>
                <th style={{ padding: '6px 8px' }}>Day</th>
                <th style={{ padding: '6px 8px' }}>Morning</th>
                <th style={{ padding: '6px 8px' }}>Afternoon</th>
              </tr>
            </thead>
            <tbody>
              {training.schedule.map((day) => (
                <tr key={day.day} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '4px 8px', fontWeight: 600 }}>{day.day}</td>
                  <td style={{ padding: '4px 8px', color: day.morning === 'rest' ? '#666' : '#e0e0e0' }}>{day.morning}</td>
                  <td style={{ padding: '4px 8px', color: day.afternoon === 'rest' ? '#666' : '#e0e0e0' }}>{day.afternoon}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

function QualityCard({ label, value }: { label: string; value: number }) {
  const color = value >= 14 ? '#4ade80' : value >= 10 ? '#fbbf24' : '#f87171';
  return (
    <div style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 6, textAlign: 'center' }}>
      <div style={{ fontSize: 16, fontWeight: 700, color }}>{value}/20</div>
      <div style={{ fontSize: 10, color: '#888' }}>{label}</div>
    </div>
  );
}

function getTopAttr(s: StaffMember): string {
  const entries = Object.entries(s.attributes) as Array<[string, number]>;
  const top = entries.sort((a, b) => b[1] - a[1])[0];
  return `${top[0]}: ${top[1]}`;
}
