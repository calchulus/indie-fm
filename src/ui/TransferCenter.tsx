import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { getTransferMarket, evaluateBid, executeTransfer, executeLoan, generateYouthIntake } from '../simulation/transfers';
import { TransferListing } from '../simulation/transfers';
import { validateChallengeAction } from '../simulation/challenges';
import { VirtualList } from './VirtualList';

export function TransferCenter() {
  const { league, userTeamId } = useGameStore();
  const [filter, setFilter] = useState<string>('all');
  const [message, setMessage] = useState<string | null>(null);

  if (!league || !userTeamId) return null;
  const userTeam = league.teams.find((t) => t.id === userTeamId);
  if (!userTeam) return null;

  const market = getTransferMarket(league.teams, userTeamId);
  const filtered = filter === 'all' ? market : market.filter((l) => l.player.position === filter);

  const teamName = (id: string) => league.teams.find((t) => t.id === id)?.name ?? '?';

  const handleBid = (listing: TransferListing) => {
    const fromTeam = league.teams.find((t) => t.id === listing.fromTeamId);
    if (!fromTeam) return;

    // Challenge constraint validation
    const constraintCheck = validateChallengeAction(
      { noSignings: false, youthOnly: false },
      'transfer',
      { playerAge: listing.player.age, budget: listing.askingPrice },
    );
    if (!constraintCheck.allowed) {
      setMessage(`❌ ${constraintCheck.reason}`);
      return;
    }

    const bidAmount = listing.type === 'free' ? 0 : listing.askingPrice;

    if (bidAmount > userTeam.budget) {
      setMessage(`❌ Insufficient budget for ${listing.player.name} (£${(bidAmount / 1_000_000).toFixed(1)}M needed)`);
      return;
    }

    const accepted = listing.type === 'free' || evaluateBid(
      { playerId: listing.player.id, fromTeamId: listing.fromTeamId, toTeamId: userTeamId, amount: bidAmount, type: 'transfer', status: 'pending' },
      fromTeam,
    );

    if (accepted) {
      const { fromTeam: updatedFrom, toTeam: updatedTo } = listing.type === 'loan'
        ? executeLoan(listing.player, fromTeam, userTeam)
        : executeTransfer(listing.player, fromTeam, userTeam, bidAmount);

      const updatedTeams = league.teams.map((t) => {
        if (t.id === updatedFrom.id) return updatedFrom;
        if (t.id === updatedTo.id) return updatedTo;
        return t;
      });

      useGameStore.setState({ league: { ...league, teams: updatedTeams } });
      setMessage(`✅ ${listing.player.name} joined ${userTeam.name}! ${listing.type === 'free' ? '(Free)' : `Fee: £${(bidAmount / 1_000_000).toFixed(1)}M`}`);
    } else {
      setMessage(`❌ ${teamName(listing.fromTeamId)} rejected the bid for ${listing.player.name}`);
    }
  };

  const handleYouthIntake = () => {
    const youth = generateYouthIntake(userTeam, 3);
    const updatedTeams = league.teams.map((t) =>
      t.id === userTeamId ? { ...t, players: [...t.players, ...youth] } : t
    );
    useGameStore.setState({ league: { ...league, teams: updatedTeams } });
    setMessage(`🎓 Youth intake: ${youth.map((p) => `${p.name} (${p.position}, ${p.overall})`).join(', ')}`);
  };

  const positions = ['all', 'GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'ST'];

  const btnStyle: React.CSSProperties = {
    padding: '4px 10px',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: 4,
    background: 'rgba(255,255,255,0.08)',
    color: '#e0e0e0',
    cursor: 'pointer',
    fontSize: 12,
  };

  return (
    <div style={{ padding: '12px 16px', overflowY: 'auto', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
        <h3 style={{ margin: 0, fontSize: 15 }}>Transfer Centre</h3>
        <span style={{ fontSize: 13, color: '#4ade80' }}>Budget: £{(userTeam.budget / 1_000_000).toFixed(1)}M</span>
        <button style={{ ...btnStyle, background: 'rgba(74,222,128,0.2)' }} onClick={handleYouthIntake}>
          🎓 Youth Intake
        </button>
      </div>

      {message && (
        <div style={{
          padding: '8px 12px',
          marginBottom: 12,
          background: 'rgba(255,255,255,0.05)',
          borderRadius: 6,
          fontSize: 13,
        }}>
          {message}
        </div>
      )}

      <div style={{ display: 'flex', gap: 4, marginBottom: 12, flexWrap: 'wrap' }}>
        {positions.map((pos) => (
          <button
            key={pos}
            style={{ ...btnStyle, background: filter === pos ? 'rgba(96,165,250,0.3)' : undefined }}
            onClick={() => setFilter(pos)}
          >
            {pos === 'all' ? 'All' : pos}
          </button>
        ))}
      </div>

      <div style={{ fontSize: 11, color: '#888', marginBottom: 4, display: 'flex', gap: 8 }}>
        <span style={{ flex: 2 }}>Name</span><span style={{ width: 30 }}>Pos</span><span style={{ width: 25 }}>Age</span><span style={{ width: 30 }}>OVR</span><span style={{ flex: 1 }}>Club</span><span style={{ width: 50 }}>Price</span><span style={{ width: 40 }}></span>
      </div>
      <VirtualList
        items={filtered}
        itemHeight={32}
        height={400}
        renderItem={(item) => {
          const listing = item as TransferListing;
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: 12 }}>
              <span style={{ flex: 2 }}>{listing.player.name}</span>
              <span style={{ width: 30, color: '#60a5fa' }}>{listing.player.position}</span>
              <span style={{ width: 25, color: '#888' }}>{listing.player.age}</span>
              <span style={{ width: 30, fontWeight: 600, color: listing.player.overall >= 70 ? '#4ade80' : '#fbbf24' }}>{listing.player.overall}</span>
              <span style={{ flex: 1, color: '#888' }}>{teamName(listing.fromTeamId)}</span>
              <span style={{ width: 50 }}>{listing.type === 'free' ? 'Free' : `£${(listing.askingPrice / 1_000_000).toFixed(1)}M`}</span>
              <button style={{ ...btnStyle, padding: '2px 8px', fontSize: 11 }} onClick={() => handleBid(listing)}>
                {listing.type === 'free' ? 'Sign' : 'Bid'}
              </button>
            </div>
          );
        }}
      />
    </div>
  );
}
