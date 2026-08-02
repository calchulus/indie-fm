import { useGameStore } from '../store/gameStore';

export function FinancialReport() {
  const { league, userTeamId, finances, board } = useGameStore();

  if (!league || !userTeamId || !finances || !board) return null;
  const userTeam = league.teams.find((t) => t.id === userTeamId);
  if (!userTeam) return null;

  const wageBill = userTeam.players.reduce((s, p) => s + p.wage, 0);
  const matchdayRevenue = finances.averageAttendance * finances.ticketPrice;
  const broadcastRevenue = Math.round(2_000_000 + userTeam.reputation * 50_000);
  const commercialRevenue = Math.round(finances.sponsorship.annual / 38);
  const totalIncome = matchdayRevenue + broadcastRevenue + commercialRevenue;
  const operationsCost = Math.round(userTeam.capacity * 5);
  const totalExpenditure = wageBill + operationsCost;
  const netPerRound = totalIncome - totalExpenditure;

  return (
    <div style={{ padding: '12px 16px', overflowY: 'auto', height: '100%' }}>
      <h3 style={{ margin: '0 0 16px', fontSize: 15 }}>📈 Financial Report</h3>

      {/* Balance overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
        <div style={{ padding: '12px', background: 'rgba(74,222,128,0.05)', borderRadius: 8, textAlign: 'center', border: '1px solid rgba(74,222,128,0.15)' }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#4ade80' }}>£{(finances.balance / 1_000_000).toFixed(1)}M</div>
          <div style={{ fontSize: 10, color: '#888' }}>Club Balance</div>
        </div>
        <div style={{ padding: '12px', background: 'rgba(96,165,250,0.05)', borderRadius: 8, textAlign: 'center', border: '1px solid rgba(96,165,250,0.15)' }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#60a5fa' }}>£{(board.transferBudget / 1_000_000).toFixed(1)}M</div>
          <div style={{ fontSize: 10, color: '#888' }}>Transfer Budget</div>
        </div>
        <div style={{ padding: '12px', background: netPerRound >= 0 ? 'rgba(74,222,128,0.05)' : 'rgba(248,113,113,0.05)', borderRadius: 8, textAlign: 'center', border: `1px solid ${netPerRound >= 0 ? 'rgba(74,222,128,0.15)' : 'rgba(248,113,113,0.15)'}` }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: netPerRound >= 0 ? '#4ade80' : '#f87171' }}>
            {netPerRound >= 0 ? '+' : ''}£{(netPerRound / 1_000_000).toFixed(2)}M
          </div>
          <div style={{ fontSize: 10, color: '#888' }}>Net Per Round</div>
        </div>
      </div>

      {/* Income breakdown */}
      <h4 style={{ fontSize: 12, color: '#4ade80', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Income (per round)</h4>
      <div style={{ marginBottom: 16 }}>
        <FinanceRow label="Matchday (tickets)" value={matchdayRevenue} total={totalIncome} color="#4ade80" />
        <FinanceRow label="Broadcast" value={broadcastRevenue} total={totalIncome} color="#60a5fa" />
        <FinanceRow label={`Commercial (${finances.sponsorship.name})`} value={commercialRevenue} total={totalIncome} color="#a78bfa" />
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', fontSize: 12, fontWeight: 700, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <span>Total Income</span>
          <span style={{ color: '#4ade80' }}>£{(totalIncome / 1_000_000).toFixed(2)}M</span>
        </div>
      </div>

      {/* Expenditure breakdown */}
      <h4 style={{ fontSize: 12, color: '#f87171', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Expenditure (per round)</h4>
      <div style={{ marginBottom: 16 }}>
        <FinanceRow label={`Wages (${userTeam.players.length} players)`} value={wageBill} total={totalExpenditure} color="#f87171" />
        <FinanceRow label="Operations & maintenance" value={operationsCost} total={totalExpenditure} color="#fb923c" />
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', fontSize: 12, fontWeight: 700, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <span>Total Expenditure</span>
          <span style={{ color: '#f87171' }}>£{(totalExpenditure / 1_000_000).toFixed(2)}M</span>
        </div>
      </div>

      {/* Sponsorship details */}
      <h4 style={{ fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Sponsorship</h4>
      <div style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 6, fontSize: 12, marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontWeight: 600 }}>{finances.sponsorship.name}</span>
          <span style={{ color: '#4ade80' }}>£{(finances.sponsorship.annual / 1_000_000).toFixed(1)}M/year</span>
        </div>
        <div style={{ color: '#888' }}>{finances.sponsorship.yearsLeft} year(s) remaining</div>
      </div>

      {/* Attendance */}
      <h4 style={{ fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Attendance</h4>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        <div style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: 6, textAlign: 'center' }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>{finances.averageAttendance.toLocaleString()}</div>
          <div style={{ fontSize: 10, color: '#888' }}>Avg Attendance</div>
        </div>
        <div style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: 6, textAlign: 'center' }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>{userTeam.capacity.toLocaleString()}</div>
          <div style={{ fontSize: 10, color: '#888' }}>Capacity</div>
        </div>
        <div style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: 6, textAlign: 'center' }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>{Math.round((finances.averageAttendance / userTeam.capacity) * 100)}%</div>
          <div style={{ fontSize: 10, color: '#888' }}>Fill Rate</div>
        </div>
      </div>

      {/* Recent records */}
      {finances.records.length > 0 && (
        <>
          <h4 style={{ fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: 1, margin: '16px 0 8px' }}>Recent Financial Records</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {finances.records.slice(-5).reverse().map((r, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px', fontSize: 11, background: 'rgba(255,255,255,0.02)', borderRadius: 3 }}>
                <span style={{ color: '#888' }}>Round {r.round}</span>
                <span>Income: £{(r.income.matchday + r.income.broadcast + r.income.commercial) / 1_000_000 >= 0 ? '' : ''}{((r.income.matchday + r.income.broadcast + r.income.commercial) / 1_000_000).toFixed(2)}M</span>
                <span>Exp: £{((r.expenditure.wages + r.expenditure.operations) / 1_000_000).toFixed(2)}M</span>
                <span style={{ color: r.balance >= 0 ? '#4ade80' : '#f87171', fontWeight: 600 }}>
                  {r.balance >= 0 ? '+' : ''}£{(r.balance / 1_000_000).toFixed(2)}M
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function FinanceRow({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <div style={{ padding: '4px 8px', fontSize: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
        <span>{label}</span>
        <span style={{ color }}>£{(value / 1_000_000).toFixed(2)}M ({Math.round(pct)}%)</span>
      </div>
      <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 2 }} />
      </div>
    </div>
  );
}
