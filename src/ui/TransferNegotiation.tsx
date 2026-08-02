import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { NegotiationState, startNegotiation, submitBid, respondToCounter, negotiateWage, getNegotiationSummary } from '../simulation/negotiation';

export function TransferNegotiation() {
  const { league, userTeamId } = useGameStore();
  const [neg, setNeg] = useState<NegotiationState | null>(null);
  const [bidAmount, setBidAmount] = useState(0);
  const [wageAmount, setWageAmount] = useState(0);

  if (!league || !userTeamId) return null;
  const userTeam = league.teams.find((t) => t.id === userTeamId);
  if (!userTeam) return null;

  const availablePlayers = league.teams
    .filter((t) => t.id !== userTeamId)
    .flatMap((t) => t.players.slice(0, 16).map((p) => ({ ...p, clubName: t.name, clubId: t.id })))
    .sort((a, b) => b.overall - a.overall)
    .slice(0, 40);

  const startNegotiationWith = (playerId: string) => {
    const player = availablePlayers.find((p) => p.id === playerId);
    if (!player) return;
    const fromClub = league.teams.find((t) => t.id === player.clubId)!;
    const negotiation = startNegotiation(player, fromClub);
    setNeg(negotiation);
    setBidAmount(Math.round(negotiation.clubAsking * 0.8));
    setWageAmount(Math.round(negotiation.wageDemanded * 0.9));
  };

  const handleBid = () => {
    if (!neg) return;
    if (neg.stage === 'counter_received') {
      setNeg(respondToCounter(neg, bidAmount));
    } else {
      setNeg(submitBid(neg, bidAmount));
    }
  };

  const handleWage = () => {
    if (!neg) return;
    const result = negotiateWage(neg, wageAmount);
    setNeg(result);
    if (result.stage === 'signed') {
      // Execute the transfer in the store
      const fromClub = league.teams.find((t) => t.id === neg.fromClubId);
      if (fromClub) {
        const player = fromClub.players.find((p) => p.id === neg.playerId);
        if (player) {
          const updatedTeams = league.teams.map((t) => {
            if (t.id === neg.fromClubId) return { ...t, players: t.players.filter((p) => p.id !== neg.playerId), budget: t.budget + neg.userBid };
            if (t.id === userTeamId) return { ...t, players: [...t.players, { ...player, wage: result.wageOffered, contractExpiry: 2026 + neg.contractYears }], budget: t.budget - neg.userBid };
            return t;
          });
          useGameStore.setState({ league: { ...league, teams: updatedTeams } });
          useGameStore.getState().addToast(`✅ ${neg.playerName} signed for £${(neg.userBid / 1_000_000).toFixed(1)}M!`, 'success');
        }
      }
    }
  };

  const btnStyle: React.CSSProperties = {
    padding: '6px 14px', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 4,
    background: 'rgba(74,222,128,0.2)', color: '#e0e0e0', cursor: 'pointer', fontSize: 12,
  };

  return (
    <div style={{ padding: '12px 16px', overflowY: 'auto', height: '100%' }}>
      <h3 style={{ margin: '0 0 12px', fontSize: 15 }}>💰 Transfer Negotiation</h3>

      {!neg && (
        <>
          <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>Budget: £{(userTeam.budget / 1_000_000).toFixed(1)}M • Select a player to begin negotiations</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {availablePlayers.map((p) => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: 4, cursor: 'pointer' }} onClick={() => startNegotiationWith(p.id)}>
                <span style={{ fontSize: 11, color: '#60a5fa', width: 28 }}>{p.position}</span>
                <span style={{ fontSize: 12, flex: 1 }}>{p.name}</span>
                <span style={{ fontSize: 11, color: '#888' }}>{p.clubName}</span>
                <span style={{ fontSize: 11, fontWeight: 600 }}>OVR {p.overall}</span>
                <span style={{ fontSize: 11, color: '#4ade80' }}>£{(p.value / 1_000_000).toFixed(1)}M</span>
              </div>
            ))}
          </div>
        </>
      )}

      {neg && (
        <div style={{ maxWidth: 500 }}>
          <div style={{ padding: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, marginBottom: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{neg.playerName}</div>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>{neg.position} • {neg.playerAge}y • OVR {neg.overall} • From {neg.fromClubName}</div>
            <div style={{ fontSize: 13, color: '#fbbf24', marginBottom: 8 }}>{getNegotiationSummary(neg)}</div>
            <div style={{ fontSize: 11, color: '#888' }}>Round {neg.rounds} of negotiations</div>
          </div>

          {(neg.stage === 'initial' || neg.stage === 'bid_sent' || neg.stage === 'counter_received') && (
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 11, color: '#888', display: 'block', marginBottom: 4 }}>
                Your bid: £{(bidAmount / 1_000_000).toFixed(1)}M (Asking: £{(neg.clubAsking / 1_000_000).toFixed(1)}M)
              </label>
              <input type="range" min={Math.round(neg.clubAsking * 0.5)} max={Math.round(neg.clubAsking * 1.3)} step={100000} value={bidAmount} onChange={(e) => setBidAmount(Number(e.target.value))} style={{ width: '100%', accentColor: '#4ade80' }} />
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button style={btnStyle} onClick={handleBid}>{neg.stage === 'counter_received' ? 'Respond to Counter' : 'Submit Bid'}</button>
                <button style={{ ...btnStyle, background: 'rgba(255,255,255,0.08)' }} onClick={() => setNeg(null)}>Walk Away</button>
              </div>
            </div>
          )}

          {neg.stage === 'accepted' && (
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 11, color: '#888', display: 'block', marginBottom: 4 }}>
                Wage offer: £{(wageAmount / 1000).toFixed(0)}k/w (Player wants: £{(neg.wageDemanded / 1000).toFixed(0)}k/w)
              </label>
              <input type="range" min={Math.round(neg.wageDemanded * 0.6)} max={Math.round(neg.wageDemanded * 1.3)} step={500} value={wageAmount} onChange={(e) => setWageAmount(Number(e.target.value))} style={{ width: '100%', accentColor: '#60a5fa' }} />
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button style={btnStyle} onClick={handleWage}>Offer Contract</button>
                <button style={{ ...btnStyle, background: 'rgba(255,255,255,0.08)' }} onClick={() => setNeg(null)}>Cancel</button>
              </div>
            </div>
          )}

          {(neg.stage === 'signed' || neg.stage === 'rejected') && (
            <div style={{ textAlign: 'center', padding: 16 }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>{neg.stage === 'signed' ? '🎉' : '❌'}</div>
              <button style={btnStyle} onClick={() => setNeg(null)}>Back to Market</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
