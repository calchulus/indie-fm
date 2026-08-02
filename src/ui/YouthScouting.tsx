import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { generateYouthProspects, YouthProspect } from '../simulation/systems-3';

const POSITIONS = ['All', 'GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'ST'];

export function YouthScouting() {
  const { signYouthProspect, board } = useGameStore();
  const [prospects, setProspects] = useState<YouthProspect[]>([]);
  const [posFilter, setPosFilter] = useState('All');
  const [minPotential, setMinPotential] = useState(1);

  const academyLevel = board?.facilityLevel?.youth ?? 1;

  const search = () => {
    const count = 4 + academyLevel * 2;
    setProspects(generateYouthProspects(count));
  };

  const filtered = prospects.filter(
    (p) => (posFilter === 'All' || p.position === posFilter) && p.potentialRating >= minPotential,
  );

  const stars = (n: number) => '★'.repeat(n) + '☆'.repeat(5 - n);

  return (
    <div style={{ padding: '12px 16px', overflowY: 'auto', height: '100%' }}>
      <h3 style={{ margin: '0 0 4px', fontSize: 15 }}>🌱 Youth Scouting</h3>
      <div style={{ fontSize: 12, color: '#888', marginBottom: 12 }}>
        Academy Level: {academyLevel} — higher levels yield more and better prospects
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
        <select
          value={posFilter}
          onChange={(e) => setPosFilter(e.target.value)}
          aria-label="Filter by position"
          style={{ padding: '5px 8px', fontSize: 12, borderRadius: 4, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.3)', color: '#e0e0e0' }}
        >
          {POSITIONS.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <select
          value={minPotential}
          onChange={(e) => setMinPotential(Number(e.target.value))}
          aria-label="Minimum potential rating"
          style={{ padding: '5px 8px', fontSize: 12, borderRadius: 4, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.3)', color: '#e0e0e0' }}
        >
          {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>Min {n}★</option>)}
        </select>
        <button
          onClick={search}
          aria-label="Search for youth prospects"
          style={{ padding: '6px 14px', fontSize: 12, background: 'rgba(96,165,250,0.2)', border: 'none', borderRadius: 6, color: '#60a5fa', cursor: 'pointer' }}
        >
          Scout Prospects
        </button>
      </div>

      {/* Prospect list */}
      {filtered.length === 0 && prospects.length > 0 && (
        <div style={{ fontSize: 12, color: '#666' }}>No prospects match filters.</div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {filtered.map((p) => (
          <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: 6, border: '1px solid rgba(255,255,255,0.06)' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{p.name} <span style={{ fontSize: 11, color: '#888' }}>({p.nationality})</span></div>
              <div style={{ fontSize: 11, color: '#888' }}>
                {p.position} • Age {p.age} • <span style={{ color: '#facc15' }}>{stars(p.potentialRating)}</span> • £{(p.cost / 1_000_000).toFixed(1)}M
              </div>
            </div>
            <button
              onClick={() => { signYouthProspect(p); setProspects((prev) => prev.filter((x) => x.id !== p.id)); }}
              aria-label={`Sign ${p.name}`}
              style={{ padding: '4px 12px', fontSize: 12, background: 'rgba(74,222,128,0.2)', border: 'none', borderRadius: 4, color: '#4ade80', cursor: 'pointer' }}
            >
              Sign
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
