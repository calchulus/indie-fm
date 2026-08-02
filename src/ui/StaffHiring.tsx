import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { generateStaffCandidates, StaffCandidate } from '../simulation/systems-2';

const ROLES = ['Coach', 'Scout', 'Physio'];

export function StaffHiring() {
  const { staff, hireSpecificStaff, fireStaff } = useGameStore();
  const [selectedRole, setSelectedRole] = useState('Coach');
  const [candidates, setCandidates] = useState<StaffCandidate[]>([]);

  const search = () => setCandidates(generateStaffCandidates(selectedRole, 5));

  return (
    <div style={{ padding: '12px 16px', overflowY: 'auto', height: '100%' }}>
      <h3 style={{ margin: '0 0 12px', fontSize: 15 }}>👔 Staff Hiring</h3>

      {/* Current staff */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: '#aaa' }}>Current Backroom ({staff.length})</div>
        {staff.length === 0 && <div style={{ fontSize: 12, color: '#666' }}>No staff hired yet.</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {staff.map((s) => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: 6, border: '1px solid rgba(255,255,255,0.06)' }}>
              <div>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{s.name}</span>
                <span style={{ fontSize: 11, color: '#888', marginLeft: 8 }}>{s.role} • Rating {s.reputation} • £{(s.wage / 1000).toFixed(0)}k/wk</span>
              </div>
              <button
                onClick={() => fireStaff(s.id)}
                aria-label={`Release ${s.name}`}
                style={{ padding: '3px 8px', fontSize: 11, background: 'rgba(248,113,113,0.15)', border: 'none', borderRadius: 4, color: '#f87171', cursor: 'pointer' }}
              >
                Release
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Search candidates */}
      <div style={{ marginBottom: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          aria-label="Staff role filter"
          style={{ padding: '6px 10px', fontSize: 12, borderRadius: 4, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.3)', color: '#e0e0e0' }}
        >
          {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <button
          onClick={search}
          aria-label="Search for staff candidates"
          style={{ padding: '6px 14px', fontSize: 12, background: 'rgba(96,165,250,0.2)', border: 'none', borderRadius: 6, color: '#60a5fa', cursor: 'pointer' }}
        >
          Search Candidates
        </button>
      </div>

      {/* Candidate list */}
      {candidates.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {candidates.map((c) => (
            <div key={c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: 6, border: '1px solid rgba(255,255,255,0.06)' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{c.name}</div>
                <div style={{ fontSize: 11, color: '#888' }}>{c.role} • {c.specialty} • Rating {c.rating} • £{(c.wage / 1000).toFixed(0)}k/wk</div>
              </div>
              <button
                onClick={() => { hireSpecificStaff(c); setCandidates((prev) => prev.filter((x) => x.id !== c.id)); }}
                aria-label={`Hire ${c.name} as ${c.role}`}
                style={{ padding: '4px 12px', fontSize: 12, background: 'rgba(74,222,128,0.2)', border: 'none', borderRadius: 4, color: '#4ade80', cursor: 'pointer' }}
              >
                Hire
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
