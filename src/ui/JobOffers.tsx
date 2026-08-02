import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { generateJobOffers, JobOffer } from '../simulation/systems';

export function JobOffers() {
  const { league, userTeamId, seasonNumber } = useGameStore();
  const [offers, setOffers] = useState<JobOffer[] | null>(null);
  const [accepted, setAccepted] = useState<string | null>(null);

  if (!league || !userTeamId) return null;

  const sorted = [...league.standings].sort((a, b) => b.points - a.points);
  const position = sorted.findIndex((s) => s.teamId === userTeamId) + 1;

  const generateOffers = () => {
    const newOffers = generateJobOffers(league, userTeamId, position, seasonNumber);
    setOffers(newOffers);
  };

  const acceptOffer = (offer: JobOffer) => {
    setAccepted(offer.clubId);
    // In a full implementation, this would switch the user's team
  };

  return (
    <div style={{ padding: '12px 16px', overflowY: 'auto', height: '100%' }}>
      <h3 style={{ margin: '0 0 12px', fontSize: 15 }}>💼 Job Offers</h3>

      {!offers && (
        <button onClick={generateOffers} style={{ padding: '8px 16px', background: 'rgba(96,165,250,0.2)', border: 'none', borderRadius: 6, color: '#60a5fa', cursor: 'pointer', fontSize: 13 }}>
          Check for Job Offers
        </button>
      )}

      {offers && offers.length === 0 && (
        <div style={{ fontSize: 13, color: '#888' }}>No clubs are interested at this time. Keep performing well to attract attention.</div>
      )}

      {offers && offers.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {offers.map((offer) => (
            <div key={offer.clubId} style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{offer.clubName}</span>
                <span style={{ fontSize: 11, color: '#888' }}>Reputation: {offer.reputation}</span>
              </div>
              <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>{offer.reason}</div>
              <div style={{ fontSize: 12, marginBottom: 8 }}>Wage offered: £{(offer.wageOffered / 1000).toFixed(0)}k/w</div>
              {accepted === offer.clubId ? (
                <div style={{ fontSize: 12, color: '#4ade80' }}>✅ Offer accepted! (Team switch would happen here)</div>
              ) : (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => acceptOffer(offer)} style={{ padding: '6px 12px', background: 'rgba(74,222,128,0.2)', border: 'none', borderRadius: 4, color: '#4ade80', cursor: 'pointer', fontSize: 12 }}>
                    Accept
                  </button>
                  <button style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 4, color: '#888', cursor: 'pointer', fontSize: 12 }}>
                    Decline
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
