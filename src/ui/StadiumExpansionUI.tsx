import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { proposeStadiumExpansion, StadiumExpansion } from '../simulation/systems-2';

export function StadiumExpansionUI() {
  const { league, userTeamId } = useGameStore();
  const [proposal, setProposal] = useState<StadiumExpansion | null>(null);
  const [approved, setApproved] = useState(false);

  if (!league || !userTeamId) return null;
  const team = league.teams.find((t) => t.id === userTeamId);
  if (!team) return null;

  const generateProposal = () => {
    setProposal(proposeStadiumExpansion(team.capacity));
    setApproved(false);
  };

  const approve = () => {
    setApproved(true);
    // In a full implementation, this would deduct cost and start construction
  };

  return (
    <div style={{ padding: '12px 16px', overflowY: 'auto', height: '100%' }}>
      <h3 style={{ margin: '0 0 12px', fontSize: 15 }}>🏟️ Stadium Expansion</h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 16 }}>
        <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
          <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Current Capacity</div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{team.capacity.toLocaleString()}</div>
        </div>
        <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
          <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Stadium</div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{team.stadium}</div>
        </div>
      </div>

      {!proposal && (
        <button onClick={generateProposal} style={{ padding: '8px 16px', background: 'rgba(96,165,250,0.2)', border: 'none', borderRadius: 6, color: '#60a5fa', cursor: 'pointer', fontSize: 13 }}>
          Propose Expansion
        </button>
      )}

      {proposal && (
        <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Expansion Proposal</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 12 }}>
            <div style={{ fontSize: 12 }}>
              <span style={{ color: '#888' }}>New capacity: </span>
              <span style={{ fontWeight: 600 }}>{proposal.proposedCapacity.toLocaleString()}</span>
            </div>
            <div style={{ fontSize: 12 }}>
              <span style={{ color: '#888' }}>Cost: </span>
              <span style={{ fontWeight: 600 }}>£{(proposal.cost / 1_000_000).toFixed(1)}M</span>
            </div>
            <div style={{ fontSize: 12 }}>
              <span style={{ color: '#888' }}>Construction: </span>
              <span style={{ fontWeight: 600 }}>{proposal.constructionTime} rounds</span>
            </div>
            <div style={{ fontSize: 12 }}>
              <span style={{ color: '#888' }}>Revenue increase: </span>
              <span style={{ fontWeight: 600, color: '#4ade80' }}>£{(proposal.revenueIncrease / 1_000_000).toFixed(2)}M/match</span>
            </div>
          </div>
          {approved ? (
            <div style={{ fontSize: 12, color: '#4ade80' }}>✅ Expansion approved! Construction begins next round.</div>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={approve} style={{ padding: '6px 12px', background: 'rgba(74,222,128,0.2)', border: 'none', borderRadius: 4, color: '#4ade80', cursor: 'pointer', fontSize: 12 }}>
                Approve (£{(proposal.cost / 1_000_000).toFixed(1)}M)
              </button>
              <button onClick={() => setProposal(null)} style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 4, color: '#888', cursor: 'pointer', fontSize: 12 }}>
                Cancel
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
