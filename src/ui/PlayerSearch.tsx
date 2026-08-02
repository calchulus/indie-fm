import { useState, useMemo } from 'react';
import { useGameStore } from '../store/gameStore';
import { Player, Position } from '../types';

interface SearchResult extends Player {
  teamName: string;
  teamId: string;
}

export function PlayerSearch() {
  const { league } = useGameStore();
  const [query, setQuery] = useState('');
  const [posFilter, setPosFilter] = useState<string>('all');
  const [minOvr, setMinOvr] = useState(0);
  const [maxAge, setMaxAge] = useState(40);
  const [sortBy, setSortBy] = useState<'overall' | 'age' | 'value' | 'name'>('overall');

  const allPlayers: SearchResult[] = useMemo(() => {
    if (!league) return [];
    return league.teams.flatMap((t) =>
      t.players.map((p) => ({ ...p, teamName: t.name, teamId: t.id }))
    );
  }, [league]);

  const results = useMemo(() => {
    let filtered = allPlayers;

    if (query.trim()) {
      const q = query.toLowerCase();
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        p.nationality.toLowerCase().includes(q) ||
        p.teamName.toLowerCase().includes(q)
      );
    }
    if (posFilter !== 'all') {
      filtered = filtered.filter((p) => p.position === posFilter);
    }
    if (minOvr > 0) {
      filtered = filtered.filter((p) => p.overall >= minOvr);
    }
    if (maxAge < 40) {
      filtered = filtered.filter((p) => p.age <= maxAge);
    }

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'overall': return b.overall - a.overall;
        case 'age': return a.age - b.age;
        case 'value': return b.value - a.value;
        case 'name': return a.name.localeCompare(b.name);
      }
    }).slice(0, 50);
  }, [allPlayers, query, posFilter, minOvr, maxAge, sortBy]);

  const positions: Array<'all' | Position> = ['all', 'GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'ST'];

  const inputStyle: React.CSSProperties = {
    padding: '6px 10px', background: '#2a2a3e', color: '#e0e0e0',
    border: '1px solid rgba(255,255,255,0.15)', borderRadius: 4, fontSize: 12,
  };

  return (
    <div style={{ padding: '12px 16px', overflowY: 'auto', height: '100%' }}>
      <h3 style={{ margin: '0 0 12px', fontSize: 15 }}>🔍 Player Search</h3>

      {/* Search bar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <input
          style={{ ...inputStyle, flex: 1, minWidth: 200 }}
          placeholder="Search by name, nationality, or club..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select style={inputStyle} value={posFilter} onChange={(e) => setPosFilter(e.target.value)}>
          {positions.map((p) => <option key={p} value={p}>{p === 'all' ? 'All Pos' : p}</option>)}
        </select>
        <select style={inputStyle} value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)}>
          <option value="overall">Sort: OVR</option>
          <option value="age">Sort: Age</option>
          <option value="value">Sort: Value</option>
          <option value="name">Sort: Name</option>
        </select>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 12, fontSize: 12, color: '#888' }}>
        <label>
          Min OVR: <input type="range" min={0} max={20} value={minOvr} onChange={(e) => setMinOvr(Number(e.target.value))} style={{ width: 80, verticalAlign: 'middle' }} /> {minOvr}
        </label>
        <label>
          Max Age: <input type="range" min={16} max={40} value={maxAge} onChange={(e) => setMaxAge(Number(e.target.value))} style={{ width: 80, verticalAlign: 'middle' }} /> {maxAge}
        </label>
        <span style={{ alignSelf: 'center' }}>{results.length} results</span>
      </div>

      {/* Results */}
      <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ color: '#888', textAlign: 'left' }}>
            <th style={{ padding: '4px 8px' }}>Name</th>
            <th style={{ padding: '4px 8px' }}>Pos</th>
            <th style={{ padding: '4px 8px' }}>Age</th>
            <th style={{ padding: '4px 8px' }}>OVR</th>
            <th style={{ padding: '4px 8px' }}>PA</th>
            <th style={{ padding: '4px 8px' }}>Club</th>
            <th style={{ padding: '4px 8px' }}>Value</th>
            <th style={{ padding: '4px 8px' }}>Nat</th>
          </tr>
        </thead>
        <tbody>
          {results.map((p) => (
            <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <td style={{ padding: '3px 8px', fontWeight: 500 }}>{p.name}</td>
              <td style={{ padding: '3px 8px', color: '#60a5fa' }}>{p.position}</td>
              <td style={{ padding: '3px 8px', color: '#888' }}>{p.age}</td>
              <td style={{ padding: '3px 8px', fontWeight: 600, color: p.overall >= 70 ? '#4ade80' : p.overall >= 50 ? '#fbbf24' : '#f87171' }}>{p.overall}</td>
              <td style={{ padding: '3px 8px', color: '#a78bfa' }}>{Math.round(p.potentialAbility / 10)}</td>
              <td style={{ padding: '3px 8px', color: '#888' }}>{p.teamName}</td>
              <td style={{ padding: '3px 8px' }}>£{(p.value / 1_000_000).toFixed(1)}M</td>
              <td style={{ padding: '3px 8px', color: '#888' }}>{p.nationality}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {results.length === 0 && <div style={{ color: '#666', fontSize: 13, padding: 20, textAlign: 'center' }}>No players match your search criteria.</div>}
    </div>
  );
}
