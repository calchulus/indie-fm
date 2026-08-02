import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { generateContractOffer, negotiateContract, ContractOffer } from '../simulation/player-systems';
import { Player } from '../types';

export function ContractNegotiation({ player, onClose }: { player: Player; onClose: () => void }) {
  const { league, userTeamId } = useGameStore();
  const [offer, setOffer] = useState<ContractOffer | null>(null);
  const [wageOffer, setWageOffer] = useState(0);
  const [result, setResult] = useState<string | null>(null);

  if (!league || !userTeamId) return null;
  const team = league.teams.find((t) => t.id === userTeamId);
  if (!team) return null;

  const startNegotiation = () => {
    const newOffer = generateContractOffer(player);
    setOffer(newOffer);
    setWageOffer(newOffer.wageOffered);
    setResult(null);
  };

  const submitOffer = () => {
    if (!offer) return;
    const updated = negotiateContract({ ...offer, wageOffered: wageOffer }, player, team.budget);
    setOffer(updated);
    if (updated.status === 'accepted') {
      setResult(`✅ ${player.name} accepted! Wage: £${(wageOffer / 1000).toFixed(0)}k/w for ${offer.lengthYears} years.`);
    } else if (updated.status === 'countered') {
      setResult(`🔄 ${player.name} countered: wants £${((updated.counterWage ?? wageOffer) / 1000).toFixed(0)}k/w.`);
    } else {
      setResult(`❌ ${player.name} rejected the offer.`);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: '#1e1e2e', borderRadius: 12, padding: '24px', width: 400, border: '1px solid rgba(255,255,255,0.1)' }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 16 }}>📝 Contract Negotiation</h3>
        <div style={{ fontSize: 14, marginBottom: 8 }}>{player.name} ({player.position}, OVR {player.overall})</div>
        <div style={{ fontSize: 12, color: '#888', marginBottom: 16 }}>Current wage: £{(player.wage / 1000).toFixed(0)}k/w • Contract expires: {player.contractExpiry}</div>

        {!offer && (
          <button onClick={startNegotiation} style={{ padding: '8px 16px', background: 'rgba(74,222,128,0.2)', border: 'none', borderRadius: 6, color: '#4ade80', cursor: 'pointer', fontSize: 13 }}>
            Start Negotiation
          </button>
        )}

        {offer && !result && (
          <div>
            <label style={{ fontSize: 12, color: '#888', display: 'block', marginBottom: 4 }}>
              Wage offer: £{(wageOffer / 1000).toFixed(0)}k/w (Player wants: £{(offer.wageOffered / 1000).toFixed(0)}k/w)
            </label>
            <input
              type="range"
              min={player.wage}
              max={offer.wageOffered * 1.5}
              step={500}
              value={wageOffer}
              onChange={(e) => setWageOffer(Number(e.target.value))}
              style={{ width: '100%', marginBottom: 12 }}
            />
            <div style={{ fontSize: 12, color: '#888', marginBottom: 12 }}>
              Length: {offer.lengthYears} years • Release clause: £{(offer.releaseClause / 1_000_000).toFixed(1)}M
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={submitOffer} style={{ padding: '8px 16px', background: 'rgba(74,222,128,0.2)', border: 'none', borderRadius: 6, color: '#4ade80', cursor: 'pointer', fontSize: 13 }}>
                Submit Offer
              </button>
              <button onClick={onClose} style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 6, color: '#888', cursor: 'pointer', fontSize: 13 }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {result && (
          <div>
            <div style={{ fontSize: 13, marginBottom: 12 }}>{result}</div>
            <button onClick={onClose} style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 6, color: '#e0e0e0', cursor: 'pointer', fontSize: 13 }}>
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
