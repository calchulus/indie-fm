import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { computeFanSatisfaction } from '../simulation/features-2';
import { computeFinancialSummary } from '../simulation/progression';

// --- Fan Satisfaction Panel ---
export function FanSatisfactionPanel() {
  const { league, userTeamId, lastRoundResults } = useGameStore();
  if (!league || !userTeamId) return null;

  const sorted = [...league.standings].sort((a, b) => b.points - a.points);
  const position = sorted.findIndex((s) => s.teamId === userTeamId) + 1;
  const recentForm = lastRoundResults.slice(0, 5).map((r) => {
    const isHome = r.homeTeamId === userTeamId;
    const gf = isHome ? r.homeGoals : r.awayGoals;
    const ga = isHome ? r.awayGoals : r.homeGoals;
    return gf > ga ? 'W' as const : gf === ga ? 'D' as const : 'L' as const;
  });

  const fanSat = computeFanSatisfaction(recentForm, position, league.teams.length, 0, 50, 0);
  const barColor = fanSat.overall >= 60 ? '#4ade80' : fanSat.overall >= 40 ? '#facc15' : '#f87171';

  return (
    <div style={{ padding: '12px 16px', overflowY: 'auto', height: '100%' }}>
      <h3 style={{ margin: '0 0 12px', fontSize: 15 }}>📣 Fan Satisfaction</h3>
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
          <span>Overall: <strong style={{ color: barColor }}>{fanSat.label}</strong></span>
          <span>{fanSat.overall}/100</span>
        </div>
        <div style={{ height: 8, background: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ width: `${fanSat.overall}%`, height: '100%', background: barColor, borderRadius: 4, transition: 'width 0.3s' }} />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12 }}>
        <div style={{ padding: 8, background: 'rgba(255,255,255,0.03)', borderRadius: 6 }}>
          <div style={{ color: '#888' }}>Results</div>
          <div style={{ fontWeight: 600 }}>{fanSat.results}/100</div>
          <div style={{ color: '#666', marginTop: 2 }}>{recentForm.join(' ')}</div>
        </div>
        <div style={{ padding: 8, background: 'rgba(255,255,255,0.03)', borderRadius: 6 }}>
          <div style={{ color: '#888' }}>Position</div>
          <div style={{ fontWeight: 600 }}>{position}th / {league.teams.length}</div>
        </div>
        <div style={{ padding: 8, background: 'rgba(255,255,255,0.03)', borderRadius: 6 }}>
          <div style={{ color: '#888' }}>Playing Style</div>
          <div style={{ fontWeight: 600 }}>{fanSat.playingStyle}/100</div>
        </div>
        <div style={{ padding: 8, background: 'rgba(255,255,255,0.03)', borderRadius: 6 }}>
          <div style={{ color: '#888' }}>Youth</div>
          <div style={{ fontWeight: 600 }}>{fanSat.youthDevelopment}/100</div>
        </div>
      </div>
    </div>
  );
}

// --- Financial P&L Dashboard ---
export function FinancialDashboard() {
  const { finances } = useGameStore();
  if (!finances) return <div style={{ padding: 16, color: '#888' }}>No financial data.</div>;

  const records = (finances as any).history ?? [];
  const summary = records.length > 0
    ? computeFinancialSummary(records)
    : { totalIncome: finances.balance > 0 ? finances.balance : 0, totalExpenses: 0, balance: finances.balance, wageToTurnover: 0, topExpense: 'Wages', rounds: 0 };

  return (
    <div style={{ padding: '12px 16px', overflowY: 'auto', height: '100%' }}>
      <h3 style={{ margin: '0 0 12px', fontSize: 15 }}>💷 Financial Dashboard</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
        <div style={{ padding: 10, background: 'rgba(74,222,128,0.08)', borderRadius: 8, textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: '#888' }}>Balance</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: summary.balance >= 0 ? '#4ade80' : '#f87171' }}>
            £{(summary.balance / 1_000_000).toFixed(1)}M
          </div>
        </div>
        <div style={{ padding: 10, background: 'rgba(255,255,255,0.03)', borderRadius: 8, textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: '#888' }}>Wage/Turnover</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: summary.wageToTurnover > 70 ? '#f87171' : '#e0e0e0' }}>
            {summary.wageToTurnover}%
          </div>
        </div>
        <div style={{ padding: 10, background: 'rgba(255,255,255,0.03)', borderRadius: 8, textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: '#888' }}>Top Expense</div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>{summary.topExpense}</div>
        </div>
      </div>
      <div style={{ fontSize: 12, color: '#888' }}>
        {summary.rounds > 0
          ? `Based on ${summary.rounds} rounds of financial records.`
          : 'Financial history will accumulate as the season progresses.'}
      </div>
    </div>
  );
}

// --- Match Commentary Feed ---
type CommentaryFilter = 'goals' | 'key' | 'all';

const KEY_EVENTS = new Set(['goal', 'save', 'yellow_card', 'red_card', 'penalty', 'corner', 'free_kick']);
const GOAL_EVENTS = new Set(['goal']);

export function CommentaryFeed() {
  const { matchState, matchHome, matchAway } = useGameStore();
  const [filter, setFilter] = useState<CommentaryFilter>('key');

  if (!matchState || !matchHome || !matchAway) return <div style={{ padding: 16, color: '#888' }}>No match in progress.</div>;

  const allEvents = [...matchState.events].reverse();
  const events = allEvents.filter((evt) => {
    if (filter === 'goals') return GOAL_EVENTS.has(evt.type);
    if (filter === 'key') return KEY_EVENTS.has(evt.type);
    return true;
  }).slice(0, filter === 'all' ? 50 : 30);

  const teamName = (id: string) => id === matchHome.id ? matchHome.shortName : matchAway.shortName;

  const filterBtn = (f: CommentaryFilter): React.CSSProperties => ({
    padding: '3px 10px', fontSize: 11, borderRadius: 4, cursor: 'pointer',
    background: filter === f ? 'rgba(96,165,250,0.25)' : 'rgba(255,255,255,0.05)',
    border: filter === f ? '1px solid #60a5fa' : '1px solid rgba(255,255,255,0.1)',
    color: filter === f ? '#93c5fd' : '#888',
  });

  const eventColor = (type: string): string => {
    if (type === 'goal') return '#4ade80';
    if (type === 'yellow_card') return '#facc15';
    if (type === 'red_card') return '#f87171';
    if (type === 'save') return '#60a5fa';
    if (type === 'corner' || type === 'free_kick') return '#c084fc';
    return '#aaa';
  };

  return (
    <div style={{ padding: '8px 12px', overflowY: 'auto', height: '100%', fontSize: 12, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <h4 style={{ margin: 0, fontSize: 13 }}>🎙️ Commentary</h4>
        <div style={{ display: 'flex', gap: 4 }}>
          <button style={filterBtn('goals')} onClick={() => setFilter('goals')}>⚽ Goals</button>
          <button style={filterBtn('key')} onClick={() => setFilter('key')}>⭐ Key</button>
          <button style={filterBtn('all')} onClick={() => setFilter('all')}>📋 All</button>
        </div>
      </div>

      {events.length === 0 && (
        <div style={{ color: '#666', textAlign: 'center', padding: 20 }}>
          {filter === 'goals' ? 'No goals yet.' : filter === 'key' ? 'No key events yet.' : 'No events yet.'}
        </div>
      )}

      <div style={{ flex: 1, overflow: 'auto' }}>
        {events.map((evt) => (
          <div key={evt.id} style={{ padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', color: eventColor(evt.type), display: 'flex', gap: 6 }}>
            <span style={{ color: '#555', minWidth: 28, flexShrink: 0 }}>{evt.minute}'</span>
            <span style={{ color: '#60a5fa', minWidth: 36, flexShrink: 0 }}>[{teamName(evt.teamId)}]</span>
            <span style={{ flex: 1 }}>{evt.description}</span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 6, fontSize: 10, color: '#555', textAlign: 'center' }}>
        {filter === 'goals' ? `${events.length} goal(s)` : filter === 'key' ? `${events.length} key event(s)` : `${events.length} event(s)`} — {matchState.minute}'
      </div>
    </div>
  );
}

// --- Settings Panel ---
export function SettingsPanel() {
  const [textSize, setTextSize] = useState(13);
  const [highContrast, setHighContrast] = useState(false);

  return (
    <div style={{ padding: '12px 16px', overflowY: 'auto', height: '100%' }}>
      <h3 style={{ margin: '0 0 12px', fontSize: 15 }}>⚙️ Settings</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={{ fontSize: 12, color: '#aaa', display: 'block', marginBottom: 4 }}>Text Size: {textSize}px</label>
          <input type="range" min={11} max={18} value={textSize} onChange={(e) => setTextSize(Number(e.target.value))} style={{ width: 200 }} aria-label="Text size" />
        </div>
        <div>
          <label style={{ fontSize: 12, color: '#aaa', display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" checked={highContrast} onChange={(e) => setHighContrast(e.target.checked)} aria-label="High contrast mode" />
            High Contrast Mode (colorblind friendly)
          </label>
        </div>
        <div style={{ fontSize: 12, color: '#666', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 12 }}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Keyboard Shortcuts</div>
          <div>Space — Pause/Play match</div>
          <div>1-4 — Simulation speed</div>
          <div>M — Jump to Match</div>
          <div>T — Jump to Tactics</div>
          <div>S — Jump to Squad</div>
          <div>← → — Cycle tabs</div>
          <div>? — Show all shortcuts</div>
          <div style={{ marginTop: 8 }}>Swipe left/right on mobile to change tabs.</div>
        </div>
      </div>
    </div>
  );
}
