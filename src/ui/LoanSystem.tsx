import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { generateLoanOffer, canLoanPlayer, LoanOffer } from '../simulation/systems-2';

interface ActiveLoan extends LoanOffer {
  playerName: string;
  roundsRemaining: number;
  direction: 'in' | 'out';
}

export function LoanSystem() {
  const { league, userTeamId, addToast } = useGameStore();
  const [activeLoans, setActiveLoans] = useState<ActiveLoan[]>([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState('');
  const [duration, setDuration] = useState(15);
  const [wageContribution, setWageContribution] = useState(50);
  const [optionToBuy, setOptionToBuy] = useState(false);

  if (!league || !userTeamId) return null;
  const team = league.teams.find((t) => t.id === userTeamId);
  if (!team) return null;

  const loanablePlayers = team.players.filter((p) => canLoanPlayer(team, p));
  const otherClubs = league.teams.filter((t) => t.id !== userTeamId);

  const offerLoan = () => {
    const player = team.players.find((p) => p.id === selectedPlayerId);
    if (!player) return;
    const destClub = otherClubs[Math.floor(Math.random() * otherClubs.length)];
    const offer = generateLoanOffer(player, team, destClub);
    const loan: ActiveLoan = {
      ...offer,
      duration,
      wageContribution,
      optionToBuy,
      buyPrice: optionToBuy ? Math.round(player.value * 0.8) : undefined,
      playerName: player.name,
      roundsRemaining: duration,
      direction: 'out',
    };
    setActiveLoans((prev) => [...prev, loan]);
    addToast(`📤 ${player.name} loaned to ${destClub.name} for ${duration} rounds.`, 'success');
    setSelectedPlayerId('');
  };

  return (
    <div style={{ padding: '12px 16px', overflowY: 'auto', height: '100%' }}>
      <h3 style={{ margin: '0 0 12px', fontSize: 15 }}>🔄 Loan System</h3>

      {/* Offer loan out */}
      <div style={{ padding: 12, background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Loan Player Out</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 8 }}>
          <select
            value={selectedPlayerId}
            onChange={(e) => setSelectedPlayerId(e.target.value)}
            aria-label="Select player to loan"
            style={{ padding: '5px 8px', fontSize: 12, borderRadius: 4, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.3)', color: '#e0e0e0', minWidth: 140 }}
          >
            <option value="">Select player…</option>
            {loanablePlayers.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.position})</option>)}
          </select>
          <label style={{ fontSize: 11, color: '#aaa', display: 'flex', alignItems: 'center', gap: 4 }}>
            Duration:
            <input
              type="range" min={5} max={30} value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              aria-label="Loan duration in rounds"
              style={{ width: 80 }}
            />
            {duration} rnd
          </label>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8 }}>
          <label style={{ fontSize: 11, color: '#aaa', display: 'flex', alignItems: 'center', gap: 4 }}>
            Wage contribution:
            <input
              type="range" min={0} max={100} value={wageContribution}
              onChange={(e) => setWageContribution(Number(e.target.value))}
              aria-label="Wage contribution percentage"
              style={{ width: 80 }}
            />
            {wageContribution}%
          </label>
          <label style={{ fontSize: 11, color: '#aaa', display: 'flex', alignItems: 'center', gap: 4 }}>
            <input
              type="checkbox" checked={optionToBuy}
              onChange={(e) => setOptionToBuy(e.target.checked)}
              aria-label="Include option to buy"
            />
            Option to buy
          </label>
        </div>
        <button
          onClick={offerLoan}
          disabled={!selectedPlayerId}
          aria-label="Confirm loan offer"
          style={{ padding: '6px 14px', fontSize: 12, background: selectedPlayerId ? 'rgba(96,165,250,0.2)' : 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 6, color: selectedPlayerId ? '#60a5fa' : '#555', cursor: selectedPlayerId ? 'pointer' : 'default' }}
        >
          Send on Loan
        </button>
      </div>

      {/* Active loans */}
      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: '#aaa' }}>Active Loans ({activeLoans.length})</div>
      {activeLoans.length === 0 && <div style={{ fontSize: 12, color: '#666' }}>No active loans.</div>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {activeLoans.map((loan, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: 6, border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: 12 }}>
              <span style={{ fontWeight: 500 }}>{loan.playerName}</span>
              <span style={{ color: '#888', marginLeft: 8 }}>
                {loan.direction === 'out' ? '📤 Out' : '📥 In'} • {loan.roundsRemaining} rnd left • {loan.wageContribution}% wage
                {loan.optionToBuy && ` • Buy: £${((loan.buyPrice ?? 0) / 1_000_000).toFixed(1)}M`}
              </span>
            </div>
            <button
              onClick={() => { setActiveLoans((prev) => prev.filter((_, idx) => idx !== i)); addToast(`🔄 ${loan.playerName} recalled from loan.`, 'info'); }}
              aria-label={`Recall ${loan.playerName} from loan`}
              style={{ padding: '3px 8px', fontSize: 11, background: 'rgba(250,204,21,0.15)', border: 'none', borderRadius: 4, color: '#facc15', cursor: 'pointer' }}
            >
              Recall
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
