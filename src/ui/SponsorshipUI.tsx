import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { generateSponsorshipOffer, negotiateSponsorship, SponsorshipDeal } from '../simulation/systems-2';

export function SponsorshipUI() {
  const { league, userTeamId } = useGameStore();
  const [currentDeal, setCurrentDeal] = useState<SponsorshipDeal | null>(null);
  const [offer, setOffer] = useState<SponsorshipDeal | null>(null);
  const [negotiated, setNegotiated] = useState(false);

  if (!league || !userTeamId) return null;
  const team = league.teams.find((t) => t.id === userTeamId);
  if (!team) return null;

  const generateOffer = () => {
    const newOffer = generateSponsorshipOffer(team.reputation);
    setOffer(newOffer);
    setNegotiated(false);
  };

  const negotiate = () => {
    if (!offer) return;
    const better = negotiateSponsorship(offer, team.reputation);
    setOffer(better);
    setNegotiated(true);
  };

  const acceptDeal = () => {
    if (!offer) return;
    setCurrentDeal(offer);
    setOffer(null);
  };

  return (
    <div style={{ padding: '12px 16px', overflowY: 'auto', height: '100%' }}>
      <h3 style={{ margin: '0 0 12px', fontSize: 15 }}>🤝 Sponsorship</h3>

      {currentDeal && (
        <div style={{ padding: '12px', background: 'rgba(74,222,128,0.05)', borderRadius: 8, border: '1px solid rgba(74,222,128,0.2)', marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Current Sponsor: {currentDeal.sponsorName}</div>
          <div style={{ fontSize: 12, color: '#888' }}>
            Revenue: £{(currentDeal.annualRevenue / 1_000_000).toFixed(1)}M/year • {currentDeal.yearsRemaining} years remaining • Type: {currentDeal.type}
          </div>
        </div>
      )}

      {!offer && (
        <button onClick={generateOffer} style={{ padding: '8px 16px', background: 'rgba(96,165,250,0.2)', border: 'none', borderRadius: 6, color: '#60a5fa', cursor: 'pointer', fontSize: 13 }}>
          Seek New Sponsorship
        </button>
      )}

      {offer && (
        <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Offer from: {offer.sponsorName}</div>
          <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>
            Revenue: £{(offer.annualRevenue / 1_000_000).toFixed(1)}M/year • {offer.yearsRemaining} years • Type: {offer.type}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {!negotiated && (
              <button onClick={negotiate} style={{ padding: '6px 12px', background: 'rgba(96,165,250,0.2)', border: 'none', borderRadius: 4, color: '#60a5fa', cursor: 'pointer', fontSize: 12 }}>
                Negotiate Better Terms
              </button>
            )}
            <button onClick={acceptDeal} style={{ padding: '6px 12px', background: 'rgba(74,222,128,0.2)', border: 'none', borderRadius: 4, color: '#4ade80', cursor: 'pointer', fontSize: 12 }}>
              Accept Deal
            </button>
            <button onClick={() => setOffer(null)} style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 4, color: '#888', cursor: 'pointer', fontSize: 12 }}>
              Decline
            </button>
          </div>
          {negotiated && <div style={{ fontSize: 11, color: '#4ade80', marginTop: 8 }}>✅ Negotiated improved terms based on club reputation.</div>}
        </div>
      )}
    </div>
  );
}
