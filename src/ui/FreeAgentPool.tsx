import { useState, useMemo } from 'react';
import { useGameStore } from '../store/gameStore';
import { generateFreeAgents } from '../simulation/systems-3';
import { MAX_SQUAD_SIZE } from '../simulation/enforcement';
import { Player } from '../types';

const POSITIONS = ['All', 'GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'ST'];

export function FreeAgentPool() {
  const { league, userTeamId, signSpecificFreeAgent } = useGameStore();
  const [agents, setAgents] = useState<Player[]>([]);
  const [posFilter, setPosFilter] = useState('All');
  const [minOverall, setMinOverall] = useState(40);

  const team = league?.teams.find((t) => t.id === userTeamId);
  const squadSize = team?.players.length ?? 0;
  const atLimit = squadSize >= MAX_SQUAD_SIZE;

  const pool = useMemo(() => agents.filter(
    (p) => (posFilter === 'All' || p.position === posFilter) && p.overall >= minOverall,
  ), [agents, posFilter, minOverall]);

  const search = () => setAgents(generateFreeAgents(15));

  return (
    <div style={{ padding: '12px 16px', overflowY: 'auto', height: '100%' }}>
      <h3 style={{ margin: '0 0 4px', fontSize: 15 }}>🆓 Free Agent Pool</h3>
      <div style={{ fontSize: 12, color: atLimit ? '#f87171' : '#888', marginBottom: 12 }}>
        Squad: {squadSize}/{MAX_SQUAD_SIZE} {atLimit && '— Squad full! Sell players before signing.'}
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
          value={minOverall}
          onChange={(e) => setMinOverall(Number(e.target.value))}
          aria-label="Minimum overall rating"
          style={{ padding: '5px 8px', fontSize: 12, borderRadius: 4, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.3)', color: '#e0e0e0' }}
        >
          {[40, 50, 55, 60, 65, 70].map((n) => <option key={n} value={n}>Min OVR {n}</option>)}
        </select>
        <button
          onClick={search}
          aria-label="Search free agents"
          style={{ padding: '6px 14px', fontSize: 12, background: 'rgba(96,165,250,0.2)', border: 'none', borderRadius: 6, color: '#60a5fa', cursor: 'pointer' }}
        >
          Browse Free Agents
        </button>
      </div>

      {/* Agent list */}
      {pool.length === 0 && agents.length > 0 && (
        <div style={{ fontSize: 12, color: '#666' }}>No agents match filters.</div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {pool.map((p) => (
          <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: 6, border: '1px solid rgba(255,255,255,0.06)' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{p.name} <span style={{ fontSize: 11, color: '#888' }}>({p.nationality})</span></div>
              <div style={{ fontSize: 11, color: '#888' }}>
                {p.position} • Age {p.age} • OVR {p.overall} • Wage: £{(p.wage / 1000).toFixed(0)}k/wk
              </div>
            </div>
            <button
              onClick={() => { signSpecificFreeAgent(p); setAgents((prev) => prev.filter((x) => x.id !== p.id)); }}
              disabled={atLimit}
              aria-label={`Sign ${p.name}`}
              style={{ padding: '4px 12px', fontSize: 12, background: atLimit ? 'rgba(255,255,255,0.05)' : 'rgba(74,222,128,0.2)', border: 'none', borderRadius: 4, color: atLimit ? '#555' : '#4ade80', cursor: atLimit ? 'default' : 'pointer' }}
            >
              Sign
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
